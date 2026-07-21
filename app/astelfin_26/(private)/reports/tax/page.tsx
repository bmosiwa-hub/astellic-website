import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import { getEffectivePermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { sendTaxReport } from "@/lib/mail";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CORP_TAX_RATE = 0.30;

export const metadata = {
  title: "Tax Dashboard | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getRecipientEmails() {
  const users = await prisma.user.findMany({
    where:  { role: { in: ["CEO", "FINANCE_MANAGER"] }, active: true },
    select: { email: true },
  });
  return users.map((u) => u.email);
}

// ── Server actions ────────────────────────────────────────────────────────────

async function emailMonthlyReport(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const month = parseInt(formData.get("month") as string);
  const year  = parseInt(formData.get("year")  as string);

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);

  const emailOrgId     = await getActiveOrgId(session);
  const emailOrgFilter = orgWhere(emailOrgId);

  const [payrollData, whtData, incomeData, expenseData] = await Promise.all([
    prisma.payroll.aggregate({ _sum: { paye: true }, where: { createdAt: { gte: start, lte: end }, ...emailOrgFilter } }),
    prisma.consultantPayment.aggregate({ _sum: { withholdingTax: true }, where: { createdAt: { gte: start, lte: end } } }),
    prisma.income.aggregate({ _sum: { amount: true }, where: { receivedDate: { gte: start, lte: end }, ...emailOrgFilter } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { paidDate: { gte: start, lte: end }, ...emailOrgFilter } }),
  ]);

  const paye = payrollData._sum.paye ?? 0;
  const wht  = whtData._sum.withholdingTax ?? 0;
  const net  = (incomeData._sum.amount ?? 0) - (expenseData._sum.amount ?? 0);
  const cit  = net > 0 ? net * CORP_TAX_RATE : 0;

  const recipients = await getRecipientEmails();
  if (recipients.length > 0) {
    await sendTaxReport({
      to:                   recipients,
      period:               `${MONTHS[month - 1]} ${year}`,
      periodType:           "monthly",
      paye,
      wht,
      corporateTaxEstimate: cit,
      netBalance:           net,
    });
  }

  redirect(`/astelfin_26/reports/tax?year=${year}&success=monthly_sent`);
}

async function emailAnnualReport(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const year = parseInt(formData.get("year") as string);

  const start = new Date(year, 0, 1);
  const end   = new Date(year, 11, 31, 23, 59, 59);

  const annualOrgId     = await getActiveOrgId(session);
  const annualOrgFilter = orgWhere(annualOrgId);

  const [payrollData, whtData, incomeData, expenseData] = await Promise.all([
    prisma.payroll.aggregate({ _sum: { paye: true }, where: { createdAt: { gte: start, lte: end }, ...annualOrgFilter } }),
    prisma.consultantPayment.aggregate({ _sum: { withholdingTax: true }, where: { createdAt: { gte: start, lte: end } } }),
    prisma.income.aggregate({ _sum: { amount: true }, where: { receivedDate: { gte: start, lte: end }, ...annualOrgFilter } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { paidDate: { gte: start, lte: end }, ...annualOrgFilter } }),
  ]);

  const paye = payrollData._sum.paye ?? 0;
  const wht  = whtData._sum.withholdingTax ?? 0;
  const net  = (incomeData._sum.amount ?? 0) - (expenseData._sum.amount ?? 0);
  const cit  = net > 0 ? net * CORP_TAX_RATE : 0;

  const recipients = await getRecipientEmails();
  if (recipients.length > 0) {
    await sendTaxReport({
      to:                   recipients,
      period:               String(year),
      periodType:           "annual",
      paye,
      wht,
      corporateTaxEstimate: cit,
      netBalance:           net,
    });
  }

  redirect(`/astelfin_26/reports/tax?year=${year}&success=annual_sent`);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TaxDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; success?: string }>;
}) {
  const { year: yearParam, success } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  // Access: CEO/FM always; other roles need the "View Payroll & Tax Dashboard"
  // permission. canManage gates write actions (record/email remittances).
  const canManage = role === "CEO" || role === "FINANCE_MANAGER";
  let canView = canManage;
  if (!canManage) {
    const dbUser = await prisma.user.findUnique({
      where:  { id: session.user.id! },
      select: { permissions: true },
    });
    const perms = getEffectivePermissions(role, dbUser?.permissions ?? null);
    canView = perms.functions.canViewPayroll;
  }
  if (!canView) redirect("/astelfin_26/dashboard");

  const now         = new Date();
  const currentYear = now.getFullYear();
  const year        = yearParam ? parseInt(yearParam) : currentYear;
  const yearStart   = new Date(year, 0, 1);
  const yearEnd     = new Date(year, 11, 31, 23, 59, 59);

  const activeOrgId = await getActiveOrgId(session);
  const orgFilter   = orgWhere(activeOrgId);

  const [payrollRecords, whtRecords, ytdIncome, ytdExpenses, pendingRemittances, recentRemittances, outstandingPAYE, outstandingWHT, outstandingPensionRecords] = await Promise.all([
    // Payroll PAYE/pension (org-scoped)
    prisma.payroll.findMany({
      where:  { createdAt: { gte: yearStart, lte: yearEnd }, ...orgFilter },
      select: { paye: true, pension: true, pensionEmployer: true, grossSalary: true, exchangeRateUsed: true, createdAt: true },
    }),
    // WHT from consultant payments (global — ConsultantPayment has no organisationId)
    prisma.consultantPayment.findMany({
      where:  { createdAt: { gte: yearStart, lte: yearEnd } },
      select: { withholdingTax: true, createdAt: true },
    }),
    // YTD income (org-scoped)
    prisma.income.aggregate({
      _sum:  { amount: true },
      where: { receivedDate: { gte: yearStart, lte: yearEnd }, ...orgFilter },
    }),
    // YTD expenses (org-scoped)
    prisma.expense.aggregate({
      _sum:  { amount: true },
      where: { paidDate: { gte: yearStart, lte: yearEnd }, ...orgFilter },
    }),
    // Pending CEO approvals (global — TaxRemittance has no organisationId)
    prisma.taxRemittance.findMany({
      where:   { status: "PENDING_CEO" },
      include: { submittedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    // Recent remittances (global)
    prisma.taxRemittance.findMany({
      where:   { createdAt: { gte: yearStart, lte: yearEnd } },
      include: { submittedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take:    20,
    }),
    // Outstanding PAYE (org-scoped)
    prisma.payroll.aggregate({
      _sum:   { paye: true },
      where:  { payeStatus: "OUTSTANDING", paye: { gt: 0 }, ...orgFilter },
    }),
    // Outstanding WHT (global)
    prisma.consultantPayment.aggregate({
      _sum:   { withholdingTax: true },
      where:  { whtStatus: "OUTSTANDING", withholdingTax: { gt: 0 } },
    }),
    // Outstanding Pension (org-scoped) — findMany, not aggregate, so each
    // record's employee-side pension can be converted to MWK individually
    // (pension is stored in the employee's native currency; mixing currencies
    // in a raw SQL SUM would silently misreport foreign-currency salaries)
    prisma.payroll.findMany({
      where:  { pensionStatus: "OUTSTANDING", pension: { gt: 0 }, ...orgFilter },
      select: { pension: true, pensionEmployer: true, grossSalary: true, exchangeRateUsed: true },
    }),
  ]);

  // Employee-side pension is stored in the employee's native currency; employer-side
  // pension (always exactly 10% of gross) is always stored in MWK. Prefer the exact
  // exchange rate snapshotted at run time; for older records fall back to recovering
  // the implied rate from pensionEmployer/grossSalary, rather than summing
  // native-currency amounts together as if they were MWK.
  function employeePensionMWK(p: { pension: number; pensionEmployer: number; grossSalary: number; exchangeRateUsed: number | null }): number {
    if (p.exchangeRateUsed) return p.pension * p.exchangeRateUsed;
    if (p.pensionEmployer <= 0 || p.grossSalary <= 0) return p.pension; // MWK-equivalent already (or zero)
    const impliedRate = (p.pensionEmployer * 10) / p.grossSalary;
    return p.pension * impliedRate;
  }

  // Group by calendar month
  const payeByMonth    = Array.from({ length: 12 }, () => 0);
  const pensionByMonth = Array.from({ length: 12 }, () => 0);
  const whtByMonth     = Array.from({ length: 12 }, () => 0);

  for (const p of payrollRecords) {
    payeByMonth[p.createdAt.getMonth()]    += p.paye;
    pensionByMonth[p.createdAt.getMonth()] += employeePensionMWK(p);
  }
  for (const w of whtRecords) whtByMonth[w.createdAt.getMonth()] += w.withholdingTax;

  const totalPAYE           = payeByMonth.reduce((a, b) => a + b, 0);
  const totalPension        = pensionByMonth.reduce((a, b) => a + b, 0);
  const totalWHT            = whtByMonth.reduce((a, b)  => a + b, 0);
  const netBalance          = (ytdIncome._sum.amount ?? 0) - (ytdExpenses._sum.amount ?? 0);
  const corpTaxEst          = netBalance > 0 ? netBalance * CORP_TAX_RATE : 0;
  const totalTax            = totalPAYE + totalPension + totalWHT + corpTaxEst;
  const currentMonth        = now.getMonth() + 1; // 1-indexed
  const outstandingPAYEAmt    = outstandingPAYE._sum.paye ?? 0;
  const outstandingWHTAmt     = outstandingWHT._sum.withholdingTax ?? 0;
  const outstandingPensionAmt = outstandingPensionRecords.reduce((s, p) => s + employeePensionMWK(p), 0);
  const totalOutstanding      = outstandingPAYEAmt + outstandingWHTAmt + outstandingPensionAmt;

  return (
    <div className="max-w-5xl space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Tax Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Statutory tax obligations aggregated by month — {year}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <form method="GET" className="flex gap-2">
            <select name="year" defaultValue={year}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gold">
              {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button type="submit"
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 font-medium">
              Go
            </button>
          </form>
          {canManage && (
            <Link href="/astelfin_26/reports/tax/record"
              className="text-sm bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              + Record Remittance
            </Link>
          )}
          <Link href="/astelfin_26/financial-health"
            className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
            Financial Health
          </Link>
          <Link href="/astelfin_26/reports"
            className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
            Reports
          </Link>
        </div>
      </div>

      {success === "remittance_submitted" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
          ✓ Remittance submitted for CEO approval. You will be notified once reviewed.
        </div>
      )}
      {success === "monthly_sent" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Monthly tax report emailed to all CEO and Operations Manager accounts.
        </div>
      )}
      {success === "annual_sent" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Annual tax report for {year} emailed to all CEO and Operations Manager accounts.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4">
        <TaxCard label="Total PAYE" value={totalPAYE} color="orange" />
        <TaxCard label="Pension Contributions" value={totalPension} color="orange" />
        <TaxCard label="Withholding Tax (WHT)" value={totalWHT} color="orange" />
        <TaxCard label="Est. Corporate Tax (30%)" value={corpTaxEst} color="orange"
          subtitle={`on net ${formatCurrency(netBalance)}`} />
        <TaxCard label="Total Tax Obligations" value={totalTax} color="navy" />
      </div>

      {/* Outstanding tax alert */}
      {totalOutstanding > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-orange-800">
                  {formatCurrency(totalOutstanding)} in Outstanding Unremitted Taxes
                </p>
                <p className="text-xs text-orange-700 mt-0.5">
                  {[
                    outstandingPAYEAmt    > 0 && `PAYE: ${formatCurrency(outstandingPAYEAmt)}`,
                    outstandingPensionAmt > 0 && `Pension: ${formatCurrency(outstandingPensionAmt)}`,
                    outstandingWHTAmt     > 0 && `WHT: ${formatCurrency(outstandingWHTAmt)}`,
                  ].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            {canManage && (
              <Link href="/astelfin_26/reports/tax/record"
                className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Record Remittance →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pending CEO approvals */}
      {pendingRemittances.length > 0 && (
        <div className={`rounded-2xl border p-5 ${role === "CEO" ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-200"}`}>
          <div className="flex items-start gap-3">
            <svg className={`w-5 h-5 mt-0.5 shrink-0 ${role === "CEO" ? "text-amber-500" : "text-blue-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className={`text-sm font-bold mb-1 ${role === "CEO" ? "text-amber-800" : "text-blue-800"}`}>
                {role === "CEO"
                  ? `${pendingRemittances.length} Tax Remittance${pendingRemittances.length !== 1 ? "s" : ""} Awaiting Your Approval`
                  : `${pendingRemittances.length} Remittance${pendingRemittances.length !== 1 ? "s" : ""} Pending CEO Approval`}
              </p>
              <div className="space-y-2 mt-2">
                {pendingRemittances.map((r) => (
                  <div key={r.id}
                    className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-sm">
                    <div>
                      <span className="font-semibold text-brand-navy">{r.taxType}</span>
                      <span className="ml-2 text-gray-500 text-xs">{r.period}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        · by {r.submittedBy.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-orange-700">{formatCurrency(r.amount)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        r.remittanceType === "WAIVED" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                      }`}>
                        {r.remittanceType === "WAIVED" ? "Waiver" : "Paid"}
                      </span>
                      <Link href={`/astelfin_26/reports/tax/remittances/${r.id}`}
                        className={`text-xs font-semibold hover:underline ${role === "CEO" ? "text-amber-700" : "text-brand-gold"}`}>
                        {role === "CEO" ? "Review →" : "View →"}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-brand-navy text-sm">Monthly Breakdown — {year}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              PAYE &amp; Pension from payroll runs · WHT from consultant payments
            </p>
          </div>
          {canManage && (
            <form action={emailAnnualReport}>
              <input type="hidden" name="year" value={year} />
              <button type="submit"
                className="text-xs bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors">
                📧 Email Annual Report
              </button>
            </form>
          )}
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Month</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">PAYE</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Pension</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">WHT</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Monthly Total</th>
              <th className="px-5 py-2.5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MONTHS.map((monthLabel, i) => {
              const monthNum = i + 1;
              const paye    = payeByMonth[i];
              const pension = pensionByMonth[i];
              const wht     = whtByMonth[i];
              const total   = paye + pension + wht;
              const isFuture = year === currentYear && monthNum > currentMonth;
              const hasData  = paye > 0 || pension > 0 || wht > 0;
              return (
                <tr key={monthLabel}
                  className={`hover:bg-gray-50/50 ${isFuture ? "opacity-40" : ""}`}>
                  <td className="px-5 py-3 text-gray-700 font-medium">
                    {monthLabel} {year}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-orange-600">
                    {paye > 0 ? formatCurrency(paye) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-orange-600">
                    {pension > 0 ? formatCurrency(pension) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-orange-600">
                    {wht > 0 ? formatCurrency(wht) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-brand-navy">
                    {total > 0 ? formatCurrency(total) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {canManage && !isFuture && hasData && (
                      <form action={emailMonthlyReport} className="inline">
                        <input type="hidden" name="month" value={monthNum} />
                        <input type="hidden" name="year"  value={year} />
                        <button type="submit"
                          className="text-xs text-brand-gold hover:underline font-semibold whitespace-nowrap">
                          📧 Email
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 bg-gray-50">
            <tr>
              <td className="px-5 py-3 font-bold text-brand-navy">Annual Total</td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-orange-600">
                {formatCurrency(totalPAYE)}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-orange-600">
                {formatCurrency(totalPension)}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-orange-600">
                {formatCurrency(totalWHT)}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-brand-navy">
                {formatCurrency(totalPAYE + totalPension + totalWHT)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Remittance history */}
      {recentRemittances.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-brand-navy text-sm">Tax Remittances — {year}</h2>
              <p className="text-xs text-gray-400 mt-0.5">History of submitted remittances for this year</p>
            </div>
            <Link href="/astelfin_26/reports/tax/record"
              className="text-xs text-brand-gold font-semibold hover:underline">
              + New Remittance
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Tax Type</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Period</th>
                <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Submitted by</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRemittances.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-2.5 font-semibold text-brand-navy">{r.taxType}</td>
                  <td className="px-5 py-2.5 text-gray-600">{r.period}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-orange-600">
                    {formatCurrency(r.amount)}
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.remittanceType === "WAIVED"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {r.remittanceType === "WAIVED" ? "MRA Remission" : "Paid"}
                    </span>
                  </td>
                  <td className="px-5 py-2.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      r.status === "CEO_APPROVED" ? "bg-green-100 text-green-700" :
                      r.status === "CEO_REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {r.status === "CEO_APPROVED" ? "Approved" :
                       r.status === "CEO_REJECTED" ? "Rejected" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-gray-500 text-xs">{r.submittedBy.name}</td>
                  <td className="px-5 py-2.5">
                    <Link href={`/astelfin_26/reports/tax/remittances/${r.id}`}
                      className="text-xs text-brand-gold font-semibold hover:underline whitespace-nowrap">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Corporate income tax estimate */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-amber-800 text-sm">
          Corporate Income Tax Estimate — {year}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Income</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(ytdIncome._sum.amount ?? 0)}
            </p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Expenses</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(ytdExpenses._sum.amount ?? 0)}
            </p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Net Balance</p>
            <p className={`text-xl font-bold ${netBalance >= 0 ? "text-brand-navy" : "text-red-600"}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-amber-200">
          <div>
            <p className="text-sm text-amber-800 font-semibold">
              Estimated CIT at 30% of taxable income
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Actual CIT depends on allowable deductions, tax credits, and MRA assessment.
            </p>
          </div>
          <p className={`text-2xl font-bold ${corpTaxEst > 0 ? "text-orange-600" : "text-gray-400"}`}>
            {formatCurrency(corpTaxEst)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function TaxCard({
  label, value, color, subtitle,
}: {
  label: string; value: number; color: "orange" | "navy"; subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${
        color === "navy" ? "text-brand-navy" : "text-orange-600"
      }`}>
        {formatCurrency(value)}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}
