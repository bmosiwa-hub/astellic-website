import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createTaxRemittance } from "@/lib/tax-remittance-actions";

export const metadata = {
  title: "Record Tax Remittance | Astelfin IMS",
  robots: { index: false, follow: false },
};

const TAX_TYPES = [
  { value: "PAYE", label: "PAYE (Pay As You Earn)" },
  { value: "WHT",  label: "WHT (Withholding Tax)" },
];

const STATUS_COLORS: Record<string, string> = {
  OUTSTANDING: "bg-orange-100 text-orange-700",
  PENDING_CEO: "bg-blue-100 text-blue-700",
  REMITTED:    "bg-green-100 text-green-700",
  WAIVED:      "bg-purple-100 text-purple-700",
};

export default async function RecordTaxRemittancePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; error?: string }>;
}) {
  const { type, error } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "FINANCE_MANAGER" && role !== "CEO") redirect("/astelfin_26/dashboard");

  // ── Fetch outstanding records ─────────────────────────────────────────────
  type PayeRecord = {
    id: string;
    period: string;
    paye: number;
    currency: string;
    payeStatus: string;
    employeeName: string;
    grossSalary: number;
  };

  type WhtRecord = {
    id: string;
    description: string;
    withholdingTax: number;
    grossAmount: number;
    currency: string;
    whtStatus: string;
    consultantName: string;
    paidDate: Date | null;
  };

  let payeRecords: PayeRecord[] = [];
  let whtRecords:  WhtRecord[]  = [];

  if (type === "PAYE") {
    const rows = await prisma.payroll.findMany({
      where:   { payeStatus: "OUTSTANDING", paye: { gt: 0 } },
      include: { employee: { select: { name: true } } },
      orderBy: [{ period: "asc" }, { createdAt: "asc" }],
    });
    payeRecords = rows.map((r) => ({
      id:           r.id,
      period:       r.period,
      paye:         r.paye,
      currency:     r.currency,
      payeStatus:   r.payeStatus,
      employeeName: r.employee.name,
      grossSalary:  r.grossSalary,
    }));
  }

  if (type === "WHT") {
    const rows = await prisma.consultantPayment.findMany({
      where:   { whtStatus: "OUTSTANDING", withholdingTax: { gt: 0 } },
      include: { consultant: { select: { name: true } } },
      orderBy: [{ paidDate: "asc" }, { createdAt: "asc" }],
    });
    whtRecords = rows.map((r) => ({
      id:             r.id,
      description:    r.description,
      withholdingTax: r.withholdingTax,
      grossAmount:    r.grossAmount,
      currency:       r.currency,
      whtStatus:      r.whtStatus,
      consultantName: r.consultant.name,
      paidDate:       r.paidDate,
    }));
  }

  const totalPAYE = payeRecords.reduce((s, r) => s + r.paye, 0);
  const totalWHT  = whtRecords.reduce((s, r)  => s + r.withholdingTax, 0);
  const total     = type === "PAYE" ? totalPAYE : totalWHT;

  // Group PAYE by period for a cleaner display
  const payeByPeriod = payeRecords.reduce<Record<string, typeof payeRecords>>((acc, r) => {
    (acc[r.period] ??= []).push(r);
    return acc;
  }, {});

  // Derive period label for the form
  const periods = type === "PAYE"
    ? [...new Set(payeRecords.map((r) => r.period))].sort().join(", ")
    : whtRecords
        .map((r) => r.paidDate ? new Date(r.paidDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "")
        .filter(Boolean)
        .filter((v, i, a) => a.indexOf(v) === i)
        .join(", ");

  return (
    <div className="max-w-4xl space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Record Tax Remittance</h1>
          <p className="text-gray-500 text-sm mt-1">
            Select outstanding tax records, upload proof, and submit for CEO approval.
          </p>
        </div>
        <Link href="/astelfin_26/reports/tax"
          className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back to Tax Dashboard
        </Link>
      </div>

      {/* Error */}
      {error === "no_records" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Please select at least one record to remit.
        </div>
      )}

      {/* Tax type selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-brand-navy text-sm mb-4">1. Select Tax Type</h2>
        <form method="GET" className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Tax Type</label>
            <select name="type" defaultValue={type ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
              <option value="">— Select tax type —</option>
              {TAX_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <button type="submit"
            className="px-5 py-2 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors">
            View Outstanding →
          </button>
        </form>

        {/* Pension note */}
        {!type && (
          <p className="text-xs text-gray-400 mt-3">
            Pension and NSSF contributions are tracked via{" "}
            <Link href="/astelfin_26/payables" className="text-brand-gold hover:underline">
              Accounts Payable
            </Link>
            . Use this page for PAYE and WHT only.
          </p>
        )}
      </div>

      {/* Outstanding records + form */}
      {type && (payeRecords.length > 0 || whtRecords.length > 0) && (
        <form action={createTaxRemittance} encType="multipart/form-data">
          <input type="hidden" name="taxType"       value={type} />
          <input type="hidden" name="period"        value={periods || type} />

          {/* Records table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="font-bold text-brand-navy text-sm">
                2. Select Records — {total > 0 && <span className="text-orange-600">{formatCurrency(total)} outstanding</span>}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Check the records you are remitting in this batch. Use separate submissions for different periods.
              </p>
            </div>

            {/* PAYE records grouped by period */}
            {type === "PAYE" && (
              <div>
                {Object.entries(payeByPeriod).map(([period, records]) => (
                  <div key={period}>
                    <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-brand-navy uppercase tracking-wide">
                        {period}
                      </span>
                      <span className="text-xs text-orange-600 font-semibold">
                        {formatCurrency(records.reduce((s, r) => s + r.paye, 0))} PAYE
                      </span>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50/50">
                        <tr>
                          <th className="w-10 px-5 py-2"></th>
                          <th className="text-left px-5 py-2 font-semibold text-gray-500 text-xs">Employee</th>
                          <th className="text-right px-5 py-2 font-semibold text-gray-500 text-xs">Gross Salary</th>
                          <th className="text-right px-5 py-2 font-semibold text-gray-500 text-xs">PAYE</th>
                          <th className="text-left px-5 py-2 font-semibold text-gray-500 text-xs">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {records.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50/50">
                            <td className="px-5 py-2.5 text-center">
                              <input type="checkbox" name="payrollId" value={r.id}
                                defaultChecked
                                className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                            </td>
                            <td className="px-5 py-2.5 font-medium text-brand-navy">{r.employeeName}</td>
                            <td className="px-5 py-2.5 text-right tabular-nums text-gray-600">
                              {formatCurrency(r.grossSalary, r.currency)}
                            </td>
                            <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-orange-600">
                              {formatCurrency(r.paye)}
                            </td>
                            <td className="px-5 py-2.5">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.payeStatus] ?? "bg-gray-100 text-gray-600"}`}>
                                {r.payeStatus}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                {/* Total row */}
                <div className="flex items-center justify-between px-5 py-3 bg-brand-navy/5 border-t-2 border-gray-200 font-bold text-brand-navy text-sm">
                  <span>{payeRecords.length} payroll record{payeRecords.length !== 1 ? "s" : ""} selected</span>
                  <span className="tabular-nums text-orange-600">{formatCurrency(totalPAYE)} total PAYE</span>
                </div>
              </div>
            )}

            {/* WHT records */}
            {type === "WHT" && (
              <div>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-10 px-5 py-2.5"></th>
                      <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Consultant</th>
                      <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Description</th>
                      <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Gross Fee</th>
                      <th className="text-right px-5 py-2.5 font-semibold text-gray-600">WHT (20%)</th>
                      <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {whtRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-2.5 text-center">
                          <input type="checkbox" name="consultantPaymentId" value={r.id}
                            defaultChecked
                            className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                        </td>
                        <td className="px-5 py-2.5 font-medium text-brand-navy">{r.consultantName}</td>
                        <td className="px-5 py-2.5 text-gray-600 text-xs">{r.description}</td>
                        <td className="px-5 py-2.5 text-right tabular-nums text-gray-600">
                          {formatCurrency(r.grossAmount, r.currency)}
                        </td>
                        <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-orange-600">
                          {formatCurrency(r.withholdingTax)}
                        </td>
                        <td className="px-5 py-2.5">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[r.whtStatus] ?? "bg-gray-100 text-gray-600"}`}>
                            {r.whtStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex items-center justify-between px-5 py-3 bg-brand-navy/5 border-t-2 border-gray-200 font-bold text-brand-navy text-sm">
                  <span>{whtRecords.length} payment{whtRecords.length !== 1 ? "s" : ""} selected</span>
                  <span className="tabular-nums text-orange-600">{formatCurrency(totalWHT)} total WHT</span>
                </div>
              </div>
            )}
          </div>

          {/* Remittance details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6 space-y-5">
            <h2 className="font-bold text-brand-navy text-sm">3. Remittance Details</h2>

            <div className="grid grid-cols-2 gap-5">
              {/* Remittance type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Remittance Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-brand-gold has-[:checked]:bg-amber-50/40">
                    <input type="radio" name="remittanceType" value="PAID" defaultChecked
                      className="mt-0.5 text-brand-gold focus:ring-brand-gold" />
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">Paid to MRA</p>
                      <p className="text-xs text-gray-500">Tax was remitted and payment made to MRA</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-purple-400 has-[:checked]:bg-purple-50/40">
                    <input type="radio" name="remittanceType" value="WAIVED"
                      className="mt-0.5 text-purple-600 focus:ring-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-800">MRA Remission / Waiver</p>
                      <p className="text-xs text-gray-500">Tax obligation cleared by MRA without payment (waiver or remission letter)</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Proof upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Proof Document <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Upload MRA payment receipt (for Paid) or MRA waiver/remission letter (for Waived).
                </p>
                <input type="file" name="proof" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-gold file:text-white hover:file:bg-brand-gold/90 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer" />

                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Note (optional)</label>
                  <textarea name="fmNote" rows={2}
                    placeholder="MRA receipt number, payment date, any relevant notes…"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold resize-none" />
                </div>
              </div>
            </div>

            {/* Approval note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
              <strong>Approval required:</strong> This remittance will be sent to the CEO for review before being recorded in the system. Records will be marked as outstanding until approved.
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 mt-4">
            <Link href="/astelfin_26/reports/tax"
              className="px-5 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Cancel
            </Link>
            <button type="submit"
              className="px-6 py-2.5 bg-brand-gold hover:bg-brand-gold/90 text-white rounded-lg text-sm font-semibold transition-colors">
              Submit for CEO Approval →
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {type && payeRecords.length === 0 && whtRecords.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="font-semibold text-brand-navy">No Outstanding {type} Records</p>
          <p className="text-sm text-gray-500 mt-1">
            All {type === "PAYE" ? "payroll PAYE" : "withholding tax"} records have been remitted or are pending CEO approval.
          </p>
          <Link href="/astelfin_26/reports/tax"
            className="inline-block mt-4 text-sm text-brand-gold hover:underline font-semibold">
            ← Back to Tax Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
