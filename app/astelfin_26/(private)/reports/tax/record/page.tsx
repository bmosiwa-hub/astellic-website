import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { formatCurrency, fmtPeriod, fmtPeriodList } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createTaxRemittance } from "@/lib/tax-remittance-actions";
import RemittanceSelection from "@/components/finance/RemittanceSelection";

export const metadata = {
  title: "Record Tax Remittance | Astelfin IMS",
  robots: { index: false, follow: false },
};

const TAX_TYPES = [
  { value: "PAYE",    label: "PAYE (Pay As You Earn)",      desc: "Monthly employee income tax deducted from salary" },
  { value: "PENSION", label: "Pension Contributions",        desc: "Pension remittances to NICO (employee 5% + employer 10%)" },
  { value: "WHT",     label: "WHT (Withholding Tax)",        desc: "20% withholding on consultant professional fees" },
  { value: "CIT",     label: "CIT (Corporate Income Tax)",   desc: "30% annual tax on company net profit" },
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
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageTax")) redirect("/astelfin_26/reports/tax");

  // ── Fetch outstanding records by type ─────────────────────────────────────

  const payeRecords    = type === "PAYE"
    ? await prisma.payroll.findMany({
        where:   { payeStatus: "OUTSTANDING", paye: { gt: 0 } },
        include: { employee: { select: { name: true } } },
        orderBy: [{ period: "asc" }, { createdAt: "asc" }],
      })
    : [];

  const pensionRecords = type === "PENSION"
    ? await prisma.payroll.findMany({
        where:   { pensionStatus: "OUTSTANDING", pension: { gt: 0 } },
        include: { employee: { select: { name: true } } },
        orderBy: [{ period: "asc" }, { createdAt: "asc" }],
      })
    : [];

  const whtRecords = type === "WHT"
    ? await prisma.consultantPayment.findMany({
        where:   { whtStatus: "OUTSTANDING", withholdingTax: { gt: 0 } },
        include: { consultant: { select: { name: true } } },
        orderBy: [{ paidDate: "asc" }, { createdAt: "asc" }],
      })
    : [];

  // Full pension payable to NICO per record = employee (5%) + employer (10%), in MWK.
  const pensionMWK = (r: { pension: number; pensionEmployer: number; exchangeRateUsed: number | null }) =>
    (r.exchangeRateUsed ? r.pension * r.exchangeRateUsed : r.pension) + r.pensionEmployer;

  // Remaining balance still owed on each record (obligation minus what's already
  // been remitted), so partial payments show only what's left to pay.
  const payeRemaining    = (r: { paye: number; payeRemitted: number }) => Math.max(0, r.paye - r.payeRemitted);
  const pensionRemaining = (r: { pension: number; pensionEmployer: number; exchangeRateUsed: number | null; pensionRemitted: number }) =>
    Math.max(0, pensionMWK(r) - r.pensionRemitted);
  const whtRemaining     = (r: { withholdingTax: number; whtRemitted: number }) => Math.max(0, r.withholdingTax - r.whtRemitted);

  const totalPAYE    = payeRecords.reduce((s, r) => s + payeRemaining(r), 0);
  const totalPension = pensionRecords.reduce((s, r) => s + pensionRemaining(r), 0);
  const totalWHT     = whtRecords.reduce((s, r) => s + whtRemaining(r), 0);

  // Pension is remitted to NICO Insurance; all other statutory taxes to the MRA.
  const authority = type === "PENSION" ? "NICO Insurance" : "MRA";

  // Outstanding obligation for the selected type — pre-fills the "amount paid"
  // field, which the user can override (paid less, or more with penalty/interest).
  const computedTotal =
    type === "PAYE"    ? totalPAYE    :
    type === "PENSION" ? totalPension :
    type === "WHT"     ? totalWHT     : 0;

  // Group PAYE / PENSION by period
  const payeByPeriod    = payeRecords.reduce<Record<string, typeof payeRecords>>((acc, r) => {
    (acc[r.period] ??= []).push(r);
    return acc;
  }, {});
  const pensionByPeriod = pensionRecords.reduce<Record<string, typeof pensionRecords>>((acc, r) => {
    (acc[r.period] ??= []).push(r);
    return acc;
  }, {});

  // Period label for hidden input
  const periodLabel = type === "PAYE"
    ? [...new Set(payeRecords.map((r) => r.period))].sort().join(", ")
    : type === "PENSION"
    ? [...new Set(pensionRecords.map((r) => r.period))].sort().join(", ")
    : type === "WHT"
    ? whtRecords.map((r) => r.paidDate
        ? new Date(r.paidDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
        : "").filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ")
    : `CIT ${new Date().getFullYear()}`;

  const hasRecords =
    (type === "PAYE"    && payeRecords.length > 0)    ||
    (type === "PENSION" && pensionRecords.length > 0) ||
    (type === "WHT"     && whtRecords.length > 0)     ||
    type === "CIT";

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

      {/* Errors */}
      {error === "no_records" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Please select at least one record to remit.
        </div>
      )}
      {error === "no_amount" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Please enter the CIT amount to remit.
        </div>
      )}
      {error === "upload_failed" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Your proof document could not be uploaded to storage. Nothing was saved — please re-attach it and submit again.
        </div>
      )}
      {error === "already_pending" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-sm">
          A remittance for this tax type and period is already awaiting CEO approval. Review or approve that one instead of creating a duplicate.
        </div>
      )}

      {/* Step 1 — Tax type selector */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-brand-navy text-sm">1. Select Tax Type</h2>
        <form method="GET">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {TAX_TYPES.map((t) => (
              <label key={t.value}
                className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                  type === t.value
                    ? "border-brand-gold bg-amber-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}>
                <input type="radio" name="type" value={t.value} defaultChecked={type === t.value}
                  className="mt-0.5 accent-brand-gold" />
                <div>
                  <p className="text-sm font-semibold text-brand-navy">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <button type="submit"
            className="px-5 py-2 bg-brand-navy text-white rounded-lg text-sm font-semibold hover:bg-brand-navy/90 transition-colors">
            View Outstanding →
          </button>
        </form>
      </div>

      {/* Step 2 + 3 — Records & submission */}
      {type && hasRecords && (
        <form action={createTaxRemittance} encType="multipart/form-data">
          <input type="hidden" name="taxType" value={type} />
          <input type="hidden" name="period"  value={periodLabel || type} />
          {type !== "CIT" && <RemittanceSelection />}

          {/* PAYE records */}
          {type === "PAYE" && (
            <RecordsTable
              title={`2. Select PAYE Records — ${formatCurrency(totalPAYE)} outstanding`}
              note="Check the payrolls you are remitting in this batch."
            >
              {Object.entries(payeByPeriod).map(([period, records]) => (
                <div key={period}>
                  <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy uppercase tracking-wide">{fmtPeriod(period)}</span>
                    <span className="text-xs text-orange-600 font-semibold">
                      {formatCurrency(records.reduce((s, r) => s + payeRemaining(r), 0))} PAYE
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="w-10 px-5 py-2" />
                        <th className="text-left px-5 py-2 font-semibold text-gray-500 text-xs">Employee</th>
                        <th className="text-right px-5 py-2 font-semibold text-gray-500 text-xs">Gross</th>
                        <th className="text-right px-5 py-2 font-semibold text-gray-500 text-xs">PAYE Outstanding</th>
                        <th className="text-left px-5 py-2 font-semibold text-gray-500 text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-2.5 text-center">
                            <input type="checkbox" name="payrollId" value={r.id} defaultChecked
                              data-remit-item data-remaining={payeRemaining(r)}
                              className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                          </td>
                          <td className="px-5 py-2.5 font-medium text-brand-navy">{r.employee.name}</td>
                          <td className="px-5 py-2.5 text-right tabular-nums text-gray-600">
                            {formatCurrency(r.grossSalary, r.currency)}
                          </td>
                          <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-orange-600">
                            {formatCurrency(payeRemaining(r))}
                            {r.payeRemitted > 0 && (
                              <span className="block text-[10px] text-gray-400 font-normal">
                                {formatCurrency(r.payeRemitted)} of {formatCurrency(r.paye)} paid
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-2.5">
                            <StatusBadge status={r.payeStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-3 bg-brand-navy/5 border-t-2 border-gray-200 font-bold text-brand-navy text-sm">
                <span>{payeRecords.length} payroll record{payeRecords.length !== 1 ? "s" : ""}</span>
                <span className="tabular-nums text-orange-600">{formatCurrency(totalPAYE)} total PAYE</span>
              </div>
            </RecordsTable>
          )}

          {/* PENSION records */}
          {type === "PENSION" && (
            <RecordsTable
              title={`2. Select Pension Records — ${formatCurrency(totalPension)} outstanding`}
              note="Check the payrolls whose pension contributions you are remitting."
            >
              {Object.entries(pensionByPeriod).map(([period, records]) => (
                <div key={period}>
                  <div className="px-5 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-navy uppercase tracking-wide">{fmtPeriod(period)}</span>
                    <span className="text-xs text-orange-600 font-semibold">
                      {formatCurrency(records.reduce((s, r) => s + pensionRemaining(r), 0))} Pension
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50/50">
                      <tr>
                        <th className="w-10 px-5 py-2" />
                        <th className="text-left px-5 py-2 font-semibold text-gray-500 text-xs">Employee</th>
                        <th className="text-right px-5 py-2 font-semibold text-gray-500 text-xs">Gross</th>
                        <th className="text-right px-5 py-2 font-semibold text-gray-500 text-xs">Pension Outstanding (15%)</th>
                        <th className="text-left px-5 py-2 font-semibold text-gray-500 text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-2.5 text-center">
                            <input type="checkbox" name="pensionId" value={r.id} defaultChecked
                              data-remit-item data-remaining={pensionRemaining(r)}
                              className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                          </td>
                          <td className="px-5 py-2.5 font-medium text-brand-navy">{r.employee.name}</td>
                          <td className="px-5 py-2.5 text-right tabular-nums text-gray-600">
                            {formatCurrency(r.grossSalary, r.currency)}
                          </td>
                          <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-orange-600">
                            {formatCurrency(pensionRemaining(r))}
                            {r.pensionRemitted > 0 && (
                              <span className="block text-[10px] text-gray-400 font-normal">
                                {formatCurrency(r.pensionRemitted)} of {formatCurrency(pensionMWK(r))} paid
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-2.5">
                            <StatusBadge status={r.pensionStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-3 bg-brand-navy/5 border-t-2 border-gray-200 font-bold text-brand-navy text-sm">
                <span>{pensionRecords.length} payroll record{pensionRecords.length !== 1 ? "s" : ""}</span>
                <span className="tabular-nums text-orange-600">{formatCurrency(totalPension)} total pension</span>
              </div>
            </RecordsTable>
          )}

          {/* WHT records */}
          {type === "WHT" && (
            <RecordsTable
              title={`2. Select WHT Records — ${formatCurrency(totalWHT)} outstanding`}
              note="Check the consultant payments you are remitting."
            >
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-5 py-2.5" />
                    <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Consultant</th>
                    <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Description</th>
                    <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Gross Fee</th>
                    <th className="text-right px-5 py-2.5 font-semibold text-gray-600">WHT Outstanding</th>
                    <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {whtRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-2.5 text-center">
                        <input type="checkbox" name="consultantPaymentId" value={r.id} defaultChecked
                          data-remit-item data-remaining={whtRemaining(r)}
                          className="rounded border-gray-300 text-brand-gold focus:ring-brand-gold" />
                      </td>
                      <td className="px-5 py-2.5 font-medium text-brand-navy">{r.consultant.name}</td>
                      <td className="px-5 py-2.5 text-gray-600 text-xs">{r.description}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-gray-600">
                        {formatCurrency(r.grossAmount, r.currency)}
                      </td>
                      <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-orange-600">
                        {formatCurrency(whtRemaining(r))}
                        {r.whtRemitted > 0 && (
                          <span className="block text-[10px] text-gray-400 font-normal">
                            {formatCurrency(r.whtRemitted)} of {formatCurrency(r.withholdingTax)} paid
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-2.5">
                        <StatusBadge status={r.whtStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between px-5 py-3 bg-brand-navy/5 border-t-2 border-gray-200 font-bold text-brand-navy text-sm">
                <span>{whtRecords.length} payment{whtRecords.length !== 1 ? "s" : ""}</span>
                <span className="tabular-nums text-orange-600">{formatCurrency(totalWHT)} total WHT</span>
              </div>
            </RecordsTable>
          )}

          {/* CIT — manual amount */}
          {type === "CIT" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <h2 className="font-bold text-brand-navy text-sm">2. Corporate Income Tax Amount</h2>
                <p className="text-xs text-gray-400 mt-1">
                  CIT is assessed on the company&apos;s annual net profit. Enter the amount as assessed or agreed with MRA.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Tax Period (e.g. FY2025, Q1 2026) <span className="text-red-500">*</span>
                  </label>
                  <input name="period" required placeholder={`FY${new Date().getFullYear()}`}
                    defaultValue={`FY${new Date().getFullYear()}`}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Amount (MWK) <span className="text-red-500">*</span>
                  </label>
                  <input name="manualAmount" type="number" min="1" step="0.01" required
                    placeholder="e.g. 5000000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800">
                <strong>Note:</strong> CIT is a company-wide annual obligation. The estimated CIT figure on the Tax Dashboard
                (30% of net income) is a guide only — actual CIT depends on MRA assessment, allowable deductions, and tax credits.
                Ensure you have the final MRA assessment before recording.
              </div>
            </div>
          )}

          {/* Remittance details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mt-6 space-y-5">
            <h2 className="font-bold text-brand-navy text-sm">3. Remittance Details</h2>
            {type !== "CIT" && periodLabel && (
              <div className="bg-brand-light rounded-xl px-4 py-3 text-sm text-brand-navy">
                You are remitting <strong>{TAX_TYPES.find((t) => t.value === type)?.label ?? type}</strong>
                {" "}for <strong>{fmtPeriodList(periodLabel)}</strong>
                {authority ? <> to <strong>{authority}</strong></> : null}.
              </div>
            )}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Remittance Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-brand-gold has-[:checked]:bg-amber-50/40">
                    <input type="radio" name="remittanceType" value="PAID" defaultChecked
                      className="mt-0.5 text-brand-gold focus:ring-brand-gold" />
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">Paid to {authority}</p>
                      <p className="text-xs text-gray-500">Remitted and payment made to {authority}</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 has-[:checked]:border-purple-400 has-[:checked]:bg-purple-50/40">
                    <input type="radio" name="remittanceType" value="WAIVED"
                      className="mt-0.5 text-purple-600 focus:ring-purple-600" />
                    <div>
                      <p className="text-sm font-semibold text-purple-800">{authority} Remission / Waiver</p>
                      <p className="text-xs text-gray-500">Obligation cleared by {authority} without payment</p>
                    </div>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Proof Document <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-400 mb-2">
                  Upload {authority} receipt (Paid) or {authority} waiver/remission letter (Waived).
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
            {type !== "CIT" && (
              <div>
                <div className="mb-2 text-xs text-brand-navy bg-brand-light rounded-lg px-3 py-2">
                  Selected <strong id="remit-selected-count">—</strong> record(s) above ·
                  Selected total: <strong id="remit-selected-total" className="text-brand-navy">—</strong>
                </div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Amount Actually Paid / Remitted (MWK) <span className="text-red-500">*</span>
                </label>
                <input name="amountPaid" type="number" min="0" step="0.01" required
                  defaultValue={computedTotal.toFixed(2)}
                  className="w-full max-w-xs border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                <p className="text-xs text-gray-400 mt-1">
                  Tick only the taxes/pensions you are remitting above — this amount updates to match your selection.
                  Change it if a different amount was actually paid — less (partial remittance) or more (e.g. with penalty or interest).
                </p>
              </div>
            )}
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
              <strong>Approval required:</strong> This submission will go to the CEO for review before being recorded.
            </div>
          </div>

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

      {/* Empty state for record-based types */}
      {type && !hasRecords && type !== "CIT" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="font-semibold text-brand-navy">No Outstanding {type} Records</p>
          <p className="text-sm text-gray-500 mt-1">
            All {type === "PAYE" ? "payroll PAYE" : type === "PENSION" ? "pension" : "withholding tax"} records
            have been remitted or are pending CEO approval.
          </p>
          <Link href="/astelfin_26/reports/tax" className="inline-block mt-4 text-sm text-brand-gold hover:underline font-semibold">
            ← Back to Tax Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RecordsTable({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100">
        <h2 className="font-bold text-brand-navy text-sm">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{note}</p>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    OUTSTANDING: "bg-orange-100 text-orange-700",
    PENDING_CEO: "bg-blue-100 text-blue-700",
    REMITTED:    "bg-green-100 text-green-700",
    WAIVED:      "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status === "PENDING_CEO" ? "Pending CEO" : status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
