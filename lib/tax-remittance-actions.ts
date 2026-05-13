"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendMail } from "@/lib/mail";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://astellic.com";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getCEOEmails(): Promise<string[]> {
  const ceos = await prisma.user.findMany({
    where:  { role: "CEO", active: true },
    select: { email: true },
  });
  return ceos.map((u) => u.email);
}

async function getFMEmails(): Promise<string[]> {
  const fms = await prisma.user.findMany({
    where:  { role: "FINANCE_MANAGER", active: true },
    select: { email: true },
  });
  return fms.map((u) => u.email);
}

function fmtMWK(n: number) {
  return new Intl.NumberFormat("en-MW", {
    style: "currency", currency: "MWK", minimumFractionDigits: 2,
  }).format(n).replace("MWK", "MWK ");
}

// ── Create Remittance (FM submits, goes to CEO for approval) ──────────────────

export async function createTaxRemittance(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "FINANCE_MANAGER" && role !== "CEO") redirect("/astelfin_26/dashboard");

  const taxType       = formData.get("taxType")       as string;
  const remittanceType= formData.get("remittanceType")as string; // PAID | WAIVED
  const period        = formData.get("period")        as string;
  const fmNote        = (formData.get("fmNote") as string) || null;

  // Parse selected record IDs
  const payrollIds           = formData.getAll("payrollId")           as string[];
  const consultantPaymentIds = formData.getAll("consultantPaymentId") as string[];

  if (payrollIds.length === 0 && consultantPaymentIds.length === 0) {
    redirect(`/astelfin_26/reports/tax/record?type=${taxType}&error=no_records`);
  }

  // Calculate total
  let amount = 0;
  if (payrollIds.length > 0) {
    const records = await prisma.payroll.findMany({
      where: { id: { in: payrollIds } },
      select: { paye: true },
    });
    amount = records.reduce((s, r) => s + r.paye, 0);
  }
  if (consultantPaymentIds.length > 0) {
    const records = await prisma.consultantPayment.findMany({
      where: { id: { in: consultantPaymentIds } },
      select: { withholdingTax: true },
    });
    amount += records.reduce((s, r) => s + r.withholdingTax, 0);
  }

  // Upload proof (required)
  const proofFile = formData.get("proof") as File | null;
  let proofUrl:      string | null = null;
  let proofFilename: string | null = null;
  if (proofFile && proofFile.size > 0) {
    const blob = await put(
      `tax-remittances/${Date.now()}-${proofFile.name}`,
      proofFile,
      { access: "public", addRandomSuffix: true }
    );
    proofUrl      = blob.url;
    proofFilename = proofFile.name;
  }

  // Create remittance record
  const remittance = await prisma.taxRemittance.create({
    data: {
      taxType,
      period,
      amount,
      remittanceType,
      proofUrl,
      proofFilename,
      fmNote,
      submittedById:        session.user.id!,
      payrollIds,
      consultantPaymentIds,
    },
  });

  // Mark selected records as PENDING_CEO
  if (payrollIds.length > 0) {
    await prisma.payroll.updateMany({
      where: { id: { in: payrollIds } },
      data:  { payeStatus: "PENDING_CEO" },
    });
  }
  if (consultantPaymentIds.length > 0) {
    await prisma.consultantPayment.updateMany({
      where: { id: { in: consultantPaymentIds } },
      data:  { whtStatus: "PENDING_CEO" },
    });
  }

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "TaxRemittance",
    entityId: remittance.id,
    detail:   `${taxType} ${remittanceType} — ${period} — MWK ${amount.toFixed(2)}`,
  });

  // Notify CEO
  const ceoEmails = await getCEOEmails();
  if (ceoEmails.length > 0) {
    const typeLabel = remittanceType === "PAID" ? "paid" : "waived (MRA Remission)";
    await sendMail({
      to:      ceoEmails,
      subject: `Tax Remittance Approval Required — ${taxType} ${period}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="background:#0a1628;padding:24px 32px;">
            <p style="color:#fff;font-size:18px;font-weight:bold;margin:0;">Astellic</p>
            <p style="color:#c9a227;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:2px 0 0;">Finance</p>
          </div>
          <div style="padding:32px;color:#374151;font-size:14px;line-height:1.6;">
            <h2 style="color:#0a1628;margin-top:0;">Tax Remittance Approval Required</h2>
            <p>The Operations Manager has recorded a tax remittance requiring your approval:</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
              <tr><td style="padding:8px 0;color:#6b7280;width:40%">Tax Type</td><td style="font-weight:bold">${taxType}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Period</td><td>${period}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Amount</td><td style="font-weight:bold;color:#0a1628">${fmtMWK(amount)}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Type</td><td>${typeLabel}</td></tr>
              ${fmNote ? `<tr><td style="padding:8px 0;color:#6b7280">Note</td><td><em>${fmNote}</em></td></tr>` : ""}
              ${proofFilename ? `<tr><td style="padding:8px 0;color:#6b7280">Proof</td><td>${proofFilename}</td></tr>` : ""}
            </table>
            <a href="${BASE_URL}/astelfin_26/reports/tax/remittances/${remittance.id}"
               style="display:inline-block;background:#c9a227;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:bold;font-size:14px;margin-top:8px;">
              Review &amp; Approve →
            </a>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">
            Automated notification from Astellic Finance.
          </div>
        </div>`,
    });
  }

  redirect(`/astelfin_26/reports/tax?success=remittance_submitted`);
}

// ── CEO Approves Remittance ───────────────────────────────────────────────────

export async function approveTaxRemittance(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const remittanceId = formData.get("remittanceId") as string;
  const ceoNote      = (formData.get("ceoNote") as string) || null;

  const remittance = await prisma.taxRemittance.findUnique({
    where: { id: remittanceId },
  });
  if (!remittance) redirect("/astelfin_26/reports/tax");

  await prisma.taxRemittance.update({
    where: { id: remittanceId },
    data:  {
      status:      "CEO_APPROVED",
      ceoNote,
      reviewedById: session.user.id!,
      reviewedAt:   new Date(),
    },
  });

  // Mark the underlying records as REMITTED or WAIVED
  const finalStatus = remittance!.remittanceType === "WAIVED" ? "WAIVED" : "REMITTED";

  if (remittance!.payrollIds.length > 0) {
    await prisma.payroll.updateMany({
      where: { id: { in: remittance!.payrollIds } },
      data:  { payeStatus: finalStatus },
    });
  }
  if (remittance!.consultantPaymentIds.length > 0) {
    await prisma.consultantPayment.updateMany({
      where: { id: { in: remittance!.consultantPaymentIds } },
      data:  { whtStatus: finalStatus },
    });
  }

  await auditLog({
    userId:   session.user.id!,
    action:   "APPROVE",
    entity:   "TaxRemittance",
    entityId: remittanceId,
    detail:   ceoNote || `CEO approved ${remittance!.taxType} remittance`,
  });

  // Notify FM
  const fmEmails = await getFMEmails();
  if (fmEmails.length > 0) {
    await sendMail({
      to:      fmEmails,
      subject: `Tax Remittance Approved — ${remittance!.taxType} ${remittance!.period}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="background:#0a1628;padding:24px 32px;"><p style="color:#fff;font-size:18px;font-weight:bold;margin:0;">Astellic</p><p style="color:#c9a227;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:2px 0 0;">Finance</p></div>
          <div style="padding:32px;color:#374151;font-size:14px;line-height:1.6;">
            <h2 style="color:#16a34a;margin-top:0;">✓ Tax Remittance Approved</h2>
            <p>The CEO has approved the following tax remittance. The records have been marked as ${finalStatus.toLowerCase()}.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
              <tr><td style="padding:8px 0;color:#6b7280;width:40%">Tax Type</td><td style="font-weight:bold">${remittance!.taxType}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Period</td><td>${remittance!.period}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Amount</td><td style="font-weight:bold">${fmtMWK(remittance!.amount)}</td></tr>
              ${ceoNote ? `<tr><td style="padding:8px 0;color:#6b7280">CEO Note</td><td><em>${ceoNote}</em></td></tr>` : ""}
            </table>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">Automated notification from Astellic Finance.</div>
        </div>`,
    });
  }

  redirect(`/astelfin_26/reports/tax/remittances/${remittanceId}?success=approved`);
}

// ── CEO Rejects Remittance ────────────────────────────────────────────────────

export async function rejectTaxRemittance(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const remittanceId = formData.get("remittanceId") as string;
  const ceoNote      = (formData.get("ceoNote") as string) || null;

  const remittance = await prisma.taxRemittance.findUnique({
    where: { id: remittanceId },
  });
  if (!remittance) redirect("/astelfin_26/reports/tax");

  await prisma.taxRemittance.update({
    where: { id: remittanceId },
    data:  {
      status:       "CEO_REJECTED",
      ceoNote,
      reviewedById: session.user.id!,
      reviewedAt:   new Date(),
    },
  });

  // Revert records back to OUTSTANDING
  if (remittance.payrollIds.length > 0) {
    await prisma.payroll.updateMany({
      where: { id: { in: remittance.payrollIds } },
      data:  { payeStatus: "OUTSTANDING" },
    });
  }
  if (remittance.consultantPaymentIds.length > 0) {
    await prisma.consultantPayment.updateMany({
      where: { id: { in: remittance.consultantPaymentIds } },
      data:  { whtStatus: "OUTSTANDING" },
    });
  }

  await auditLog({
    userId:   session.user.id!,
    action:   "REJECT",
    entity:   "TaxRemittance",
    entityId: remittanceId,
    detail:   ceoNote || `CEO rejected ${remittance.taxType} remittance`,
  });

  const fmEmails = await getFMEmails();
  if (fmEmails.length > 0) {
    await sendMail({
      to:      fmEmails,
      subject: `Tax Remittance Rejected — ${remittance.taxType} ${remittance.period}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <div style="background:#0a1628;padding:24px 32px;"><p style="color:#fff;font-size:18px;font-weight:bold;margin:0;">Astellic</p><p style="color:#c9a227;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:2px 0 0;">Finance</p></div>
          <div style="padding:32px;color:#374151;font-size:14px;line-height:1.6;">
            <h2 style="color:#dc2626;margin-top:0;">✗ Tax Remittance Rejected</h2>
            <p>The CEO has rejected the following tax remittance. The records have been restored to Outstanding status.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
              <tr><td style="padding:8px 0;color:#6b7280;width:40%">Tax Type</td><td style="font-weight:bold">${remittance.taxType}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Period</td><td>${remittance.period}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280">Amount</td><td style="font-weight:bold">${fmtMWK(remittance.amount)}</td></tr>
              ${ceoNote ? `<tr><td style="padding:8px 0;color:#6b7280">CEO Reason</td><td style="color:#dc2626"><em>${ceoNote}</em></td></tr>` : ""}
            </table>
            <a href="${BASE_URL}/astelfin_26/reports/tax/record?type=${remittance.taxType}" style="display:inline-block;background:#c9a227;color:#fff;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:bold;font-size:14px;margin-top:8px;">Re-record Remittance →</a>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;">Automated notification from Astellic Finance.</div>
        </div>`,
    });
  }

  redirect(`/astelfin_26/reports/tax/remittances/${remittanceId}?success=rejected`);
}

export { revalidatePath };
