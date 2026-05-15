import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import Link from "next/link";

export const metadata = {
  title: "Debt | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-red-100 text-red-700",
  PAID_OFF: "bg-green-100 text-green-700",
  RESTRUCTURED: "bg-yellow-100 text-yellow-700",
  DEFAULTED: "bg-gray-100 text-gray-600",
};

export default async function DebtPage() {
  const session     = await auth();
  const activeOrgId = await getActiveOrgId(session);
  const orgFilter   = orgWhere(activeOrgId);

  const debts = await prisma.debt.findMany({
    where:   { ...orgFilter },
    orderBy: { disbursedDate: "desc" },
    include: { repayments: { select: { amount: true } } },
  });

  const totalPrincipal = debts
    .filter((d) => d.status === "ACTIVE")
    .reduce((s: number, d) => s + d.principal, 0);

  const totalRepaid = debts.reduce(
    (s: number, d) => s + d.repayments.reduce((r: number, p) => r + p.amount, 0),
    0
  );

  const totalOutstanding = debts
    .filter((d) => d.status === "ACTIVE")
    .reduce((s: number, d) => {
      const repaid = d.repayments.reduce((r: number, p) => r + p.amount, 0);
      return s + Math.max(0, d.principal - repaid);
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Debt & Borrowings</h1>
          <p className="text-gray-500 text-sm mt-1">Track loans and repayment schedules.</p>
        </div>
        <Link
          href="/astelfin_26/debt/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Record Debt
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-red-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Active Principal
          </p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPrincipal)}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Total Repaid
          </p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRepaid)}</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
            Outstanding Balance
          </p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      {/* Debt list */}
      <div className="space-y-4">
        {debts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            No debts recorded yet.
          </div>
        ) : (
          debts.map((d) => {
            const repaid = d.repayments.reduce((s: number, p) => s + p.amount, 0);
            const outstanding = Math.max(0, d.principal - repaid);
            const pct = d.principal > 0 ? Math.min(100, (repaid / d.principal) * 100) : 0;
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-brand-navy">{d.lender}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[d.status]}`}>
                        {d.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{d.description}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-400">
                      <span>Disbursed: {formatDate(d.disbursedDate)}</span>
                      {d.dueDate && <span>Due: {formatDate(d.dueDate)}</span>}
                      {d.interestRate && <span>Interest: {d.interestRate}% p.a.</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">Principal</p>
                    <p className="text-lg font-bold text-brand-navy">
                      {formatCurrency(d.principal, d.currency)}
                    </p>
                    <p className="text-sm font-semibold text-orange-600 mt-1">
                      Outstanding: {formatCurrency(outstanding, d.currency)}
                    </p>
                  </div>
                </div>

                {/* Repayment progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Repaid: {formatCurrency(repaid, d.currency)}</span>
                    <span>{pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {d.status === "ACTIVE" && (
                  <Link
                    href={`/astelfin_26/debt/${d.id}/repay`}
                    className="text-xs font-semibold text-brand-gold hover:underline"
                  >
                    + Record Repayment
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
