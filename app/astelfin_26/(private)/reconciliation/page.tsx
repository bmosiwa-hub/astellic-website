/**
 * Phase 14 — Bank Reconciliation List
 * Shows all imported bank statements with their match status.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/finance-utils";

export const metadata = {
  title: "Bank Reconciliation | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:     "bg-gray-100 text-gray-500",
  IN_REVIEW:   "bg-amber-100 text-amber-700",
  RECONCILED:  "bg-green-100 text-green-700",
};

export default async function ReconciliationPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const statements = await prisma.bankStatement.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      _count: { select: { transactions: true } },
    },
  });

  // Count per statement: matched vs total
  const statementIds = statements.map((s) => s.id);
  const matchedCounts = await prisma.bankTransaction.groupBy({
    by:    ["statementId", "matchStatus"],
    where: { statementId: { in: statementIds } },
    _count: { _all: true },
  });

  const countMap: Record<string, { matched: number; unmatched: number; total: number }> = {};
  for (const row of matchedCounts) {
    if (!countMap[row.statementId]) countMap[row.statementId] = { matched: 0, unmatched: 0, total: 0 };
    countMap[row.statementId].total += row._count._all;
    if (row.matchStatus === "UNMATCHED") {
      countMap[row.statementId].unmatched += row._count._all;
    } else {
      countMap[row.statementId].matched += row._count._all;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Bank Reconciliation</h1>
          <p className="text-gray-500 text-sm mt-1">
            Import bank statements and match transactions to system records.
          </p>
        </div>
        <Link
          href="/astelfin_26/reconciliation/new"
          className="bg-brand-navy text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-navy/90 transition-colors"
        >
          Import Statement
        </Link>
      </div>

      {statements.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm mb-4">No bank statements imported yet.</p>
          <Link
            href="/astelfin_26/reconciliation/new"
            className="text-sm font-semibold text-brand-gold hover:underline"
          >
            Import your first statement →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Account</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Period</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Transactions</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Matched</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Unmatched</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-600">Status</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wide text-gray-600">Imported</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {statements.map((s) => {
                const c = countMap[s.id] ?? { matched: 0, unmatched: 0, total: s._count.transactions };
                const pct = c.total > 0 ? Math.round((c.matched / c.total) * 100) : 0;
                return (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{s.accountName}</p>
                      <p className="text-xs text-gray-400">{s.bankName} · {s.currency}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {formatDate(s.fromDate)} – {formatDate(s.toDate)}
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-gray-700">{c.total}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-green-600 font-medium">{c.matched}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      <span className={c.unmatched > 0 ? "text-amber-600 font-medium" : "text-gray-400"}>
                        {c.unmatched}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {s.status === "IN_REVIEW" ? "In Review" : s.status === "RECONCILED" ? "Reconciled" : s.status}
                      </span>
                      {c.total > 0 && (
                        <div className="mt-1 bg-gray-100 rounded-full h-1 w-20">
                          <div
                            className={`h-1 rounded-full ${pct === 100 ? "bg-green-500" : "bg-amber-400"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">{formatDate(s.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/astelfin_26/reconciliation/${s.id}`}
                        className="text-xs text-brand-gold hover:underline font-semibold"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
