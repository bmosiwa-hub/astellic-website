"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { notifySubmitterOfFMAction, notifyFMOfCEOAction } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type LineItem = {
  item: string;
  description?: string;
  activityDate?: string;
  amount: number;
};

/** Staff / Consultant creates a new invoice or request */
export async function createSubmission(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const type = formData.get("type") as "INVOICE" | "REQUEST";
  const currency = (formData.get("currency") as string) || "MWK";
  const notes = (formData.get("notes") as string) || null;

  let totalAmount = 0;
  let lineItemsData: LineItem[] = [];

  if (type === "INVOICE") {
    const raw = formData.get("lineItems") as string;
    lineItemsData = raw ? (JSON.parse(raw) as LineItem[]) : [];
    totalAmount = lineItemsData.reduce((s, i) => s + Number(i.amount), 0);
  } else {
    totalAmount = parseFloat(formData.get("amount") as string) || 0;
  }

  const submission = await prisma.submission.create({
    data: {
      submittedBy: session.user.id!,
      type,
      currency,
      totalAmount,
      notes,

      // Invoice fields
      projectId: type === "INVOICE" ? (formData.get("projectId") as string) || null : null,
      milestone: type === "INVOICE" ? (formData.get("milestone") as string) || null : null,

      // Request fields
      purpose: type === "REQUEST" ? (formData.get("purpose") as string) || null : null,
      requestDate: type === "REQUEST" ? new Date(formData.get("requestDate") as string) : null,
      activityDate: type === "REQUEST" ? new Date(formData.get("activityDate") as string) : null,
      budgetLine: type === "REQUEST" ? (formData.get("budgetLine") as string) || null : null,

      lineItems: type === "INVOICE" && lineItemsData.length > 0 ? {
        create: lineItemsData.map((li) => ({
          item: li.item,
          description: li.description || null,
          activityDate: li.activityDate ? new Date(li.activityDate) : null,
          amount: Number(li.amount),
        })),
      } : undefined,
    },
  });

  await auditLog({
    userId: session.user.id!,
    action: "CREATE",
    entity: "Submission",
    entityId: submission.id,
    detail: `${type} submitted — ${currency} ${totalAmount}`,
  });

  revalidatePath("/astelfin_26/my/submissions");
  redirect("/astelfin_26/my/submissions");
}

/** Staff / Consultant resubmits after changes were requested */
export async function resubmitSubmission(submissionId: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const sub = await prisma.submission.findUniqueOrThrow({ where: { id: submissionId } });
  if (sub.submittedBy !== session.user.id!) redirect("/astelfin_26/my/submissions");

  const type = sub.type;
  const currency = (formData.get("currency") as string) || "MWK";
  const notes = (formData.get("notes") as string) || null;

  let totalAmount = 0;
  let lineItemsData: LineItem[] = [];

  if (type === "INVOICE") {
    const raw = formData.get("lineItems") as string;
    lineItemsData = raw ? (JSON.parse(raw) as LineItem[]) : [];
    totalAmount = lineItemsData.reduce((s, i) => s + Number(i.amount), 0);
  } else {
    totalAmount = parseFloat(formData.get("amount") as string) || 0;
  }

  // Determine where to send it back
  const lastFMReview = await prisma.submissionReview.findFirst({
    where: { submissionId, reviewerRole: "FM" },
    orderBy: { createdAt: "desc" },
  });
  const nextStatus = lastFMReview?.action === "CHANGES_REQUESTED" ? "PENDING_FM" : "PENDING_CEO";

  // Delete old line items and recreate
  await prisma.submissionItem.deleteMany({ where: { submissionId } });

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      status: nextStatus as "PENDING_FM" | "PENDING_CEO",
      currency,
      totalAmount,
      notes,
      projectId: type === "INVOICE" ? (formData.get("projectId") as string) || null : sub.projectId,
      milestone: type === "INVOICE" ? (formData.get("milestone") as string) || null : sub.milestone,
      purpose: type === "REQUEST" ? (formData.get("purpose") as string) || null : sub.purpose,
      requestDate: type === "REQUEST" ? new Date(formData.get("requestDate") as string) : sub.requestDate,
      activityDate: type === "REQUEST" ? new Date(formData.get("activityDate") as string) : sub.activityDate,
      budgetLine: type === "REQUEST" ? (formData.get("budgetLine") as string) || null : sub.budgetLine,
      lineItems: type === "INVOICE" && lineItemsData.length > 0 ? {
        create: lineItemsData.map((li) => ({
          item: li.item,
          description: li.description || null,
          activityDate: li.activityDate ? new Date(li.activityDate) : null,
          amount: Number(li.amount),
        })),
      } : undefined,
    },
  });

  await auditLog({
    userId: session.user.id!,
    action: "RESUBMIT",
    entity: "Submission",
    entityId: submissionId,
    detail: `Resubmitted after changes — ${currency} ${totalAmount}`,
  });

  revalidatePath("/astelfin_26/my/submissions");
  redirect(`/astelfin_26/my/submissions/${submissionId}`);
}

/** FM or CEO reviews a submission */
export async function reviewSubmission(
  submissionId: string,
  action: "APPROVED" | "CHANGES_REQUESTED" | "REJECTED",
  reviewerRole: "FM" | "CEO",
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const note = (formData.get("note") as string) || null;

  // Fetch submission + submitter email in one query
  const sub = await prisma.submission.findUniqueOrThrow({
    where: { id: submissionId },
    include: {
      submitter: { select: { name: true, email: true } },
    },
  });

  // Determine new status
  let newStatus: "PENDING_FM" | "FM_CHANGES_REQUESTED" | "PENDING_CEO" | "CEO_CHANGES_REQUESTED" | "APPROVED" | "REJECTED";

  if (reviewerRole === "FM") {
    if (action === "APPROVED") newStatus = "PENDING_CEO";
    else if (action === "CHANGES_REQUESTED") newStatus = "FM_CHANGES_REQUESTED";
    else newStatus = "REJECTED";
  } else {
    // CEO
    if (action === "APPROVED") newStatus = "APPROVED";
    else if (action === "CHANGES_REQUESTED") newStatus = "CEO_CHANGES_REQUESTED";
    else newStatus = "REJECTED";
  }

  await prisma.submissionReview.create({
    data: {
      submissionId,
      reviewedBy: session.user.id!,
      reviewerRole,
      action,
      note,
    },
  });

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: newStatus },
  });

  await auditLog({
    userId: session.user.id!,
    action: `${reviewerRole}_${action}`,
    entity: "Submission",
    entityId: submissionId,
    detail: note || undefined,
  });

  // ── Email notifications ──────────────────────────────────────────────────
  const submissionLabel =
    sub.type === "INVOICE"
      ? `Invoice${sub.milestone ? ` — ${sub.milestone}` : ""}`
      : `Expense Request${sub.purpose ? ` — ${sub.purpose}` : ""}`;

  if (action === "CHANGES_REQUESTED" || action === "REJECTED") {
    try {
      if (reviewerRole === "FM") {
        // FM acted → notify the submitter
        await notifySubmitterOfFMAction({
          to: sub.submitter.email,
          submitterName: sub.submitter.name,
          action,
          note,
          submissionId,
          submissionLabel,
        });
      } else {
        // CEO acted → notify all active Finance Managers
        const fms = await prisma.user.findMany({
          where: { role: "FINANCE_MANAGER", active: true },
          select: { email: true },
        });
        if (fms.length > 0) {
          await notifyFMOfCEOAction({
            to: fms.map((u) => u.email),
            submitterName: sub.submitter.name,
            action,
            note,
            submissionId,
            submissionLabel,
          });
        }
      }
    } catch (err) {
      // Email failure must never block the review action
      console.error("[reviewSubmission] email failed:", err);
    }
  }
  // ────────────────────────────────────────────────────────────────────────

  revalidatePath("/astelfin_26/invoices");
  revalidatePath(`/astelfin_26/invoices/${submissionId}`);
  revalidatePath(`/astelfin_26/my/submissions/${submissionId}`);
  redirect("/astelfin_26/invoices");
}

/** FM marks a CEO-approved submission as paid */
export async function markSubmissionPaid(submissionId: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user || session.user.role !== "FINANCE_MANAGER" && session.user.role !== "CEO") {
    redirect("/astelfin_26/login");
  }

  const paymentNote = (formData.get("paymentNote") as string) || null;

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: "PAID", notes: paymentNote ? `Payment note: ${paymentNote}` : undefined },
  });

  await auditLog({
    userId: session.user.id!,
    action: "PAID",
    entity: "Submission",
    entityId: submissionId,
    detail: paymentNote || "Marked as paid",
  });

  revalidatePath("/astelfin_26/invoices");
  redirect("/astelfin_26/invoices");
}
