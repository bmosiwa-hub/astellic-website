"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { writeApprovalRecord } from "@/lib/approval-record";
import { assertNotSelfApproval } from "@/lib/self-approval";
import { sendMail, escapeHtml } from "@/lib/mail";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://astellic.com";

/** Staff / Consultant submits a liquidation */
export async function createLiquidation(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const submissionId   = formData.get("submissionId") as string;
  const liquidationDate = new Date(formData.get("liquidationDate") as string);
  const activity       = formData.get("activity") as string;
  const budgetLine     = (formData.get("budgetLine") as string).trim();
  const fundsReceived  = parseFloat(formData.get("fundsReceived") as string);
  const fundsAccountedFor = parseFloat(formData.get("fundsAccountedFor") as string);
  const currency       = (formData.get("currency") as string) || "MWK";
  const refundRequired = fundsReceived - fundsAccountedFor;

  const liq = await prisma.liquidation.create({
    data: {
      submissionId,
      submittedBy: session.user.id!,
      liquidationDate,
      activity,
      budgetLine,
      fundsReceived,
      fundsAccountedFor,
      refundRequired,
      currency,
    },
  });

  // Process document uploads
  const docTypes = [
    { field: "receipts",           type: "RECEIPT" },
    { field: "refundProof",        type: "REFUND_PROOF" },
    { field: "overExpenditureProof", type: "OVER_EXPENDITURE_PROOF" },
    { field: "priorApprovalProof", type: "PRIOR_APPROVAL_PROOF" },
  ] as const;

  for (const { field, type: docType } of docTypes) {
    const files = formData.getAll(field) as File[];
    for (const file of files) {
      if (!file || file.size === 0) continue;
      try {
        const blob = await put(
          `liquidations/${liq.id}/${docType.toLowerCase()}-${Date.now()}-${file.name}`,
          file,
          { access: "public", addRandomSuffix: true }
        );
        await prisma.liquidationDocument.create({
          data: {
            liquidationId: liq.id,
            docType,
            url: blob.url,
            filename: file.name,
          },
        });
      } catch {
        // File upload failed — skip silently (FM will notice missing docs)
      }
    }
  }

  await auditLog({
    userId: session.user.id!,
    action: "CREATE",
    entity: "Liquidation",
    entityId: liq.id,
    detail: `${currency} received ${fundsReceived}, accounted ${fundsAccountedFor}, balance ${refundRequired}`,
  });

  revalidatePath("/astelfin_26/my/liquidations");
  redirect("/astelfin_26/my/liquidations");
}

/** FM reviews a liquidation */
export async function reviewLiquidation(
  liquidationId: string,
  action: "FM_APPROVED" | "FM_REJECTED" | "CHANGES_REQUESTED",
  formData: FormData
): Promise<void> {
  const session = await auth();
  if (!session?.user || (session.user.role !== "FINANCE_MANAGER" && session.user.role !== "CEO")) {
    redirect("/astelfin_26/login");
  }

  const note = (formData.get("note") as string) || null;

  // Fetch before update so we have previousStatus + submitter for guards
  const liqBefore = await prisma.liquidation.findUniqueOrThrow({
    where: { id: liquidationId },
    select: { status: true, submittedBy: true },
  });

  // Reviewer must not be the person who submitted this liquidation
  if (action === "FM_APPROVED") {
    assertNotSelfApproval(session.user.id!, liqBefore.submittedBy, "liquidation");
  }

  // Status change and refund creation are atomic — an approved overspent
  // liquidation with no refund record would silently drop money owed to staff.
  const liq = await prisma.$transaction(async (tx) => {
    const updated = await tx.liquidation.update({
      where: { id: liquidationId },
      data: {
        status: action,
        fmNote: note || null,
        reviewedByName: session.user.name,
        reviewedAt: new Date(),
      },
      include: {
        submitter: { select: { name: true, employeeId: true } },
      },
    });

    if (action === "FM_APPROVED" && updated.refundRequired < 0) {
      await tx.overspendingRefund.create({
        data: {
          liquidationId,
          employeeName: updated.submitter.name ?? "Unknown",
          employeeId:   updated.submitter.employeeId ?? null,
          amount:       Math.abs(updated.refundRequired),
          currency:     updated.currency,
          status:       "PENDING_CEO",
        },
      });
    }

    return updated;
  });

  // If FM approved and employee overspent, notify the CEO about the refund
  if (action === "FM_APPROVED" && liq.refundRequired < 0) {
    const overspentAmount = Math.abs(liq.refundRequired);

    // Notify CEO
    try {
      const ceos = await prisma.user.findMany({
        where: { role: "CEO", active: true },
        select: { email: true },
      });
      if (ceos.length > 0) {
        const safeName     = escapeHtml(liq.submitter.name ?? "Unknown");
        const safeActivity = escapeHtml(liq.activity);
        const body = `
          <h2>Overspending Refund Approval Required</h2>
          <p><strong>${safeName}</strong> spent more than they received on a funded activity and the liquidation has been approved by the Operations Manager.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
            <tr><td style="padding:8px 0;color:#6b7280">Employee</td><td style="padding:8px 0;font-weight:bold">${safeName}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Activity</td><td style="padding:8px 0">${safeActivity}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Amount Owed to Employee</td><td style="padding:8px 0;font-weight:bold;color:#dc2626">${liq.currency} ${overspentAmount.toLocaleString("en-MW", { minimumFractionDigits: 2 })}</td></tr>
          </table>
          <p>Please review and approve or reject this refund in the Finance system.</p>
          <a class="btn" href="${BASE_URL}/astelfin_26/liquidations/${liquidationId}">Review Liquidation</a>
        `;
        await sendMail({
          to: ceos.map((u) => u.email),
          subject: `Overspending refund awaiting approval — ${liq.submitter.name}`,
          html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:0">
            <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden">
              <div style="background:#0a1628;padding:24px 32px"><p style="color:#fff;font-size:18px;font-weight:bold;margin:0">Astellic</p><p style="color:#c9a227;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:2px 0 0">Finance</p></div>
              <div style="padding:32px;color:#374151;font-size:14px;line-height:1.6">${body}</div>
              <div style="background:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb">This is an automated notification from the Astellic Finance system.</div>
            </div></body></html>`,
        });
      }
    } catch { /* email failure must never block the action */ }
  }

  await auditLog({
    userId: session.user.id!,
    action,
    entity: "Liquidation",
    entityId: liquidationId,
    detail: note || undefined,
  });

  await writeApprovalRecord({
    entityType:     "Liquidation",
    entityId:       liquidationId,
    decidedById:    session.user.id!,
    decidedByEmail: session.user.email ?? "",
    decidedByName:  session.user.name  ?? "",
    decidedByRole:  session.user.role,
    previousStatus: liqBefore.status,
    newStatus:      action,
    decision:       action === "FM_APPROVED" ? "APPROVED" : action === "FM_REJECTED" ? "REJECTED" : "CHANGES_REQUESTED",
    comments:       note,
  });

  revalidatePath("/astelfin_26/liquidations");
  revalidatePath(`/astelfin_26/liquidations/${liquidationId}`);
  redirect("/astelfin_26/liquidations");
}
