/**
 * Phase 13 — Budget vs Actual Report
 *
 * For each active BudgetLine in a fiscal year, shows:
 *   - Ceiling (budgeted amount)
 *   - Actual spend (FM-approved liquidations + paid payables + paid submissions)
 *   - Variance and % utilised
 *
 * Printable and CSV-exportable.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { buildRateMap, toMWK, fmtMWK } from "@/lib/fx";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import { PrintButton } from "@/components/finance/PrintButton";
import Link from "next/link";

export const metadata = {
  title: "Budget vs Actual | Astellic Finance",
  robots: { index: false, follow: false },
};

function pctBar(pct: number) {
  const clamped = Math.min(pct, 100);
  const color =
    pct >= 100 ? "bg-red-500" :
    pct >= 80  ? "bg-amber-400" :
                 "bg-green-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 min-w-[60px]">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${clamped}%` }} />
      </div>
      <span className={`text-xs font-semibold tabular-nums w-10 text-right ${
        pct >= 100 ? "text-red-600" : pct >= 80 ? "text-amber-600" : "text-gray-600"
      }`}>
        {pct.toFixed(0)}%
      </span>
    </div>
  );
}

export default async function BudgetReportPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; project?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const { year: yearParam, project: projectFilter } = await searchParams;
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

  // ── Budget lines for this fiscal year ──────────────────────────────────────
  // BudgetLine has no organisationId — filter via linked project's org.
  // Lines with no project (org-wide lines) are always included.
  const budgetLineOrgFilter = activeOrgId
    ? {
        OR: [
          { projectId: null },
          { project: { organisationId: activeOrgId } },
          { project: { organisationId: null } },
        ],
      }
    : {};

  const budgetLines = await prisma.budgetLine.findMany({
    where:   { fiscalYear: year, active: true, ...budgetLineOrgFilter },
    include: { project: { select: { id: true, name: true } } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // ── Actual spend per budget line ────────────────────────────────────────────
  // Source 1: FM-approved liquidations
  const liquidations = await prisma.liquidation.findMany({
    where:    { status: "FM_APPROVED", deletedAt: null, liquidationDate: { gte: yearStart, lt: yearEnd } },
    select:   { budgetLine: true, fundsAccountedFor: true, currency: true },
  });

  // Source 2: Paid account payables
  const payables = await prisma.accountPayable.findMany({
    where:    { status: "PAID", deletedAt: null, paidDate: { gte: yearStart, lt: yearEnd } },
    select:   { budgetLine: true, amount: true, currency: true },
  });

  // Source 3: Paid expense-request submissions (REQUEST type, paid)
  const paidSubmissions = await prisma.submission.findMany({
    where:    { status: "PAID", type: "REQUEST", deletedAt: null, updatedAt: { gte: yearStart, lt: yearEnd } },
    select:   { budgetLine: true, totalAmount: true, currency: true },
  });

  // ── Roll up spend by budget line name ──────────────────────────────────────
  const spendMap: Record<string, number> = {}; // budgetLine name → MWK

  for (const l of liquidations) {
    if (!l.budgetLine) continue;
    spendMap[l.budgetLine] = (spendMap[l.budgetLine] ?? 0) + toMWK(l.fundsAccountedFor, l.currency, rates);
  }
  for (const p of payables) {
    if (!p.budgetLine) continue;
    spendMap[p.budgetLine] = (spendMap[p.budgetLine] ?? 0) + toMWK(p.amount, p.currency, rates);
  }
  for (const s of paidSubmissions) {
    if (!s.budgetLine) continue;
    spendMap[s.budgetLine] = (spendMap[s.budgetLine] ?? 0) + toMWK(s.totalAmount, s.currency, rates);
  }

  // ── Filter by project if requested ─────────────────────────────────────────
  const filtered = projectFilter
    ? budgetLines.filter((b) => b.project?.id === projectFilter)
    : budgetLines;

  // ── Projects for filter dropdown ───────────────────────────────────────────
  const projectsOnLines = Array.from(
    new Map(
      budgetLines
        .filter((b) => b.project)
        .map((b) => [b.project!.id, b.project!.name])
    ).entries()
  );

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalCeiling = filtered.reduce((s, b) => s + toMWK(b.ceiling ?? 0, b.currency, rates), 0);
  const totalSpend   = filtered.reduce((s, b) => s + (spendMap[b.name] ?? 0), 0);
  const totalVariance = totalCeiling - totalSpend;
  const overBudget   = filtered.filter((b) => (spendMap[b.name] ?? 0) > toMWK(b.ceiling ?? Infinity, b.currency, rates));

  const yearRange = Array.from({ length: 5 }, (_, i) => currentYear + 1 - i);
  const csvUrl = `/api/reports/budget?year=${year}${projectFilter ? `&project=${projectFilter}` : ""}`;

  return (
    <div className="space-y-8">
      {/* Print header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">Budget vs Actual — FY{year}</h1>
        <p className="text-sm text-gray-500">Astellic Finance · All values in MWK equivalent</p>
        <p className="text-xs text-gray-400">Generated {new Date().toLocaleDateString("en-MW")}</p>
      </div>

      {/* Screen header */}
      <div className="print:hidden">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/astelfin_26/reports" className="hover:text-brand-gold">Reports</Link>
          <span>›</span>
          <span className="text-gray-600">Budget vs Actual</span>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Budget vs Actual</h1>
            <p className="text-gray-500 text-sm mt-1">
              Compares budget ceilings against approved spend for FY{year}.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <form method="GET" className="flex items-center gap-2">
              <select name="year" defaultValue={year}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30">
                {yearRange.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              {projectsOnLines.length > 0 && (
                <select name="project" defaultValue={projectFilter ?? ""}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30">
                  <option value="">All projects</option>
                  {projectsOnLines.map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
              )}
              <button type="submit"
                className="text-xs font-semibold bg-brand-navy text-white px-3 py-2 rounded-xl">
                Apply
              </button>
            </form>
            <a href={csvUrl}
              className="inline-flex items-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold px-3 py-2 rounded-xl transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </a>
            <PrintButton className="inline-flex items-center gap-1.5 text-xs font-semibold border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold px-3 py-2 rounded-xl transition-colors" />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {overBudget.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-700 flex items-start gap-2 print:hidden">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>
            <strong>{overBudget.length} budget line{overBudget.length > 1 ? "s" : ""} over ceiling:</strong>{" "}
            {overBudget.map((b) => b.name).join(", ")}
          </span>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-brand-light rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Total Budget</p>
          <p className="text-2xl font-bold text-brand-navy">{fmtMWK(totalCeiling)}</p>
          <p className="text-[10px] text-gray-400 mt-1">{filtered.filter(b => b.ceiling).length} lines with ceiling</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Total Spend</p>
          <p className="text-2xl font-bold text-red-600">{fmtMWK(totalSpend)}</p>
          <p className="text-[10px] text-gray-400 mt-1">approved liquidations + payables + requests</p>
        </div>
        <div className={`rounded-2xl p-5 border border-gray-100 ${totalVariance < 0 ? "bg-red-50" : "bg-green-50"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Variance</p>
          <p className={`text-2xl font-bold ${totalVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
            {totalVariance >= 0 ? "" : "−"}{fmtMWK(Math.abs(totalVariance))}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">
            {totalCeiling > 0 ? ((totalSpend / totalCeiling) * 100).toFixed(1) : "–"}% utilised
          </p>
        </div>
      </div>

      {/* Budget lines table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center text-gray-400 text-sm">
          No budget lines found for FY{year}.{" "}
          <Link href="/astelfin_26/budget" className="text-brand-gold hover:underline">Manage budget lines →</Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Budget Line</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide print:hidden">Category</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Ceiling</th>
                  <th className="text-right px-5 py-3 font-semibold text-red-600 text-xs uppercase tracking-wide">Actual Spend</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Variance</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-600 print:hidden" style={{ width: "140px" }}>Utilisation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => {
                  const ceilingMWK = b.ceiling != null ? toMWK(b.ceiling, b.currency, rates) : null;
                  const actual     = spendMap[b.name] ?? 0;
                  const variance   = ceilingMWK != null ? ceilingMWK - actual : null;
                  const pct        = ceilingMWK && ceilingMWK > 0 ? (actual / ceilingMWK) * 100 : null;
                  const overrun    = ceilingMWK != null && actual > ceilingMWK;

                  return (
                    <tr key={b.id} className={overrun ? "bg-red-50/50" : ""}>
                      <td className="px-5 py-3">
                        <p className="font-medium text-brand-navy">{b.name}</p>
                        {b.project && (
                          <p className="text-[10px] text-gray-400 mt-0.5">{b.project.name}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500 text-xs print:hidden">{b.category}</td>
                      <td className="px-5 py-3 text-right">
                        {ceilingMWK != null ? (
                          <span className="font-medium text-brand-navy">{fmtMWK(ceilingMWK)}</span>
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </td>
                      <td className={`px-5 py-3 text-right font-medium ${overrun ? "text-red-600" : "text-gray-700"}`}>
                        {fmtMWK(actual)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {variance != null ? (
                          <span className={`font-medium ${variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {variance >= 0 ? "" : "−"}{fmtMWK(Math.abs(variance))}
                          </span>
                        ) : (
                          <span className="text-gray-300">–</span>
                        )}
                      </td>
                      <td className="px-5 py-3 print:hidden">
                        {pct != null ? pctBar(pct) : <span className="text-xs text-gray-300">No ceiling</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50 font-bold">
                <tr>
                  <td colSpan={2} className="px-5 py-3 text-brand-navy text-xs uppercase tracking-wide print:hidden">Totals</td>
                  <td className="px-5 py-3 print:hidden" />
                  <td className="px-5 py-3 text-right text-brand-navy">{fmtMWK(totalCeiling)}</td>
                  <td className="px-5 py-3 text-right text-red-600">{fmtMWK(totalSpend)}</td>
                  <td className={`px-5 py-3 text-right ${totalVariance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {totalVariance >= 0 ? "" : "−"}{fmtMWK(Math.abs(totalVariance))}
                  </td>
                  <td className="px-5 py-3 print:hidden">
                    {totalCeiling > 0 ? pctBar((totalSpend / totalCeiling) * 100) : null}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Print footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
        Astellic Finance · Budget vs Actual FY{year} · Printed {new Date().toLocaleString("en-MW")}
      </div>
    </div>
  );
}
