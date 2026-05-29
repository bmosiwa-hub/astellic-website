import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import Link from "next/link";

export const metadata = {
  title: "Astelfin | Accounts",
  robots: { index: false, follow: false },
};

function fmt(n: number) {
  return "MWK " + n.toLocaleString("en-MW", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function AstelfinAccountsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const org = await getAstelfinOrg();

  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01`);

  const [incomeTotals, expenseTotals, recentIncome, recentExpenses] = org
    ? await Promise.all([
        prisma.income.aggregate({
          where: { organisationId: org.id, receivedDate: { gte: startOfYear }, deletedAt: null },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.expense.aggregate({
          where: { organisationId: org.id, paidDate: { gte: startOfYear }, deletedAt: null },
          _sum: { amount: true },
          _count: true,
        }),
        prisma.income.findMany({
          where: { organisationId: org.id, deletedAt: null },
          orderBy: { receivedDate: "desc" },
          take: 6,
        }),
        prisma.expense.findMany({
          where: { organisationId: org.id, deletedAt: null },
          orderBy: { paidDate: "desc" },
          take: 6,
        }),
      ])
    : [null, null, [], []];

  const totalIncome  = incomeTotals?._sum.amount  ?? 0;
  const totalExpense = expenseTotals?._sum.amount  ?? 0;
  const netPosition  = totalIncome - totalExpense;

  const kpis = [
    { label: "Total Income YTD",   value: fmt(totalIncome),  color: "text-emerald-600", sub: `${incomeTotals?._count ?? 0} entries` },
    { label: "Total Expenses YTD", value: fmt(totalExpense), color: "text-rose-500",    sub: `${expenseTotals?._count ?? 0} entries` },
    { label: "Net Position",       value: fmt(netPosition),  color: netPosition >= 0 ? "text-brand-navy" : "text-rose-600", sub: year.toString() },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
          <h1 className="text-3xl font-bold text-brand-navy">Accounts</h1>
          <p className="text-brand-muted text-sm">Financial overview for Astelfin · {year}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/astelfin_26/astelfin/accounts/income/new" className="bg-white border border-gray-200 hover:border-brand-gold/50 text-brand-navy px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors">
            + Income
          </Link>
          <Link href="/astelfin_26/astelfin/accounts/expense/new" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors">
            + Expense
          </Link>
        </div>
      </div>

      {!org && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          Astelfin organisation is not configured. Contact your system administrator.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white border border-gray-100 rounded-2xl px-6 py-5 space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-muted">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-400">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Record Income",    href: "/astelfin_26/astelfin/accounts/income",  desc: "Fees, retainers, grants" },
          { label: "Record Expenses",  href: "/astelfin_26/astelfin/accounts/expense", desc: "Operational costs" },
          { label: "Tax & Compliance", href: "/astelfin_26/astelfin/tax",              desc: "PAYE, pension, WHT" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="group bg-white border border-gray-100 hover:border-brand-gold/40 rounded-2xl px-5 py-4 transition-all hover:shadow-sm"
          >
            <p className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors">{item.label}</p>
            <p className="text-xs text-brand-muted mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Income */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Recent Income</h2>
            <Link href="/astelfin_26/astelfin/accounts/income" className="text-xs text-brand-gold hover:underline font-medium">View all</Link>
          </div>
          {(recentIncome as { id: string; description: string; amount: number; currency: string; receivedDate: Date; source: string | null }[]).length === 0 ? (
            <p className="text-sm text-brand-muted bg-gray-50 rounded-xl p-4">No income recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {(recentIncome as { id: string; description: string; amount: number; currency: string; receivedDate: Date; source: string | null }[]).map((inc) => (
                <div key={inc.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-navy truncate">{inc.description}</p>
                    <p className="text-xs text-brand-muted">{new Date(inc.receivedDate).toLocaleDateString()} {inc.source ? `· ${inc.source}` : ""}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 shrink-0">{inc.currency} {inc.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Expenses */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Recent Expenses</h2>
            <Link href="/astelfin_26/astelfin/accounts/expense" className="text-xs text-brand-gold hover:underline font-medium">View all</Link>
          </div>
          {(recentExpenses as { id: string; description: string; amount: number; currency: string; paidDate: Date; category: string }[]).length === 0 ? (
            <p className="text-sm text-brand-muted bg-gray-50 rounded-xl p-4">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-2">
              {(recentExpenses as { id: string; description: string; amount: number; currency: string; paidDate: Date; category: string }[]).map((exp) => (
                <div key={exp.id} className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brand-navy truncate">{exp.description}</p>
                    <p className="text-xs text-brand-muted">{new Date(exp.paidDate).toLocaleDateString()} · {exp.category}</p>
                  </div>
                  <span className="text-sm font-bold text-rose-500 shrink-0">{exp.currency} {exp.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
