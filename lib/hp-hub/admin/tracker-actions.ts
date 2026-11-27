"use server";

/**
 * Missing Documents tracker and acquisition programme. Items are updated in
 * place (never duplicated); every change and outreach attempt is logged as an
 * activity so the correspondence history is kept.
 */
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hpAudit, requireHp } from "../auth";
import { ACQUISITION_LABELS, OUTREACH_LABELS } from "../constants";
import { ADMIN_MIME_TYPES, checkFileMeta, EVIDENCE_MAX_BYTES } from "../files";
import { verifyUpload } from "../storage";
import { acquisitionSchema, fieldErrors, parseDateOnly } from "../validation";
import { renderTemplate } from "../templates";

function back(id: string, q: string): never {
  redirect(`/hp-hub/admin/tracker/${id}?${q}`);
}
const enc = encodeURIComponent;

function readItem(formData: FormData) {
  const get = (k: string) => String(formData.get(k) ?? "");
  return acquisitionSchema.safeParse({
    title: get("title"),
    countryId: get("countryId"),
    publisherId: get("publisherId"),
    publisherName: get("publisherName"),
    documentTypeId: get("documentTypeId"),
    year: get("year"),
    evidence: get("evidence"),
    sourceUrl: get("sourceUrl"),
    status: get("status") || "MISSING",
    unavailableReason: get("unavailableReason"),
    lastVerifiedAt: get("lastVerifiedAt"),
    ownerId: get("ownerId"),
    nextAction: get("nextAction"),
    nextActionDue: get("nextActionDue"),
    notes: get("notes"),
  });
}

function itemData(d: ReturnType<typeof readItem> & { success: true }) {
  const v = d.data;
  return {
    title: v.title,
    countryId: v.countryId,
    publisherId: v.publisherId,
    publisherName: v.publisherName,
    documentTypeId: v.documentTypeId,
    year: v.year,
    evidence: v.evidence,
    sourceUrl: v.sourceUrl,
    status: v.status,
    unavailableReason: v.unavailableReason,
    lastVerifiedAt: parseDateOnly(v.lastVerifiedAt),
    ownerId: v.ownerId,
    nextAction: v.nextAction,
    nextActionDue: parseDateOnly(v.nextActionDue),
    notes: v.notes,
  };
}

export async function createAcquisition(formData: FormData): Promise<void> {
  const actor = await requireHp("acquisition.edit");
  const parsed = readItem(formData);
  if (!parsed.success) redirect(`/hp-hub/admin/tracker/new?err=${enc(Object.values(fieldErrors(parsed.error)).join(" "))}`);

  // Guard against duplicates: same title in the same country.
  const dup = await prisma.hpAcquisitionItem.findFirst({
    where: { countryId: parsed.data.countryId, title: { equals: parsed.data.title, mode: "insensitive" } },
    select: { id: true },
  });
  if (dup) back(dup.id, `err=${enc("This document is already in the tracker; update this record instead.")}`);

  const item = await prisma.hpAcquisitionItem.create({ data: { ...itemData(parsed), ownerId: parsed.data.ownerId ?? actor.memberId } });
  await prisma.hpAcquisitionActivity.create({ data: { itemId: item.id, kind: "STATUS_CHANGE", body: `Record created as “${ACQUISITION_LABELS[item.status]}”.`, authorId: actor.memberId } });
  await hpAudit(actor, { action: "CREATE", entityType: "HpAcquisitionItem", entityId: item.id, newValue: item });
  back(item.id, `ok=${enc("Added to the tracker.")}`);
}

/**
 * Records a document found through Discovery in the tracker as "needs
 * verification" (found online; not yet checked or catalogued), with the
 * source as evidence. Returns to the same search results.
 */
export async function addDiscoveredToTracker(formData: FormData): Promise<void> {
  const actor = await requireHp("acquisition.edit");
  const get = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max);
  const rawBack = get("back", 2000);
  const back = rawBack.startsWith("/hp-hub/admin/discover") ? rawBack : "/hp-hub/admin/discover";
  const sep = back.includes("?") ? "&" : "?";
  const title = get("title", 500);
  const countryId = get("countryId", 60);
  const sourceUrl = get("sourceUrl", 2000);
  if (!title || !countryId) redirect(`${back}${sep}err=${enc("Choose a country before adding to the tracker.")}`);
  if (!(await prisma.hpCountry.count({ where: { id: countryId } }))) redirect(`${back}${sep}err=${enc("Unknown country.")}`);

  const dup = await prisma.hpAcquisitionItem.findFirst({
    where: { countryId, OR: [{ title: { equals: title, mode: "insensitive" } }, ...(sourceUrl ? [{ sourceUrl }] : [])] },
    select: { id: true },
  });
  if (dup) redirect(`${back}${sep}err=${enc("That document is already in the tracker.")}`);

  const year = Number(get("year", 4));
  const docTypeId = get("documentTypeId", 60) || null;
  const item = await prisma.hpAcquisitionItem.create({
    data: {
      title,
      countryId,
      publisherName: get("publisher", 300) || null,
      documentTypeId: docTypeId && (await prisma.hpDocumentType.count({ where: { id: docTypeId } })) ? docTypeId : null,
      year: Number.isInteger(year) && year > 1900 ? year : null,
      sourceUrl: sourceUrl.startsWith("https://") ? sourceUrl : null,
      evidence: get("evidence", 5000) || null,
      status: "NEEDS_VERIFICATION",
      lastVerifiedAt: new Date(),
      ownerId: actor.memberId,
      nextAction: "Check this is the official, current version, then catalogue it",
    },
  });
  await prisma.hpAcquisitionActivity.create({
    data: { itemId: item.id, kind: "EVIDENCE", body: get("evidence", 5000) || `Found online: ${sourceUrl}`, authorId: actor.memberId },
  });
  await hpAudit(actor, { action: "CREATE", entityType: "HpAcquisitionItem", entityId: item.id, detail: "Added from Discovery search" });
  redirect(`${back}${sep}ok=${enc(`Added “${title.slice(0, 80)}” to the tracker.`)}`);
}

export async function updateAcquisition(formData: FormData): Promise<void> {
  const actor = await requireHp("acquisition.edit");
  const id = String(formData.get("id"));
  const before = await prisma.hpAcquisitionItem.findUnique({ where: { id } });
  if (!before) redirect("/hp-hub/admin/tracker");
  const parsed = readItem(formData);
  if (!parsed.success) back(id, `err=${enc(Object.values(fieldErrors(parsed.error)).join(" "))}`);

  const data = itemData(parsed);
  const after = await prisma.hpAcquisitionItem.update({ where: { id }, data });
  if (before.status !== after.status) {
    await prisma.hpAcquisitionActivity.create({
      data: { itemId: id, kind: "STATUS_CHANGE", body: `Status: ${ACQUISITION_LABELS[before.status]} → ${ACQUISITION_LABELS[after.status]}`, authorId: actor.memberId },
    });
  }
  await hpAudit(actor, { action: "UPDATE", entityType: "HpAcquisitionItem", entityId: id, previousValue: before, newValue: after });
  back(id, `ok=${enc("Saved.")}`);
}

/** Notes, evidence (optionally with a file), outreach attempts and follow-up tasks. */
export async function addActivity(formData: FormData): Promise<void> {
  const actor = await requireHp("acquisition.edit");
  const itemId = String(formData.get("itemId"));
  const kind = String(formData.get("kind"));
  const body = String(formData.get("body") ?? "").trim().slice(0, 10000);
  if (!["NOTE", "OUTREACH", "EVIDENCE", "TASK"].includes(kind)) back(itemId, "err=Unknown%20activity");
  if (!body) back(itemId, `err=${enc("Write something first.")}`);
  const dueAt = kind === "TASK" ? parseDateOnly(String(formData.get("dueAt") ?? "")) : null;

  let attachment: { attachmentPath: string; attachmentName: string } | null = null;
  const fileUrl = String(formData.get("evidenceUrl") ?? "");
  if (fileUrl) {
    const name = String(formData.get("evidenceName") ?? "evidence");
    const meta = checkFileMeta({ name, size: 1, type: null }, { allowed: ADMIN_MIME_TYPES, maxBytes: EVIDENCE_MAX_BYTES });
    if (!meta.ok) back(itemId, `err=${enc(meta.error)}`);
    const v = await verifyUpload(fileUrl, { area: "evidence", mime: (meta as { mime: string }).mime, maxBytes: EVIDENCE_MAX_BYTES });
    if (!v.ok) back(itemId, `err=${enc(v.error)}`);
    attachment = { attachmentPath: (v as { file: { path: string } }).file.path, attachmentName: name.slice(0, 250) };
  }

  await prisma.hpAcquisitionActivity.create({
    data: { itemId, kind: kind as "NOTE", body, dueAt, authorId: actor.memberId, ...(attachment ?? {}) },
  });
  // A new task becomes the item's next follow-up if it's sooner than the current one.
  if (kind === "TASK" && dueAt) {
    const item = await prisma.hpAcquisitionItem.findUnique({ where: { id: itemId }, select: { nextActionDue: true } });
    if (!item?.nextActionDue || dueAt < item.nextActionDue) {
      await prisma.hpAcquisitionItem.update({ where: { id: itemId }, data: { nextAction: body.slice(0, 1000), nextActionDue: dueAt } });
    }
  }
  if (kind === "EVIDENCE") await prisma.hpAcquisitionItem.update({ where: { id: itemId }, data: { lastVerifiedAt: new Date() } });
  await hpAudit(actor, { action: "CREATE", entityType: "HpAcquisitionActivity", entityId: itemId, detail: `${kind}: ${body.slice(0, 200)}` });
  back(itemId, `ok=${enc("Added.")}#activity`);
}

export async function completeTask(formData: FormData): Promise<void> {
  const actor = await requireHp("acquisition.edit");
  const id = String(formData.get("id"));
  const task = await prisma.hpAcquisitionActivity.update({ where: { id }, data: { completedAt: new Date() } });
  // Move the item's follow-up to the next open task, if any.
  const nextTask = await prisma.hpAcquisitionActivity.findFirst({
    where: { itemId: task.itemId, kind: "TASK", completedAt: null, dueAt: { not: null } },
    orderBy: { dueAt: "asc" },
  });
  await prisma.hpAcquisitionItem.update({
    where: { id: task.itemId },
    data: nextTask ? { nextAction: nextTask.body.slice(0, 1000), nextActionDue: nextTask.dueAt } : { nextAction: null, nextActionDue: null },
  });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpAcquisitionActivity", entityId: id, detail: "Task completed" });
  back(task.itemId, `ok=${enc("Task completed.")}#activity`);
}

/** Links the tracker record to its catalogued repository document and marks it acquired. */
export async function linkAcquisitionDocument(formData: FormData): Promise<void> {
  const actor = await requireHp("acquisition.edit");
  const id = String(formData.get("id"));
  const target = String(formData.get("document") ?? "").trim();
  if (!target) {
    await prisma.hpAcquisitionItem.update({ where: { id }, data: { documentId: null } });
    back(id, `ok=${enc("Document link removed.")}`);
  }
  const doc = await prisma.hpDocument.findFirst({ where: { OR: [{ id: target }, { slug: target }] }, select: { id: true, acquisition: { select: { id: true } } } });
  if (!doc) back(id, `err=${enc("No document with that slug or ID.")}`);
  if (doc.acquisition && doc.acquisition.id !== id) back(id, `err=${enc("That document is already linked to another tracker record.")}`);
  await prisma.hpAcquisitionItem.update({ where: { id }, data: { documentId: doc.id, status: "ACQUIRED" } });
  await prisma.hpAcquisitionActivity.create({ data: { itemId: id, kind: "STATUS_CHANGE", body: "Linked to the repository record and marked acquired.", authorId: actor.memberId } });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpAcquisitionItem", entityId: id, detail: `Linked document ${doc.id}` });
  back(id, `ok=${enc("Linked and marked acquired.")}`);
}

// ── Outreach (acquisition requests) ──────────────────────────────────────────

const RECIPIENTS = ["MINISTRY", "GOVERNMENT_INSTITUTION", "RESEARCHER", "UNIVERSITY", "NGO", "DONOR", "IMPLEMENTING_PARTNER", "OTHER"] as const;
const OUTREACH = Object.keys(OUTREACH_LABELS) as (keyof typeof OUTREACH_LABELS)[];
const PERMISSIONS = ["UNKNOWN", "NOT_REQUIRED", "REQUESTED", "GRANTED", "OPEN_LICENSE", "DENIED"] as const;

export async function createOutreach(formData: FormData): Promise<void> {
  const actor = await requireHp("outreach.manage");
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const itemId = get("itemId") || null;
  const recipientType = get("recipientType") as (typeof RECIPIENTS)[number];
  const recipientEmail = get("recipientEmail").toLowerCase() || null;
  if (!get("recipientName") || !get("recipientOrg")) redirect(`/hp-hub/admin/outreach/new?itemId=${itemId ?? ""}&err=${enc("Recipient name and organisation are required.")}`);
  if (recipientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) redirect(`/hp-hub/admin/outreach/new?itemId=${itemId ?? ""}&err=${enc("Check the email address.")}`);

  let subject = get("subject");
  let body = get("body");
  const templateId = get("templateId") || null;
  if (templateId && (!subject || !body)) {
    const t = await prisma.hpRequestTemplate.findUnique({ where: { id: templateId } });
    const item = itemId ? await prisma.hpAcquisitionItem.findUnique({ where: { id: itemId }, include: { publisher: true } }) : null;
    if (t) {
      const vars = {
        title: item?.title ?? "",
        publisher: item?.publisher?.name ?? item?.publisherName ?? "",
        year: item?.year ? String(item.year) : "n.d.",
        recipient: get("recipientName"),
        sender: actor.name,
      };
      subject ||= renderTemplate(t.subject, vars);
      body ||= renderTemplate(t.body, vars);
    }
  }
  if (!subject || !body) redirect(`/hp-hub/admin/outreach/new?itemId=${itemId ?? ""}&err=${enc("Choose a template or write the subject and message.")}`);

  const req = await prisma.hpOutreachRequest.create({
    data: {
      itemId,
      templateId,
      recipientName: get("recipientName").slice(0, 200),
      recipientOrg: get("recipientOrg").slice(0, 300),
      recipientEmail,
      recipientType: RECIPIENTS.includes(recipientType) ? recipientType : "OTHER",
      subject: subject.slice(0, 300),
      body: body.slice(0, 20000),
      reminderDueAt: parseDateOnly(get("reminderDueAt")),
      createdById: actor.memberId,
    },
  });
  await hpAudit(actor, { action: "CREATE", entityType: "HpOutreachRequest", entityId: req.id });
  redirect(`/hp-hub/admin/outreach/${req.id}?ok=${enc("Request drafted. Send it from your email, then mark it as sent.")}`);
}

export async function updateOutreach(formData: FormData): Promise<void> {
  const actor = await requireHp("outreach.manage");
  const id = String(formData.get("id"));
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const before = await prisma.hpOutreachRequest.findUnique({ where: { id } });
  if (!before) redirect("/hp-hub/admin/outreach");
  const intent = get("intent");

  let data: Parameters<typeof prisma.hpOutreachRequest.update>[0]["data"] = {};
  let activity: string | null = null;
  if (intent === "sent") {
    const sentAt = parseDateOnly(get("sentAt")) ?? new Date();
    const reminder = parseDateOnly(get("reminderDueAt")) ?? new Date(sentAt.getTime() + 14 * 86400000);
    data = { status: "AWAITING_RESPONSE", sentAt, reminderDueAt: reminder };
    activity = `Request sent to ${before.recipientName} (${before.recipientOrg}).`;
  } else if (intent === "reminder") {
    data = { remindersSent: { increment: 1 }, reminderDueAt: parseDateOnly(get("reminderDueAt")) ?? new Date(Date.now() + 14 * 86400000) };
    activity = `Reminder sent to ${before.recipientName}.`;
  } else if (intent === "response") {
    const status = get("status") as (typeof OUTREACH)[number];
    const perm = get("permissionOutcome") as (typeof PERMISSIONS)[number];
    data = {
      status: OUTREACH.includes(status) ? status : "RESPONDED",
      responseAt: parseDateOnly(get("responseAt")) ?? new Date(),
      responseSummary: get("responseSummary").slice(0, 5000) || null,
      permissionOutcome: PERMISSIONS.includes(perm) ? perm : null,
      outcome: get("outcome").slice(0, 2000) || null,
      reminderDueAt: null,
    };
    activity = `Response from ${before.recipientName}: ${OUTREACH_LABELS[(data.status as keyof typeof OUTREACH_LABELS) ?? "RESPONDED"]}.${get("responseSummary") ? ` ${get("responseSummary").slice(0, 500)}` : ""}`;
  } else {
    redirect(`/hp-hub/admin/outreach/${id}`);
  }

  await prisma.hpOutreachRequest.update({ where: { id }, data });
  if (before.itemId && activity) {
    await prisma.hpAcquisitionActivity.create({ data: { itemId: before.itemId, kind: "OUTREACH", body: activity, authorId: actor.memberId } });
    // Permission outcomes update the tracker status where it's unambiguous.
    if (intent === "response" && (data.permissionOutcome === "GRANTED" || data.permissionOutcome === "OPEN_LICENSE") && data.status === "DOCUMENT_RECEIVED") {
      await prisma.hpAcquisitionItem.update({ where: { id: before.itemId }, data: { status: "ACQUIRED" } });
    } else if (intent === "response" && data.permissionOutcome === "REQUESTED") {
      await prisma.hpAcquisitionItem.update({ where: { id: before.itemId }, data: { status: "PERMISSION_REQUIRED" } });
    }
  }
  await hpAudit(actor, { action: "UPDATE", entityType: "HpOutreachRequest", entityId: id, detail: intent });
  redirect(`/hp-hub/admin/outreach/${id}?ok=${enc("Updated.")}`);
}

export async function saveTemplate(formData: FormData): Promise<void> {
  const actor = await requireHp("outreach.manage");
  const id = String(formData.get("id") ?? "") || null;
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const subject = String(formData.get("subject") ?? "").trim().slice(0, 300);
  const body = String(formData.get("body") ?? "").trim().slice(0, 20000);
  if (!name || !subject || !body) redirect(`/hp-hub/admin/outreach/templates?err=${enc("Name, subject and message are required.")}`);
  const clash = await prisma.hpRequestTemplate.findFirst({ where: { name, ...(id ? { id: { not: id } } : {}) } });
  if (clash) redirect(`/hp-hub/admin/outreach/templates?err=${enc("A template with that name exists.")}`);
  const t = id
    ? await prisma.hpRequestTemplate.update({ where: { id }, data: { name, subject, body } })
    : await prisma.hpRequestTemplate.create({ data: { name, subject, body } });
  await hpAudit(actor, { action: id ? "UPDATE" : "CREATE", entityType: "HpRequestTemplate", entityId: t.id });
  redirect(`/hp-hub/admin/outreach/templates?ok=${enc("Template saved.")}`);
}
