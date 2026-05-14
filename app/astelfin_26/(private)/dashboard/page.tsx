import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/finance-utils";
import { buildRateMap, toMWK, fmtMWK, ratesAgeHours } from "@/lib/fx";
import { checkCEOAuth } from "@/lib/delegation";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  // Staff and Consultants have their own portal; redirect them
  if (session.user.role === "STAFF" || session.user.role === "CONSULTANT") {
    redirect("/astelfin_26/my/submissions");
  }

  // ── Delegation banner ─────────────────────────────────────────────────────
  const delegationAuth = await checkCEOAuth(session);

  // ── Load exchange rates ────────────────────────────────────────────────────
  const exchangeRates = await prisma.exchangeRate.findMany({
    select: { currency: true, middleRate: true, updatedAt: true },
  });
  const rates     = buildRateMap(exchangeRates);
  const ratesAge  = ratesAgeHours(exchangeRates); // hours since last update
  const ratesDate = exchangeRates.length > 0
    ? new Date(Math.max(...exchangeRates.map((r) => r.updatedAt.getTime())))
    : null;

  // ── Aggregate totals (grouped by currency so we can convert) ──────────────
  const [incomeGroups, expenseGroups, activeProjects, recentAudit, activeDebts, pendingSubmissions] =
    await Promise.all([
      prisma.income.groupBy({
        by:    ["currency"],
        where: { deletedAt: null },
        _sum:  { amount: true },
      }),
      prisma.expense.groupBy({
        by:    ["currency"],
        where: { deletedAt: null },
        _sum:  { amount: true },
      }),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.auditLog.findMany({
        take:    8,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      prisma.debt.findMany({
        where:   { status: "ACTIVE", deletedAt: null },
        include: { repayments: { select: { amount: true, currency: true } } },
      }),
      // Count submissions awaiting action for the current user's role
      session.user.role === "CEO"
        ? prisma.submission.count({ where: { status: "PENDING_CEO", deletedAt: null } })
        : session.user.role === "FINANCE_MANAGER"
          ? prisma.submission.count({ where: { status: "PENDING_FM",  deletedAt: null } })
          : Promise.resolve(0),
    ]);

  // ── Convert to MWK ─────────────────────────────────────────────────────────
  const totalIncomeMWK = incomeGroups.reduce(
    (s, g) => s + toMWK(g._sum.amount ?? 0, g.currency, rates), 0,
  );
  const totalExpensesMWK = expenseGroups.reduce(
    (s, g) => s + toMWK(g._sum.amount ?? 0, g.currency, rates), 0,
  );
  const balanceMWK = totalIncomeMWK - totalExpensesMWK;

  // Debt: outstanding = principal − repayments, converted to MWK
  const totalDebtMWK = activeDebts.reduce((s, d) => {
    const repaid    = d.repayments.reduce((r, p) => r + toMWK(p.amount, p.currency, rates), 0);
    const outstandingMWK = Math.max(0, toMWK(d.principal, d.currency, rates) - repaid);
    return s + outstandingMWK;
  }, 0);

  // ── Currency breakdown for tooltip / detail ────────────────────────────────
  const incomeByCurrency = incomeGroups
    .filter((g) => (g._sum.amount ?? 0) > 0)
    .map((g) => ({ currency: g.currency, amount: g._sum.amount ?? 0 }));

  const expenseByCurrency = expenseGroups
    .filter((g) => (g._sum.amount ?? 0) > 0)
    .map((g) => ({ currency: g.currency, amount: g._sum.amount ?? 0 }));

  const multiCurrencyIncome  = incomeByCurrency.length  > 1 || (incomeByCurrency[0]?.currency  !== "MWK" && incomeByCurrency.length > 0);
  const multiCurrencyExpense = expenseByCurrency.length > 1 || (expenseByCurrency[0]?.currency !== "MWK" && expenseByCurrency.length > 0);

  function fmtNative(amount: number, currency: string) {
    return new Intl.NumberFormat("en-MW", {
      style: "currency", currency,
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  }

  const stats = [
    {
      label:    "Total Income",
      value:    fmtMWK(totalIncomeMWK),
      sub:      multiCurrencyIncome ? incomeByCurrency.map((g) => fmtNative(g.amount, g.currency)).join(" + ") : null,
      color:    "text-green-600",
      bg:       "bg-green-50",
      href:     "/astelfin_26/income/breakdown",
    },
    {
      label:    "Total Expenses",
      value:    fmtMWK(totalExpensesMWK),
      sub:      multiCurrencyExpense ? expenseByCurrency.map((g) => fmtNative(g.amount, g.currency)).join(" + ") : null,
      color:    "text-red-600",
      bg:       "bg-red-50",
      href:     null,
    },
    {
      label:    "Outstanding Debt",
      value:    fmtMWK(totalDebtMWK),
      sub:      null,
      color:    "text-orange-600",
      bg:       "bg-orange-50",
      href:     "/astelfin_26/debt",
    },
    {
      label:    "Net Balance",
      value:    fmtMWK(balanceMWK),
      sub:      null,
      color:    balanceMWK >= 0 ? "text-brand-navy" : "text-red-600",
      bg:       "bg-brand-light",
      href:     null,
    },
    {
      label:    "Active Projects",
      value:    activeProjects.toString(),
      sub:      null,
      color:    "text-brand-gold",
      bg:       "bg-yellow-50",
      href:     "/astelfin_26/projects",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {session?.user?.name?.split(" ")[0]}.
          </p>
        </div>
        {/* Pending action badge */}
        {pendingSubmissions > 0 && (
          <Link
            href="/astelfin_26/submissions"
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-amber-100 transition-colors"
          >
            <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
              {pendingSubmissions}
            </span>
            submission{pendingSubmissions !== 1 ? "s" : ""} awaiting your review
          </Link>
        )}
      </div>

      {/* Delegation banner */}
      {delegationAuth.isDelegate && (
        <div className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl border bg-blue-50 border-blue-200 text-blue-700">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          You are acting as <strong className="mx-0.5">CEO delegate</strong> on behalf of {delegationAuth.delegatorName}.
          Your approval actions will be attributed "delegated by {delegationAuth.delegatorName}" in the audit trail.
        </div>
      )}

      {/* Exchange rate disclaimer */}
      {exchangeRates.length > 0 && (
        <div className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border ${
          ratesAge != null && ratesAge > 72
            ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-gray-50 border-gray-100 text-gray-400"
        }`}>
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {ratesAge != null && ratesAge > 72
            ? `Exchange rates are ${Math.round(ratesAge / 24)} days old — totals may not reflect current market rates.`
            : `All totals shown in MWK equivalent using RBM middle rates`}
          {ratesDate && (
            <span className="ml-auto opacity-60">
              Rates updated {formatDate(ratesDate)}
            </span>
          )}
        </div>
      )}
      {exchangeRates.length === 0 && (
        <div className="flex items-center gap-2 text-xs px-4 py-2 rounded-xl border bg-amber-50 border-amber-200 text-amber-700">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          No exchange rates loaded — multi-currency totals may be inaccurate. The exchange rate cron runs weekdays at 09:00.
        </div>
      )}

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
              {s.sub && (
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">{s.sub}</p>
              )}
              {s.href && !s.sub && (
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
          { label: "Record Income",  href: "/astelfin_26/income/new" },
          { label: "Record Expense", href: "/astelfin_26/expenses/new" },
          { label: "Add Project",    href: "/astelfin_26/projects/new" },
          { label: "Run Payroll",    href: "/astelfin_26/payroll/new" },
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
          <Link href="/astelfin_26/settings/audit" className="text-xs text-brand-gold hover:underline">
            View all
          </Link>
        </div>
        {recentAudit.length === 0 ? (
          <p className="px-6 py-8 text-center text-gray-400 text-sm">No activity yet.</p>
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
