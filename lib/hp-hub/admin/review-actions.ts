"use server";

/** Review queue actions: public submissions and feedback/requests. */
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hpAudit, requireHp } from "../auth";

const SUBMISSION_STATUSES = ["NEW", "IN_REVIEW", "ACCEPTED", "REJECTED", "DUPLICATE"] as const;

export async function updateSubmission(formData: FormData): Promise<void> {
  const actor = await requireHp("submission.review");
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as (typeof SUBMISSION_STATUSES)[number];
  if (!SUBMISSION_STATUSES.includes(status)) redirect(`/hp-hub/admin/submissions/${id}`);
  const reviewNotes = String(formData.get("reviewNotes") ?? "").trim().slice(0, 5000) || null;
  await prisma.hpSubmission.update({
    where: { id },
    data: { status, reviewNotes, reviewedById: actor.memberId, reviewedAt: new Date() },
  });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpSubmission", entityId: id, newValue: { status, reviewNotes } });
  redirect(`/hp-hub/admin/submissions/${id}?ok=${encodeURIComponent("Submission updated.")}`);
}

/** Records a suggested-but-unavailable document in the Missing Documents tracker. */
export async function submissionToTracker(formData: FormData): Promise<void> {
  const actor = await requireHp("submission.review");
  const id = String(formData.get("id"));
  const s = await prisma.hpSubmission.findUnique({ where: { id } });
  if (!s) redirect("/hp-hub/admin/submissions");
  const countryId = s.countryId ?? (await prisma.hpCountry.findFirst({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true } }))?.id;
  if (!countryId) redirect(`/hp-hub/admin/submissions/${id}?err=${encodeURIComponent("Add a country first.")}`);
  const type = s.documentTypeName ? await prisma.hpDocumentType.findFirst({ where: { name: { equals: s.documentTypeName, mode: "insensitive" } } }) : null;

  const item = await prisma.hpAcquisitionItem.create({
    data: {
      title: s.title,
      countryId,
      publisherName: s.publisherName,
      documentTypeId: type?.id,
      year: s.year,
      sourceUrl: s.sourceUrl,
      evidence: `Suggested by ${s.submitterName} via public submission on ${s.createdAt.toISOString().slice(0, 10)}.${s.info ? ` ${s.info}` : ""}`.slice(0, 5000),
      status: s.sourceUrl ? "NEEDS_VERIFICATION" : "MISSING",
      ownerId: actor.memberId,
    },
  });
  await prisma.hpSubmission.update({ where: { id }, data: { status: "IN_REVIEW", reviewedById: actor.memberId, reviewedAt: new Date() } });
  await hpAudit(actor, { action: "CREATE", entityType: "HpAcquisitionItem", entityId: item.id, detail: `From submission ${id}` });
  redirect(`/hp-hub/admin/tracker/${item.id}?ok=${encodeURIComponent("Added to the Missing Documents tracker.")}`);
}

export async function updateFeedback(formData: FormData): Promise<void> {
  const actor = await requireHp("feedback.review");
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["OPEN", "RESOLVED", "DISMISSED"].includes(status)) redirect("/hp-hub/admin/feedback");
  const resolution = String(formData.get("resolution") ?? "").trim().slice(0, 5000) || null;
  await prisma.hpFeedback.update({
    where: { id },
    data: {
      status: status as "OPEN",
      resolution,
      ...(status === "OPEN" ? { resolvedById: null, resolvedAt: null } : { resolvedById: actor.memberId, resolvedAt: new Date() }),
    },
  });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpFeedback", entityId: id, newValue: { status, resolution } });
  redirect(`/hp-hub/admin/feedback?ok=${encodeURIComponent("Updated.")}`);
}
