import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";

export const metadata = {
  title: "Reports | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function ReportsPage() {
  const now = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const [incomeYTD, expensesYTD, projectSummary, expenseByCategory] =
    await Promise.all([
      prisma.income.aggregate({
        _sum: { amount: true },
        where: { receivedDate: { gte: yearStart } },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { paidDate: { gte: yearStart } },
      }),
      prisma.project.findMany({
        include: {
          income: { select: { amount: true } },
          expenses: { select: { amount: true } },
        },
        orderBy: { startDate: "desc" },
      }),
      prisma.expense.groupBy({
        by: ["category"],
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
      }),
    ]);

  const ytdIncome = incomeYTD._sum.amount ?? 0;
  const ytdExpenses = expensesYTD._sum.amount ?? 0;
  const ytdBalance = ytdIncome - ytdExpenses;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-navy">Reports</h1>

      {/* YTD summary */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-green-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            YTD Income ({now.getFullYear()})
          </p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(ytdIncome)}</p>
        </div>
        <div className="bg-red-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            YTD Expenses ({now.getFullYear()})
          </p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(ytdExpenses)}</p>
        </div>
        <div className="bg-brand-light rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            YTD Net ({now.getFullYear()})
          </p>
          <p className={`text-2xl font-bold ${ytdBalance >= 0 ? "text-brand-navy" : "text-red-600"}`}>
            {formatCurrency(ytdBalance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Project P&L */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Project P&amp;L</h2>
          </div>
          {projectSummary.length === 0 ? (
            <p className="px-6 py-8 text-gray-400 text-center text-sm">No projects yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Project</th>
                  <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Income</th>
                  <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Expenses</th>
                  <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {projectSummary.map((p) => {
                  const inc = p.income.reduce((s: number, r) => s + r.amount, 0);
                  const exp = p.expenses.reduce((s: number, r) => s + r.amount, 0);
                  const net = inc - exp;
                  return (
                    <tr key={p.id}>
                      <td className="px-5 py-2.5 font-medium text-brand-navy text-xs">{p.name}</td>
                      <td className="px-5 py-2.5 text-right text-green-600 text-xs">{formatCurrency(inc)}</td>
                      <td className="px-5 py-2.5 text-right text-red-600 text-xs">{formatCurrency(exp)}</td>
                      <td className={`px-5 py-2.5 text-right font-bold text-xs ${net >= 0 ? "text-brand-navy" : "text-red-600"}`}>
                        {formatCurrency(net)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Expenses by category */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy">Expenses by Category</h2>
          </div>
          {expenseByCategory.length === 0 ? (
            <p className="px-6 py-8 text-gray-400 text-center text-sm">No expenses yet.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {expenseByCategory.map((c) => (
                <li key={c.category} className="px-6 py-3 flex items-center justify-between">
                  <span className="text-sm text-brand-navy font-medium">{c.category}</span>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(c._sum.amount ?? 0)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
