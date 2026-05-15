/**
 * Phase 13 — Profit & Loss Report
 *
 * Monthly breakdown of income vs expenses for a selected year, all converted
 * to MWK equivalent using RBM middle rates. Includes payroll as an expense
 * category. Printable (print-only styles) with CSV export.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { buildRateMap, toMWK, fmtMWK } from "@/lib/fx";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import { PrintButton, AutoSubmitSelect } from "@/components/finance/PrintButton";
import Link from "next/link";

export const metadata = {
  title: "P&L Report | Astellic Finance",
  robots: { index: false, follow: false },
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default async function PLReportPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const { year: yearParam } = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = parseInt(yearParam ?? String(currentYear)) || currentYear;

  const yearStart = new Date(year, 0, 1);
  const yearEnd   = new Date(year + 1, 0, 1);

  const activeOrgId = await getActiveOrgId(session);
  const orgFilter   = orgWhere(activeOrgId);

  // ── Exchange rates ──────────────────────────────────────────────────────────
  const exchangeRates = await prisma.exchangeRate.findMany({
    select: { currency: true, middleRate: true, updatedAt: true },
  });
  const rates = buildRateMap(exchangeRates);

  // ── Income by month × currency ──────────────────────────────────────────────
  const incomeRows = await prisma.income.groupBy({
    by:    ["currency"],
    where: { receivedDate: { gte: yearStart, lt: yearEnd }, deletedAt: null, ...orgFilter },
    _sum:  { amount: true },
  });
  // Also need monthly breakdown — fetch raw for grouping
  const incomeRaw = await prisma.income.findMany({
    where:  { receivedDate: { gte: yearStart, lt: yearEnd }, deletedAt: null, ...orgFilter },
    select: { receivedDate: true, amount: true, currency: true, incomeType: true },
  });

  // ── Expenses by month × currency ───────────────────────────────────────────
  const expenseRaw = await prisma.expense.findMany({
    where:  { paidDate: { gte: yearStart, lt: yearEnd }, deletedAt: null, ...orgFilter },
    select: { paidDate: true, amount: true, currency: true, category: true },
  });

  // ── Payroll by period ───────────────────────────────────────────────────────
  // Payroll.period is "YYYY-MM", netPay is always in employee's currency
  const payrollRaw = await prisma.payroll.findMany({
    where:  {
      period:    { startsWith: String(year) + "-" },
      deletedAt: null,
      status:    { not: "PENDING" }, // only PAID / PARTIAL
      ...orgFilter,
    },
    select: { period: true, netPay: true, currency: true },
  });

  // ── Build monthly buckets ───────────────────────────────────────────────────
  interface MonthBucket {
    income:   number; // MWK
    expenses: number; // MWK
    payroll:  number; // MWK
  }
  const months: MonthBucket[] = Array.from({ length: 12 }, () => ({
    income: 0, expenses: 0, payroll: 0,
  }));

  for (const r of incomeRaw) {
    const m = new Date(r.receivedDate).getMonth(); // 0-11
    months[m].income += toMWK(r.amount, r.currency, rates);
  }
  for (const r of expenseRaw) {
    const m = new Date(r.paidDate).getMonth();
    months[m].expenses += toMWK(r.amount, r.currency, rates);
  }
  for (const r of payrollRaw) {
    const m = parseInt(r.period.split("-")[1], 10) - 1; // "YYYY-MM" → 0-based
    if (m >= 0 && m < 12) {
      months[m].payroll += toMWK(r.netPay, r.currency, rates);
    }
  }

  // ── Expense by category (annual totals) ────────────────────────────────────
  const catGroups = await prisma.expense.groupBy({
    by:    ["category", "currency"],
    where: { paidDate: { gte: yearStart, lt: yearEnd }, deletedAt: null },
    _sum:  { amount: true },
  });
  const catMap: Record<string, number> = {};
  for (const g of catGroups) {
    catMap[g.category] = (catMap[g.category] ?? 0) + toMWK(g._sum.amount ?? 0, g.currency, rates);
  }
  const categoryRows = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1]);

  // ── Income by type (annual totals) ─────────────────────────────────────────
  const typeGroups: Record<string, number> = {};
  for (const r of incomeRaw) {
    typeGroups[r.incomeType] = (typeGroups[r.incomeType] ?? 0) + toMWK(r.amount, r.currency, rates);
  }
  const incomeTypeRows = Object.entries(typeGroups).sort((a, b) => b[1] - a[1]);

  // ── Annual totals ───────────────────────────────────────────────────────────
  const totalIncome   = months.reduce((s, m) => s + m.income, 0);
  const totalExpenses = months.reduce((s, m) => s + m.expenses + m.payroll, 0);
  const netSurplus    = totalIncome - totalExpenses;

  // ── Year range for selector ─────────────────────────────────────────────────
  const earliestYear = await prisma.income.findFirst({
    where:   { deletedAt: null },
    orderBy: { receivedDate: "asc" },
    select:  { receivedDate: true },
  });
  const startYear = earliestYear ? new Date(earliestYear.receivedDate).getFullYear() : currentYear;
  const years = Array.from(
    { length: currentYear - startYear + 2 },
    (_, i) => currentYear + 1 - i,
  );

  const csvUrl = `/api/reports/pl?year=${year}`;

  return (
    <div className="space-y-8">
      {/* Print header (hidden on screen) */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Profit &amp; Loss — {year}</h1>
        <p className="text-sm text-gray-500">Astellic Finance · All values in MWK equivalent</p>
        <p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString("en-MW")}</p>
      </div>

      {/* Screen header */}
      <div className="print:hidden">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/astelfin_26/reports" className="hover:text-brand-gold">Reports</Link>
          <span>›</span>
          <span className="text-gray-600">Profit &amp; Loss</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Profit &amp; Loss</h1>
            <p className="text-gray-500 text-sm mt-1">
              All values in MWK equivalent using RBM middle rates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Year selector */}
            <form method="GET">
              <AutoSubmitSelect
                name="year"
                defaultValue={year}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </AutoSubmitSelect>
            </form>
            <a
              href={csvUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold px-3 py-2 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </a>
            <a
              href={`/api/reports/export?type=pl&year=${year}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold border border-green-300 text-green-700 hover:bg-green-50 px-3 py-2 rounded-xl transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Excel
            </a>
            <PrintButton className="inline-flex items-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold px-3 py-2 rounded-xl transition-colors" />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-green-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Total Income {year}</p>
          <p className="text-2xl font-bold text-green-600">{fmtMWK(totalIncome)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Total Expenses {year}</p>
          <p className="text-2xl font-bold text-red-600">{fmtMWK(totalExpenses)}</p>
          <p className="text-[10px] text-gray-400 mt-1">includes payroll</p>
        </div>
        <div className={`rounded-2xl p-5 border border-gray-100 ${netSurplus >= 0 ? "bg-brand-light" : "bg-red-50"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            {netSurplus >= 0 ? "Surplus" : "Deficit"} {year}
          </p>
          <p className={`text-2xl font-bold ${netSurplus >= 0 ? "text-brand-navy" : "text-red-600"}`}>
            {fmtMWK(Math.abs(netSurplus))}
          </p>
        </div>
      </div>

      {/* Monthly P&L table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 print:hidden">
          <h2 className="font-bold text-brand-navy">Monthly Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Month</th>
                <th className="text-right px-5 py-3 font-semibold text-green-600 text-xs uppercase tracking-wide">Income</th>
                <th className="text-right px-5 py-3 font-semibold text-orange-500 text-xs uppercase tracking-wide">Payroll</th>
                <th className="text-right px-5 py-3 font-semibold text-red-600 text-xs uppercase tracking-wide">Expenses</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Total Outflow</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Net</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {months.map((m, i) => {
                const outflow = m.expenses + m.payroll;
                const net     = m.income - outflow;
                const empty   = m.income === 0 && outflow === 0;
                return (
                  <tr key={i} className={empty ? "opacity-40" : ""}>
                    <td className="px-5 py-2.5 font-medium text-brand-navy">{MONTH_NAMES[i]}</td>
                    <td className="px-5 py-2.5 text-right text-green-600 font-medium">{fmtMWK(m.income)}</td>
                    <td className="px-5 py-2.5 text-right text-orange-500">{fmtMWK(m.payroll)}</td>
                    <td className="px-5 py-2.5 text-right text-red-500">{fmtMWK(m.expenses)}</td>
                    <td className="px-5 py-2.5 text-right text-red-600 font-medium">{fmtMWK(outflow)}</td>
                    <td className={`px-5 py-2.5 text-right font-bold ${net >= 0 ? "text-brand-navy" : "text-red-600"}`}>
                      {fmtMWK(net)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-bold">
              <tr>
                <td className="px-5 py-3 text-brand-navy text-xs uppercase tracking-wide">Total</td>
                <td className="px-5 py-3 text-right text-green-600">{fmtMWK(totalIncome)}</td>
                <td className="px-5 py-3 text-right text-orange-500">
                  {fmtMWK(months.reduce((s, m) => s + m.payroll, 0))}
                </td>
                <td className="px-5 py-3 text-right text-red-500">
                  {fmtMWK(months.reduce((s, m) => s + m.expenses, 0))}
                </td>
                <td className="px-5 py-3 text-right text-red-600">{fmtMWK(totalExpenses)}</td>
                <td className={`px-5 py-3 text-right ${netSurplus >= 0 ? "text-brand-navy" : "text-red-600"}`}>
                  {fmtMWK(netSurplus)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Income by type / Expenses by category */}
      <div className="grid grid-cols-2 gap-6 print:break-inside-avoid">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy text-sm">Income by Type</h2>
          </div>
          {incomeTypeRows.length === 0 ? (
            <p className="px-6 py-6 text-center text-gray-400 text-sm">No income recorded.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {incomeTypeRows.map(([type, amt]) => (
                <li key={type} className="px-6 py-3 flex items-center justify-between">
                  <span className="text-sm text-brand-navy font-medium">
                    {type === "GRANT" ? "Grant" : type === "PRIVATE_SERVICE" ? "Private Service" : "Donation"}
                  </span>
                  <span className="text-sm font-bold text-green-600">{fmtMWK(amt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy text-sm">Expenses by Category</h2>
          </div>
          {categoryRows.length === 0 ? (
            <p className="px-6 py-6 text-center text-gray-400 text-sm">No expenses recorded.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {categoryRows.map(([cat, amt]) => (
                <li key={cat} className="px-6 py-3 flex items-center justify-between">
                  <span className="text-sm text-brand-navy font-medium">{cat}</span>
                  <span className="text-sm font-bold text-red-600">{fmtMWK(amt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Print-only footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Astellic Finance · P&amp;L Report {year} · Printed {new Date().toLocaleString("en-MW")}
      </div>
    </div>
  );
}
