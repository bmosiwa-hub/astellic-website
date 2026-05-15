import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/finance-utils";
import { getActiveOrgId, orgWhere } from "@/lib/org";

export const metadata = { title: "Utilisation Report | Astelfin IMS", robots: { index: false, follow: false } };

export default async function UtilisationPage({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const sp = await searchParams;
  const year = parseInt(sp.year ?? new Date().getFullYear().toString());
  const orgId = await getActiveOrgId(session);

  // Projects with timesheet data
  const projects = await prisma.project.findMany({
    where: { ...orgWhere(orgId), status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      budget: true,
      currency: true,
      personnelCosts: true,
      milestones: {
        select: { title: true, paymentExpected: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  // Timesheet entries for the year — group by project
  const startOfYear = new Date(year, 0, 1);
  const endOfYear   = new Date(year, 11, 31, 23, 59, 59);

  const entries = await prisma.timesheetEntry.findMany({
    where: {
      date: { gte: startOfYear, lte: endOfYear },
      project: { not: null },
      timesheet: {
        status: "APPROVED",
        year,
      },
    },
    select: { project: true, hours: true },
  });

  // Aggregate hours by project name
  const hoursByProject: Record<string, number> = {};
  for (const e of entries) {
    if (e.project) {
      hoursByProject[e.project] = (hoursByProject[e.project] ?? 0) + e.hours;
    }
  }

  // Employees with salary data for cost-per-hour calculation
  const employees = await prisma.employee.findMany({
    where: { ...orgWhere(orgId), active: true },
    select: { id: true, name: true, grossSalary: true, currency: true },
  });

  // Total budgeted employee cost per hour (rough: annual cost / 2080 working hours)
  const totalAnnualCost = employees.reduce((s, e) => s + e.grossSalary * 12, 0);
  const costPerHour = employees.length > 0 ? totalAnnualCost / (employees.length * 2080) : 0;

  const totalHours = Object.values(hoursByProject).reduce((s, h) => s + h, 0);
  const billedHours = Object.entries(hoursByProject)
    .filter(([proj]) => projects.some(p => p.name === proj))
    .reduce((s, [, h]) => s + h, 0);
  const utilisation = totalHours > 0 ? (billedHours / totalHours) * 100 : 0;

  // Budget lines with spend data
  const budgetLines = await prisma.budgetLine.findMany({
    where: { fiscalYear: year },
    select: { id: true, name: true, ceiling: true, category: true, currency: true, project: { select: { name: true } } },
    orderBy: { name: "asc" },
  });

  // Expenses grouped by budgetLine (via liquidations + account payables)
  // Simple: just show budget lines vs project hours
  const rows = projects.map(proj => {
    const hrs = hoursByProject[proj.name] ?? 0;
    const imputedCost = hrs * costPerHour;
    const budget = proj.budget ?? proj.personnelCosts ?? 0;
    const utilisationPct = budget > 0 ? Math.min(100, (imputedCost / budget) * 100) : null;

    return { proj, hrs, imputedCost, budget, utilisationPct };
  });

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisation Report</h1>
          <p className="text-sm text-gray-500 mt-1">Timesheet hours vs project budgets — {year}</p>
        </div>
        <form method="GET" className="flex items-center gap-2">
          <select name="year" defaultValue={year} className="border rounded-lg px-3 py-2 text-sm">
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button className="bg-brand-navy text-white text-sm px-3 py-2 rounded-lg hover:opacity-90">View</button>
        </form>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Total Hours Logged</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalHours.toFixed(0)}</p>
          <p className="text-xs text-gray-400">Approved timesheets, {year}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Project-Billed Hours</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{billedHours.toFixed(0)}</p>
          <p className="text-xs text-gray-400">Chargeable to projects</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Utilisation Rate</p>
          <p className={`text-2xl font-bold mt-1 ${utilisation >= 70 ? "text-green-600" : utilisation >= 50 ? "text-yellow-600" : "text-red-600"}`}>
            {utilisation.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-400">Target: ≥ 70%</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs font-medium text-gray-500">Cost / Hour (avg)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(costPerHour, "MWK")}</p>
          <p className="text-xs text-gray-400">Annual salary ÷ 2,080 hrs</p>
        </div>
      </div>

      {/* By Project */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">By Project</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Project</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Hours Logged</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Imputed Cost</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Budget</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Utilisation</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Milestones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No active projects with timesheets</td></tr>
              )}
              {rows.map(({ proj, hrs, imputedCost, budget, utilisationPct }) => {
                const approved = proj.milestones.filter(m => m.status === "APPROVED").length;
                const total    = proj.milestones.length;
                return (
                  <tr key={proj.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{proj.name}</td>
                    <td className="px-4 py-3 text-right">{hrs.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(imputedCost, "MWK")}</td>
                    <td className="px-4 py-3 text-right">{budget > 0 ? formatCurrency(budget, proj.currency) : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      {utilisationPct !== null ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${utilisationPct >= 80 ? "bg-green-500" : utilisationPct >= 50 ? "bg-yellow-500" : "bg-red-400"}`}
                              style={{ width: `${Math.min(100, utilisationPct)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${utilisationPct >= 80 ? "text-green-700" : utilisationPct >= 50 ? "text-yellow-700" : "text-red-700"}`}>
                            {utilisationPct.toFixed(0)}%
                          </span>
                        </div>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{approved}/{total} approved</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Hours by Project Name (from timesheet entries) */}
      {Object.keys(hoursByProject).length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Hours by Activity / Project (from timesheets)</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Project / Activity</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Hours</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(hoursByProject)
                  .sort(([, a], [, b]) => b - a)
                  .map(([proj, hrs]) => (
                    <tr key={proj} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{proj}</td>
                      <td className="px-4 py-3 text-right font-medium">{hrs.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {totalHours > 0 ? ((hrs / totalHours) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
