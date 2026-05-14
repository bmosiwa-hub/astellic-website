/**
 * Reports hub — Phase 13
 *
 * Landing page for all financial reports. Shows a YTD summary with MWK
 * conversion and cards linking to the three detailed report pages.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { buildRateMap, toMWK, fmtMWK, ratesAgeHours } from "@/lib/fx";
import Link from "next/link";

export const metadata = {
  title: "Reports | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const now        = new Date();
  const year       = now.getFullYear();
  const yearStart  = new Date(year, 0, 1);
  const yearEnd    = new Date(year + 1, 0, 1);

  // ── Exchange rates ──────────────────────────────────────────────────────────
  const exchangeRates = await prisma.exchangeRate.findMany({
    select: { currency: true, middleRate: true, updatedAt: true },
  });
  const rates    = buildRateMap(exchangeRates);
  const ratesAge = ratesAgeHours(exchangeRates);

  // ── YTD income & expenses (multi-currency) ──────────────────────────────────
  const [incomeGroups, expenseGroups, activeBudgetLines, activeGrants] = await Promise.all([
    prisma.income.groupBy({
      by:    ["currency"],
      where: { receivedDate: { gte: yearStart, lt: yearEnd }, deletedAt: null },
      _sum:  { amount: true },
    }),
    prisma.expense.groupBy({
      by:    ["currency"],
      where: { paidDate: { gte: yearStart, lt: yearEnd }, deletedAt: null },
      _sum:  { amount: true },
    }),
    prisma.budgetLine.count({ where: { fiscalYear: year, active: true } }),
    prisma.donorGrant.count({ where: { status: "ACTIVE" } }),
  ]);

  const ytdIncome   = incomeGroups.reduce((s, g) => s + toMWK(g._sum.amount ?? 0, g.currency, rates), 0);
  const ytdExpenses = expenseGroups.reduce((s, g) => s + toMWK(g._sum.amount ?? 0, g.currency, rates), 0);
  const ytdNet      = ytdIncome - ytdExpenses;

  const reports = [
    {
      title:       "Profit & Loss",
      description: "Monthly income vs expense breakdown with payroll, all in MWK. Select any year.",
      href:        `/astelfin_26/reports/pl?year=${year}`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      color:       "text-green-600 bg-green-50",
    },
    {
      title:       "Budget vs Actual",
      description: `${activeBudgetLines} active budget lines for FY${year}. Compare ceilings against approved spend.`,
      href:        `/astelfin_26/reports/budget?year=${year}`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color:       "text-brand-navy bg-brand-light",
    },
    {
      title:       "Grant Portfolio",
      description: `${activeGrants} active grant${activeGrants !== 1 ? "s" : ""}. Track received vs spent, budget line utilisation.`,
      href:        "/astelfin_26/grants",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color:       "text-orange-600 bg-orange-50",
    },
    {
      title:       "Tax &amp; Remittances",
      description: "PAYE, WHT, pension and CIT remittance history with approval status.",
      href:        "/astelfin_26/reports/tax",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      ),
      color:       "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">
          Financial reports for {year}. All multi-currency values shown in MWK equivalent.
        </p>
      </div>

      {/* Stale rates warning */}
      {ratesAge != null && ratesAge > 72 && (
        <div className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl border bg-amber-50 border-amber-200 text-amber-700">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Exchange rates are {Math.round(ratesAge / 24)} days old — MWK totals may not reflect current market rates.
        </div>
      )}

      {/* YTD summary */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-green-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">YTD Income {year}</p>
          <p className="text-2xl font-bold text-green-600">{fmtMWK(ytdIncome)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">YTD Expenses {year}</p>
          <p className="text-2xl font-bold text-red-600">{fmtMWK(ytdExpenses)}</p>
        </div>
        <div className={`rounded-2xl p-5 border border-gray-100 ${ytdNet >= 0 ? "bg-brand-light" : "bg-red-50"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">YTD Net {year}</p>
          <p className={`text-2xl font-bold ${ytdNet >= 0 ? "text-brand-navy" : "text-red-600"}`}>
            {fmtMWK(ytdNet)}
          </p>
        </div>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-2 gap-5">
        {reports.map((r) => (
          <Link
            key={r.href}
            href={r.href}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all p-6 flex items-start gap-4"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${r.color}`}>
              {r.icon}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-brand-navy mb-1"
                dangerouslySetInnerHTML={{ __html: r.title }} />
              <p className="text-sm text-gray-500 leading-relaxed">{r.description}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 shrink-0 mt-1 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
