"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { writeApprovalRecord } from "@/lib/approval-record";
import { assertNotSelfApproval } from "@/lib/self-approval";
import { notifySubmitterOfFMAction, notifyFMOfCEOAction, notifyFMOfNewSubmission, notifyCEOOfFMApproval } from "@/lib/mail";
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

  // If no active FM exists, skip straight to PENDING_CEO (FM bypass).
  // When an FM is hired and their account activated, this auto-reverts.
  const fms = await prisma.user.findMany({
    where:  { role: "FINANCE_MANAGER", active: true },
    select: { email: true },
  });
  const hasFM          = fms.length > 0;
  const initialStatus  = hasFM ? "PENDING_FM" : "PENDING_CEO";

  const submission = await prisma.submission.create({
    data: {
      submittedBy: session.user.id!,
      type,
      status: initialStatus,
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
    detail: `${type} submitted — ${currency} ${totalAmount}${!hasFM ? " (FM bypass: no active FM)" : ""}`,
  });

  // Email: notify FM if one exists, otherwise notify CEO directly
  try {
    const submissionLabel = type === "INVOICE" ? "Invoice" : "Expense Request";
    if (hasFM) {
      await notifyFMOfNewSubmission({
        to:            fms.map((u) => u.email),
        submitterName: session.user.name ?? "A team member",
        submissionId:  submission.id,
        submissionLabel,
        amount:        totalAmount,
        currency,
      });
    } else {
      // No FM — notify CEO directly so they know a submission is pending
      const ceos = await prisma.user.findMany({
        where:  { role: "CEO", active: true },
        select: { email: true },
      });
      if (ceos.length > 0) {
        await notifyCEOOfFMApproval({
          to:            ceos.map((u) => u.email),
          submitterName: session.user.name ?? "A team member",
          submissionId:  submission.id,
          submissionLabel,
          amount:        totalAmount,
          currency,
          fmNote:        "(No Finance Manager — submitted directly for CEO approval)",
        });
      }
    }
  } catch (err) {
    console.error("[createSubmission] notification email failed:", err);
  }

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

  // Determine where to send it back.
  // If no active FM exists, always go to PENDING_CEO (FM bypass).
  const activeFMCount = await prisma.user.count({ where: { role: "FINANCE_MANAGER", active: true } });
  const hasFMForResubmit = activeFMCount > 0;

  let nextStatus: "PENDING_FM" | "PENDING_CEO";
  if (!hasFMForResubmit) {
    nextStatus = "PENDING_CEO";
  } else {
    const lastFMReview = await prisma.submissionReview.findFirst({
      where: { submissionId, reviewerRole: "FM" },
      orderBy: { createdAt: "desc" },
    });
    nextStatus = lastFMReview?.action === "CHANGES_REQUESTED" ? "PENDING_FM" : "PENDING_CEO";
  }

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
  reviewerRole: "FM" | "CEO" | "CEO_BYPASS",
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

  // Self-approval check applies only to the final CEO approval (not FM stage or CEO bypass)
  if (action === "APPROVED" && reviewerRole === "CEO") {
    assertNotSelfApproval(session.user.id!, sub.submittedBy, "submission");
  }

  // Determine new status
  let newStatus: "PENDING_FM" | "FM_CHANGES_REQUESTED" | "PENDING_CEO" | "CEO_CHANGES_REQUESTED" | "APPROVED" | "REJECTED";

  if (reviewerRole === "FM") {
    if (action === "APPROVED") newStatus = "PENDING_CEO";
    else if (action === "CHANGES_REQUESTED") newStatus = "FM_CHANGES_REQUESTED";
    else newStatus = "REJECTED";
  } else if (reviewerRole === "CEO_BYPASS") {
    // CEO approves directly from PENDING_FM, bypassing FM stage
    if (action === "APPROVED") newStatus = "APPROVED";
    else newStatus = "REJECTED";
  } else {
    // CEO
    if (action === "APPROVED") newStatus = "APPROVED";
    else if (action === "CHANGES_REQUESTED") newStatus = "CEO_CHANGES_REQUESTED";
    else newStatus = "REJECTED";
  }

  const storedRole = reviewerRole === "CEO_BYPASS" ? "CEO" : reviewerRole;

  await prisma.submissionReview.create({
    data: {
      submissionId,
      reviewedBy: session.user.id!,
      reviewerRole: storedRole,
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

  await writeApprovalRecord({
    entityType:     "Submission",
    entityId:       submissionId,
    decidedById:    session.user.id!,
    decidedByEmail: session.user.email ?? "",
    decidedByName:  session.user.name  ?? "",
    decidedByRole:  session.user.role,
    previousStatus: sub.status,
    newStatus,
    decision:       action,
    comments:       note,
  });

  // ── Email notifications ──────────────────────────────────────────────────
  const submissionLabel =
    sub.type === "INVOICE"
      ? `Invoice${sub.milestone ? ` — ${sub.milestone}` : ""}`
      : `Expense Request${sub.purpose ? ` — ${sub.purpose}` : ""}`;

  try {
    if (reviewerRole === "FM" && action === "APPROVED") {
      // FM approved → notify all CEOs that the submission needs their sign-off
      const ceos = await prisma.user.findMany({
        where:  { role: "CEO", active: true },
        select: { email: true },
      });
      if (ceos.length > 0) {
        await notifyCEOOfFMApproval({
          to:               ceos.map((u) => u.email),
          submitterName:    sub.submitter.name,
          submissionId,
          submissionLabel,
          amount:           sub.totalAmount,
          currency:         sub.currency,
          fmNote:           note,
        });
      }
    } else if (action === "CHANGES_REQUESTED" || action === "REJECTED") {
      if (reviewerRole === "FM") {
        // FM requested changes/rejected → notify the submitter
        await notifySubmitterOfFMAction({
          to: sub.submitter.email,
          submitterName: sub.submitter.name,
          action,
          note,
          submissionId,
          submissionLabel,
        });
      } else {
        // CEO requested changes/rejected → notify all active Finance Managers
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
    }
  } catch (err) {
    // Email failure must never block the review action
    console.error("[reviewSubmission] email failed:", err);
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

  // Fetch submission with line items to calculate liquidation deadline
  const sub = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      lineItems: { select: { activityDate: true } },
      submitter: { select: { name: true } },
      project:   { select: { name: true } },
    },
  });

  // Determine liquidation deadline for REQUEST-type submissions only
  // Deadline = max(all activityDates) + 14 days
  let liquidationDeadline: Date | null = null;
  if (sub?.type === "REQUEST") {
    const dates: Date[] = [];
    if (sub.activityDate) dates.push(sub.activityDate);
    sub.lineItems.forEach((li) => { if (li.activityDate) dates.push(li.activityDate); });
    if (dates.length > 0) {
      const lastDay = new Date(Math.max(...dates.map((d) => d.getTime())));
      liquidationDeadline = new Date(lastDay);
      liquidationDeadline.setDate(liquidationDeadline.getDate() + 14);
    } else {
      // Fallback: 14 days from today if no activity dates
      liquidationDeadline = new Date();
      liquidationDeadline.setDate(liquidationDeadline.getDate() + 14);
    }
  }

  // Status change and expense record must land together — a paid submission
  // without its expense is exactly the balance-desync bug this fixes.
  await prisma.$transaction(async (tx) => {
    await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: "PAID",
        notes: paymentNote ? `Payment note: ${paymentNote}` : undefined,
        ...(liquidationDeadline ? { liquidationDeadline } : {}),
      },
    });

    // Record the cash outflow so the dashboard balance reflects this payment
    if (sub) {
      const label = sub.type === "INVOICE"
        ? `Invoice${sub.milestone ? ` — ${sub.milestone}` : ""}${sub.project?.name ? ` (${sub.project.name})` : ""}`
        : sub.purpose ?? "Expense Request";

      await tx.expense.create({
        data: {
          description: `${label} — ${sub.submitter.name}`,
          amount:      sub.totalAmount,
          currency:    sub.currency,
          category:    sub.type === "INVOICE" ? "Invoice" : (sub.budgetLine || "Operations"),
          paidDate:    new Date(),
          vendor:      sub.submitter.name,
          notes:       `Auto-generated from submission payment (Submission ID: ${submissionId})`,
        },
      });
    }
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
