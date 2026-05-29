import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import { auditLog } from "@/lib/audit";
import { redirect } from "next/navigation";
import { put } from "@vercel/blob";
import Link from "next/link";

export const metadata = {
  title: "Record Remittance | Astelfin Tax",
  robots: { index: false, follow: false },
};

const TAX_TYPES = [
  { value: "PAYE",    label: "PAYE (Pay As You Earn)",    desc: "Monthly employee income tax" },
  { value: "PENSION", label: "Pension Contributions",      desc: "Employee pension fund remittances" },
  { value: "CIT",     label: "CIT (Corporate Income Tax)", desc: "30% annual tax on net profit" },
];

async function createAstelfinRemittance(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "FINANCE_MANAGER" && session.user.role !== "CEO") redirect("/astelfin_26/home");

  const org = await prisma.organisation.findFirst({ where: { shortCode: "ASTELFIN", active: true } });

  const taxType        = formData.get("taxType")        as string;
  const remittanceType = formData.get("remittanceType") as string;
  const period         = formData.get("period")         as string;
  const fmNote         = (formData.get("fmNote") as string) || null;
  const payrollIds     = formData.getAll("payrollId")  as string[];
  const pensionIds     = formData.getAll("pensionId")  as string[];
  const manualAmountRaw = formData.get("manualAmount") as string | null;
  const manualAmount   = manualAmountRaw ? parseFloat(manualAmountRaw) : 0;

  const isCIT     = taxType === "CIT";
  const isPension = taxType === "PENSION";

  let amount = isCIT ? manualAmount : 0;
  if (payrollIds.length > 0 && !isPension) {
    const records = await prisma.payroll.findMany({ where: { id: { in: payrollIds } }, select: { paye: true } });
    amount = records.reduce((s, r) => s + r.paye, 0);
  }
  if (pensionIds.length > 0) {
    const records = await prisma.payroll.findMany({ where: { id: { in: pensionIds } }, select: { pension: true } });
    amount = records.reduce((s, r) => s + r.pension, 0);
  }

  const proofFile = formData.get("proof") as File | null;
  let proofUrl: string | null = null;
  let proofFilename: string | null = null;
  if (proofFile && proofFile.size > 0) {
    const blob = await put("tax-remittances/astelfin/" + Date.now() + "-" + proofFile.name, proofFile, { access: "public", addRandomSuffix: true });
    proofUrl = blob.url;
    proofFilename = proofFile.name;
  }

  const remittance = await prisma.taxRemittance.create({
    data: {
      organisationId: org?.id ?? null,
      taxType,
      period,
      amount,
      remittanceType,
      proofUrl,
      proofFilename,
      fmNote,
      submittedById: session.user.id!,
      payrollIds: isPension ? [] : payrollIds,
      pensionIds,
      consultantPaymentIds: [],
    },
  });

  if (payrollIds.length > 0 && !isPension) {
    await prisma.payroll.updateMany({ where: { id: { in: payrollIds } }, data: { payeStatus: "PENDING_CEO" } });
  }
  if (pensionIds.length > 0) {
    await prisma.payroll.updateMany({ where: { id: { in: pensionIds } }, data: { pensionStatus: "PENDING_CEO" } });
  }

  await auditLog({ userId: session.user.id!, action: "CREATE", entity: "TaxRemittance", entityId: remittance.id, detail: "Astelfin: " + taxType + " " + period + " — " + formatCurrency(amount) });

  redirect("/astelfin_26/astelfin/tax?success=remittance_submitted");
}

export default async function AstelfinTaxRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  const { type, error } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "FINANCE_MANAGER" && session.user.role !== "CEO") redirect("/astelfin_26/home");

  const org = await getAstelfinOrg();
  const orgFilter = org ? { organisationId: org.id } : { organisationId: "none" };

  const [payeRecords, pensionRecords] = await Promise.all([
    type === "PAYE"
      ? prisma.payroll.findMany({
          where:   { payeStatus: "OUTSTANDING", paye: { gt: 0 }, ...orgFilter },
          include: { employee: { select: { name: true } } },
          orderBy: [{ period: "asc" }],
        })
      : [],
    type === "PENSION"
      ? prisma.payroll.findMany({
          where:   { pensionStatus: "OUTSTANDING", pension: { gt: 0 }, ...orgFilter },
          include: { employee: { select: { name: true } } },
          orderBy: [{ period: "asc" }],
        })
      : [],
  ]);

  const now = new Date();
  const defaultPeriod = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][now.getMonth()] + " " + now.getFullYear();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link href="/astelfin_26/astelfin/tax" className="text-sm text-brand-muted hover:text-brand-gold transition-colors">
          &larr; Back to Tax Dashboard
        </Link>
        <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em] mt-4">Astelfin</p>
        <h1 className="text-2xl font-bold text-brand-navy mt-1">Record Tax Remittance</h1>
        <p className="text-brand-muted text-sm mt-1">Submit a tax payment or waiver for CEO approval.</p>
      </div>

      {!org && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Astelfin organisation is not configured — remittances will not be org-scoped.
        </div>
      )}
      {error === "no_records" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Please select at least one record to remit.
        </div>
      )}

      {/* Step 1: choose type */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-brand-navy text-sm">1. Select Tax Type</h2>
        <div className="grid gap-3">
          {TAX_TYPES.map((t) => (
            <a key={t.value} href={"?type=" + t.value}
              className={"flex items-start gap-4 border-2 rounded-xl px-4 py-3 transition-all cursor-pointer " + (type === t.value ? "border-brand-gold bg-brand-gold/5" : "border-gray-100 hover:border-gray-300")}>
              <div className={"w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 " + (type === t.value ? "border-brand-gold bg-brand-gold" : "border-gray-300")} />
              <div>
                <p className="font-semibold text-brand-navy text-sm">{t.label}</p>
                <p className="text-xs text-brand-muted mt-0.5">{t.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Step 2: form once type is chosen */}
      {type && (
        <form action={createAstelfinRemittance} encType="multipart/form-data" className="bg-white border border-gray-100 rounded-2xl p-6 space-y-5">
          <h2 className="font-bold text-brand-navy text-sm">2. Remittance Details</h2>
          <input type="hidden" name="taxType" value={type} />

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1.5">Period</label>
            <input name="period" defaultValue={defaultPeriod} required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1.5">Type</label>
            <select name="remittanceType" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50">
              <option value="PAID">Paid to MRA</option>
              <option value="WAIVED">MRA Waiver / Remission</option>
            </select>
          </div>

          {/* PAYE records */}
          {type === "PAYE" && payeRecords.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">Select Payroll Records</label>
              <div className="border border-gray-200 rounded-xl divide-y max-h-60 overflow-y-auto">
                {(payeRecords as { id: string; period: string; paye: number; currency: string; employee: { name: string } }[]).map((r) => (
                  <label key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" name="payrollId" value={r.id} defaultChecked className="rounded" />
                    <span className="flex-1 text-sm text-brand-navy">{r.employee.name} — {r.period}</span>
                    <span className="text-sm font-semibold text-orange-600">{formatCurrency(r.paye)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {type === "PAYE" && payeRecords.length === 0 && (
            <p className="text-sm text-brand-muted bg-gray-50 rounded-xl p-4">No outstanding PAYE records for Astelfin.</p>
          )}

          {/* Pension records */}
          {type === "PENSION" && pensionRecords.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-2">Select Pension Records</label>
              <div className="border border-gray-200 rounded-xl divide-y max-h-60 overflow-y-auto">
                {(pensionRecords as { id: string; period: string; pension: number; currency: string; employee: { name: string } }[]).map((r) => (
                  <label key={r.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" name="pensionId" value={r.id} defaultChecked className="rounded" />
                    <span className="flex-1 text-sm text-brand-navy">{r.employee.name} — {r.period}</span>
                    <span className="text-sm font-semibold text-orange-600">{formatCurrency(r.pension)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {type === "PENSION" && pensionRecords.length === 0 && (
            <p className="text-sm text-brand-muted bg-gray-50 rounded-xl p-4">No outstanding pension records for Astelfin.</p>
          )}

          {/* CIT manual amount */}
          {type === "CIT" && (
            <div>
              <label className="block text-sm font-semibold text-brand-navy mb-1.5">Amount (MWK)</label>
              <input type="number" name="manualAmount" step="0.01" min="0" required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50"
                placeholder="0.00" />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1.5">Proof of Payment / Waiver Letter</label>
            <input type="file" name="proof" accept=".pdf,.jpg,.jpeg,.png"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1.5">Note (optional)</label>
            <textarea name="fmNote" rows={3} placeholder="Any notes for the CEO..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/50 resize-none" />
          </div>

          <button type="submit"
            className="w-full bg-brand-gold hover:bg-brand-gold/90 text-white font-semibold py-3 rounded-xl transition-colors">
            Submit for CEO Approval
          </button>
        </form>
      )}
    </div>
  );
}