import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();

  // Aggregate totals
  const [totalIncome, totalExpenses, activeProjects, recentAudit, activeDebts] =
    await Promise.all([
      prisma.income.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      prisma.debt.findMany({
        where: { status: "ACTIVE" },
        include: { repayments: { select: { amount: true } } },
      }),
    ]);

  const income = totalIncome._sum.amount ?? 0;
  const expenses = totalExpenses._sum.amount ?? 0;
  const balance = income - expenses;
  const totalDebtOutstanding = activeDebts.reduce((s: number, d) => {
    const repaid = d.repayments.reduce((r: number, p) => r + p.amount, 0);
    return s + Math.max(0, d.principal - repaid);
  }, 0);

  const stats = [
    {
      label: "Total Income",
      value: formatCurrency(income),
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/astelfin_26/income/breakdown",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(expenses),
      color: "text-red-600",
      bg: "bg-red-50",
      href: null,
    },
    {
      label: "Outstanding Debt",
      value: formatCurrency(totalDebtOutstanding),
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/astelfin_26/debt",
    },
    {
      label: "Net Balance",
      value: formatCurrency(balance),
      color: balance >= 0 ? "text-brand-navy" : "text-red-600",
      bg: "bg-brand-light",
      href: null,
    },
    {
      label: "Active Projects",
      value: activeProjects.toString(),
      color: "text-brand-gold",
      bg: "bg-yellow-50",
      href: "/astelfin_26/projects",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {session?.user?.name?.split(" ")[0]}.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((s) => {
          const card = (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl p-5 border border-gray-100 ${s.href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                {s.label}
              </p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              {s.href && (
                <p className="text-xs text-gray-400 mt-1">Click to view breakdown</p>
              )}
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href}>{card}</Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Record Income", href: "/astelfin_26/income/new" },
          { label: "Record Expense", href: "/astelfin_26/expenses/new" },
          { label: "Add Project", href: "/astelfin_26/projects/new" },
          { label: "Run Payroll", href: "/astelfin_26/payroll/new" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="bg-white border border-gray-200 hover:border-brand-gold rounded-xl p-4 text-center text-sm font-semibold text-brand-navy transition-colors hover:text-brand-gold"
          >
            {a.label}
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Recent Activity</h2>
          <Link
            href="/astelfin_26/settings/audit"
            className="text-xs text-brand-gold hover:underline"
          >
            View all
          </Link>
        </div>
        {recentAudit.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">
            No activity yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-50">
            {recentAudit.map((log) => (
              <li key={log.id} className="px-6 py-3 flex items-start gap-3">
                <span className="mt-0.5 text-xs font-bold uppercase bg-brand-light text-brand-navy px-2 py-0.5 rounded">
                  {log.action}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{log.entity}</span>
                    {log.detail ? ` — ${log.detail}` : ""}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {log.user.name} · {formatDate(log.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
