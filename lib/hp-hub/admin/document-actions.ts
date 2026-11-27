"use server";

/**
 * Admin server actions for repository documents. Every action re-checks the
 * member's role in the database (requireHp) and writes an audit event.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hpAudit, requireHp } from "../auth";
import { auditSnapshot, createDocument, refreshSearchIndex, updateDocument, type FileFields } from "../documents";
import { ADMIN_MAX_BYTES, ADMIN_MIME_TYPES, checkFileMeta } from "../files";
import { can, canEditDocument, canTransition } from "../permissions";
import { deleteFile, verifyUpload } from "../storage";
import { documentInputSchema, fieldErrors, type FieldErrors } from "../validation";
import { HOSTABLE_PERMISSIONS } from "../constants";

export interface DocFormState {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
}

function revalidatePublic(slug?: string) {
  revalidatePath("/hp-hub", "layout");
  if (slug) revalidatePath(`/hp-hub/documents/${slug}`);
}

async function verifiedFile(formData: FormData): Promise<{ file: FileFields | null; error?: string }> {
  const url = String(formData.get("fileUrl") ?? "");
  const name = String(formData.get("fileName") ?? "");
  if (!url) return { file: null };
  const meta = checkFileMeta({ name, size: 1, type: null }, { allowed: ADMIN_MIME_TYPES, maxBytes: ADMIN_MAX_BYTES });
  if (!meta.ok) return { file: null, error: meta.error };
  const v = await verifyUpload(url, { area: "documents", mime: meta.mime, maxBytes: ADMIN_MAX_BYTES });
  if (!v.ok) return { file: null, error: v.error };
  return { file: { storageProvider: v.file.provider, storagePath: v.file.path, fileName: name.slice(0, 250), fileType: v.file.contentType, fileSize: v.file.size } };
}

function readInput(formData: FormData, hasFile: boolean) {
  return documentInputSchema.safeParse({
    title: formData.get("title") ?? "",
    countryId: formData.get("countryId") ?? "",
    documentTypeId: formData.get("documentTypeId") ?? "",
    publisherId: formData.get("publisherId") === "__new" ? "" : (formData.get("publisherId") ?? ""),
    newPublisherName: formData.get("publisherId") === "__new" ? (formData.get("newPublisherName") ?? "") : "",
    publicationYear: formData.get("publicationYear") ?? "",
    publicationDate: formData.get("publicationDate") ?? "",
    startYear: formData.get("startYear") ?? "",
    endYear: formData.get("endYear") ?? "",
    authors: formData.get("authors") ?? "",
    description: formData.get("description") ?? "",
    abstract: formData.get("abstract") ?? "",
    language: formData.get("language") ?? "",
    version: formData.get("version") ?? "",
    edition: formData.get("edition") ?? "",
    themeIds: formData.getAll("themeIds").map(String),
    primaryThemeId: formData.get("primaryThemeId") ?? "",
    keywords: formData.get("keywords") ?? "",
    sourceUrl: formData.get("sourceUrl") ?? "",
    citationText: formData.get("citationText") ?? "",
    notes: formData.get("notes") ?? "",
    accessType: formData.get("accessType") ?? "",
    permissionStatus: formData.get("permissionStatus") ?? "",
    rightsHolder: formData.get("rightsHolder") ?? "",
    rightsStatement: formData.get("rightsStatement") ?? "",
    verificationStatus: formData.get("verificationStatus") || "UNVERIFIED",
    verificationNotes: formData.get("verificationNotes") ?? "",
    isFeatured: formData.get("isFeatured") === "on",
    hasFile,
  });
}

export async function saveDocument(_prev: DocFormState, formData: FormData): Promise<DocFormState> {
  let actor;
  try {
    actor = await requireHp("document.create");
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
  const id = String(formData.get("id") ?? "") || null;
  const intent = String(formData.get("intent") ?? "save");
  const removeFile = formData.get("removeFile") === "on";

  const existing = id ? await prisma.hpDocument.findUnique({ where: { id } }) : null;
  if (id && !existing) return { ok: false, message: "This document no longer exists." };
  if (existing && !canEditDocument(actor.role, actor.memberId, existing)) {
    return { ok: false, message: "You can only edit your own drafts. Ask an editor to make this change." };
  }

  const verified = await verifiedFile(formData);
  if (verified.error) return { ok: false, errors: { file: verified.error }, message: "The file couldn't be accepted." };
  let file = verified.file;

  // Creating a record from a public submission: optionally reuse its file.
  const submissionId = !existing ? String(formData.get("submissionId") ?? "") || null : null;
  const submission = submissionId && can(actor.role, "submission.review") ? await prisma.hpSubmission.findUnique({ where: { id: submissionId } }) : null;
  if (!file && submission?.storagePath && formData.get("useSubmissionFile") === "on") {
    file = {
      storageProvider: submission.storageProvider ?? "vercel-blob",
      storagePath: submission.storagePath,
      fileName: submission.fileName ?? "submission",
      fileType: submission.fileType ?? "application/pdf",
      fileSize: submission.fileSize ?? 0,
    };
  }
  const fileIsShared = !!submission && file?.storagePath === submission.storagePath;
  const hasFile = !!file || (!!existing?.storagePath && !removeFile);

  const parsed = readInput(formData, hasFile);
  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error), message: "Please correct the highlighted fields." };
  }
  const input = parsed.data;

  // Fields only some roles may set.
  if (!can(actor.role, "document.verify")) {
    input.verificationStatus = existing?.verificationStatus ?? "UNVERIFIED";
    input.verificationNotes = existing?.verificationNotes ?? null;
  }
  if (!can(actor.role, "document.publish")) input.isFeatured = existing?.isFeatured ?? false;

  // A published record must remain publishable after the edit.
  if (existing?.status === "PUBLISHED" && input.accessType === "HOSTED" && !hasFile) {
    return { ok: false, errors: { accessType: "A published hosted record needs its file" } };
  }

  let savedId: string;
  try {
    if (!existing) {
      const doc = await createDocument(input, { createdById: actor.memberId, file });
      await hpAudit(actor, { action: "CREATE", entityType: "HpDocument", entityId: doc.id, newValue: await auditSnapshot(doc.id) });
      if (submission) {
        await prisma.hpSubmission.update({
          where: { id: submission.id },
          data: { status: "ACCEPTED", documentId: doc.id, reviewedById: actor.memberId, reviewedAt: new Date() },
        });
        await hpAudit(actor, { action: "APPROVE", entityType: "HpSubmission", entityId: submission.id, detail: `Catalogued as document ${doc.id}` });
      }
      revalidatePath("/hp-hub/admin/documents");
      savedId = doc.id;
    } else {
      const before = await auditSnapshot(existing.id);
      const res = await updateDocument(existing.id, input, {
        replacedById: actor.memberId,
        newFile: file,
        removeFile: removeFile && !file,
        versionNote: String(formData.get("versionNote") ?? "").slice(0, 500) || null,
      });
      await hpAudit(actor, {
        action: "UPDATE",
        entityType: "HpDocument",
        entityId: existing.id,
        previousValue: before,
        newValue: await auditSnapshot(existing.id),
        detail: file ? "File replaced (previous file kept as a version)" : removeFile ? "File removed (kept as a version)" : undefined,
      });
      revalidatePublic(res.slug);
      savedId = existing.id;
    }
  } catch (e) {
    console.error("[hp-hub] saveDocument failed", e);
    // Keep the uploaded file so the user can simply press Save again.
    const known = e instanceof Error && /no longer exists/.test(e.message);
    return { ok: false, message: known ? (e as Error).message : "The document could not be saved. Please try again; your entries and file are kept." };
  }

  if (intent === "another") redirect(`/hp-hub/admin/documents/new?from=${savedId}&ok=${encodeURIComponent(`Saved “${input.title}”.`)}`);
  redirect(`/hp-hub/admin/documents/${savedId}?ok=${encodeURIComponent(existing ? "Changes saved." : "Document created as a draft.")}`);
}

/** Publication workflow: DRAFT ⇄ PENDING_REVIEW → PUBLISHED ⇄ ARCHIVED. */
export async function changeStatus(formData: FormData): Promise<void> {
  const actor = await requireHp("document.create");
  const id = String(formData.get("id"));
  const to = String(formData.get("to")) as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "ARCHIVED";
  const doc = await prisma.hpDocument.findUnique({ where: { id } });
  if (!doc) redirect("/hp-hub/admin/documents");
  const back = (q: string) => redirect(`/hp-hub/admin/documents/${id}?${q}`);

  if (!["DRAFT", "PENDING_REVIEW", "PUBLISHED", "ARCHIVED"].includes(to)) back("err=Unknown%20status");
  if (!canTransition(actor.role, doc.status, to)) back(`err=${encodeURIComponent("Your role can't make that change.")}`);
  if (!can(actor.role, "document.editAny") && doc.createdById !== actor.memberId) back(`err=${encodeURIComponent("You can only submit your own drafts.")}`);

  if (to === "PUBLISHED") {
    const problems: string[] = [];
    if (doc.accessType === "HOSTED") {
      if (!doc.storagePath) problems.push("hosted records need a file");
      if (!(HOSTABLE_PERMISSIONS as readonly string[]).includes(doc.permissionStatus)) problems.push("hosting needs permission granted or an open licence");
    }
    if (doc.accessType === "EXTERNAL" && !doc.sourceUrl) problems.push("external records need a source URL");
    if (doc.isSynthetic && process.env.VERCEL_ENV === "production") problems.push("synthetic test records can't be published in production");
    if (problems.length) back(`err=${encodeURIComponent(`Can't publish: ${problems.join("; ")}.`)}`);
  }

  await prisma.hpDocument.update({
    where: { id },
    data: { status: to, ...(to === "PUBLISHED" && !doc.publishedAt ? { publishedAt: new Date() } : {}) },
  });
  await hpAudit(actor, { action: to === "PUBLISHED" ? "APPROVE" : "UPDATE", entityType: "HpDocument", entityId: id, previousValue: { status: doc.status }, newValue: { status: to }, changedFields: ["status"] });
  revalidatePublic(doc.slug);
  back(`ok=${encodeURIComponent(`Status changed to ${to.replace("_", " ").toLowerCase()}.`)}`);
}

export async function setVerification(formData: FormData): Promise<void> {
  const actor = await requireHp("document.verify");
  const id = String(formData.get("id"));
  const status = String(formData.get("verificationStatus"));
  if (!["UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "DISPUTED"].includes(status)) redirect(`/hp-hub/admin/documents/${id}`);
  const notes = String(formData.get("verificationNotes") ?? "").trim().slice(0, 2000) || null;
  const doc = await prisma.hpDocument.update({
    where: { id },
    data: { verificationStatus: status as "VERIFIED", verificationNotes: notes },
    select: { slug: true },
  });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpDocument", entityId: id, newValue: { verificationStatus: status, verificationNotes: notes }, changedFields: ["verificationStatus"] });
  revalidatePublic(doc.slug);
  redirect(`/hp-hub/admin/documents/${id}?ok=${encodeURIComponent("Verification updated.")}`);
}

export async function setSuperseded(formData: FormData): Promise<void> {
  const actor = await requireHp("document.editAny");
  const id = String(formData.get("id"));
  const target = String(formData.get("supersededBy") ?? "").trim();
  let supersededById: string | null = null;
  if (target) {
    const t = await prisma.hpDocument.findFirst({ where: { OR: [{ id: target }, { slug: target }] }, select: { id: true } });
    if (!t || t.id === id) redirect(`/hp-hub/admin/documents/${id}?err=${encodeURIComponent("Choose another existing document.")}`);
    supersededById = t.id;
  }
  const doc = await prisma.hpDocument.update({ where: { id }, data: { supersededById }, select: { slug: true } });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpDocument", entityId: id, newValue: { supersededById }, changedFields: ["supersededById"] });
  revalidatePublic(doc.slug);
  redirect(`/hp-hub/admin/documents/${id}?ok=${encodeURIComponent(supersededById ? "Marked as superseded." : "Supersession cleared.")}`);
}

export async function addRelated(formData: FormData): Promise<void> {
  const actor = await requireHp("document.editAny");
  const id = String(formData.get("id"));
  const target = String(formData.get("related") ?? "").trim();
  const t = await prisma.hpDocument.findFirst({ where: { OR: [{ id: target }, { slug: target }] }, select: { id: true } });
  if (!t || t.id === id) redirect(`/hp-hub/admin/documents/${id}?err=${encodeURIComponent("Choose another existing document.")}`);
  await prisma.hpRelatedDocument.createMany({ data: [{ documentId: id, relatedId: t.id }, { documentId: t.id, relatedId: id }], skipDuplicates: true });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpDocument", entityId: id, detail: `Related document added: ${t.id}` });
  revalidatePublic();
  redirect(`/hp-hub/admin/documents/${id}?ok=${encodeURIComponent("Related document linked.")}`);
}

export async function removeRelated(formData: FormData): Promise<void> {
  const actor = await requireHp("document.editAny");
  const id = String(formData.get("id"));
  const relatedId = String(formData.get("relatedId"));
  await prisma.hpRelatedDocument.deleteMany({
    where: { OR: [{ documentId: id, relatedId }, { documentId: relatedId, relatedId: id }] },
  });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpDocument", entityId: id, detail: `Related document removed: ${relatedId}` });
  revalidatePublic();
  redirect(`/hp-hub/admin/documents/${id}?ok=${encodeURIComponent("Link removed.")}`);
}

/** Permanent delete. Published records must be archived first. */
export async function deleteDocument(formData: FormData): Promise<void> {
  const actor = await requireHp("document.delete");
  const id = String(formData.get("id"));
  const confirm = String(formData.get("confirm") ?? "");
  const doc = await prisma.hpDocument.findUnique({ where: { id }, include: { versions: true } });
  if (!doc) redirect("/hp-hub/admin/documents");
  if (doc.status === "PUBLISHED") redirect(`/hp-hub/admin/documents/${id}?err=${encodeURIComponent("Archive or unpublish the document before deleting it.")}`);
  if (confirm !== "DELETE") redirect(`/hp-hub/admin/documents/${id}?err=${encodeURIComponent("Type DELETE to confirm.")}`);

  const before = await auditSnapshot(id);
  await prisma.hpDocument.delete({ where: { id } });
  await deleteFile(doc.storageProvider, doc.storagePath);
  for (const v of doc.versions) await deleteFile(v.storageProvider, v.storagePath);
  await hpAudit(actor, { action: "DELETE", entityType: "HpDocument", entityId: id, previousValue: before });
  revalidatePublic(doc.slug);
  redirect(`/hp-hub/admin/documents?ok=${encodeURIComponent(`Deleted “${doc.title}”.`)}`);
}

export async function rebuildSearchIndex(): Promise<void> {
  const actor = await requireHp("taxonomy.manage");
  const ids = await prisma.hpDocument.findMany({ select: { id: true } });
  for (const { id } of ids) await refreshSearchIndex(prisma, id);
  await hpAudit(actor, { action: "UPDATE", entityType: "HpDocument", detail: `Search index rebuilt for ${ids.length} documents` });
  redirect(`/hp-hub/admin/taxonomy?ok=${encodeURIComponent(`Search index rebuilt for ${ids.length} documents.`)}`);
}
