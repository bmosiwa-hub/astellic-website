/**
 * Phase 14 — Reconciliation Review Page
 *
 * Shows all transactions in an imported bank statement. Allows the FM/CEO to:
 *   - Accept or override auto-matches
 *   - Manually match unmatched transactions to a system record
 *   - Mark transactions as EXCLUDED (bank fees, internal transfers, etc.)
 *   - Mark the entire statement as RECONCILED once all rows are reviewed
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { auditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { formatDate } from "@/lib/finance-utils";
import { fmtMWK } from "@/lib/fx";
import Link from "next/link";

export const metadata = {
  title: "Reconciliation Review | Astellic Finance",
  robots: { index: false, follow: false },
};

// ── Server actions ─────────────────────────────────────────────────────────────

async function updateMatch(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const txId         = formData.get("txId")         as string;
  const matchStatus  = formData.get("matchStatus")  as string;
  const entityType   = (formData.get("entityType")  as string) || null;
  const entityId     = (formData.get("entityId")    as string) || null;
  const matchNote    = (formData.get("matchNote")   as string) || null;

  const validStatuses = ["UNMATCHED", "AUTO_MATCHED", "MANUAL_MATCHED", "EXCLUDED"];
  if (!txId || !validStatuses.includes(matchStatus)) return;

  await prisma.bankTransaction.update({
    where: { id: txId },
    data:  {
      matchStatus,
      matchEntityType: entityType,
      matchEntityId:   entityId,
      matchNote,
      matchedAt:       matchStatus !== "UNMATCHED" ? new Date() : null,
      matchedById:     matchStatus !== "UNMATCHED" ? session.user.id! : null,
    },
  });

  const tx = await prisma.bankTransaction.findUnique({ where: { id: txId }, select: { statementId: true } });
  if (tx) revalidatePath(`/astelfin_26/reconciliation/${tx.statementId}`);
}

async function markReconciled(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const statementId = formData.get("statementId") as string;
  const notes       = (formData.get("notes") as string) || null;
  if (!statementId) return;

  await prisma.bankStatement.update({
    where: { id: statementId },
    data:  {
      status:          "RECONCILED",
      reconciledById:  session.user.id!,
      reconciledAt:    new Date(),
      notes,
    },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "RECONCILE",
    entity:   "BankStatement",
    entityId: statementId,
    detail:   `Bank statement marked as reconciled${notes ? ` — ${notes}` : ""}`,
  });

  revalidatePath(`/astelfin_26/reconciliation/${statementId}`);
  revalidatePath("/astelfin_26/reconciliation");
}

// ── Match status helpers ───────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  AUTO_MATCHED:   { label: "Auto-matched",   cls: "bg-green-100 text-green-700" },
  MANUAL_MATCHED: { label: "Manual match",   cls: "bg-blue-100 text-blue-700" },
  EXCLUDED:       { label: "Excluded",        cls: "bg-gray-100 text-gray-500" },
  UNMATCHED:      { label: "Unmatched",       cls: "bg-amber-100 text-amber-700" },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ReconciliationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const statement = await prisma.bankStatement.findUnique({
    where:   { id },
    include: {
      transactions: {
        orderBy: { transactionDate: "asc" },
      },
    },
  });
  if (!statement) notFound();

  const { transactions } = statement;
  const total      = transactions.length;
  const matched    = transactions.filter((t) => t.matchStatus !== "UNMATCHED").length;
  const unmatched  = transactions.filter((t) => t.matchStatus === "UNMATCHED").length;
  const allReviewed = unmatched === 0;

  // ── Fetch candidate records for manual matching dropdowns ─────────────────
  // Only load if there are unmatched transactions
  const manualCandidates = unmatched > 0
    ? await loadCandidates(statement.currency, statement.fromDate, statement.toDate)
    : [];

  function fmtAmt(debit: number | null, credit: number | null) {
    if (credit && credit > 0) return <span className="text-green-600 font-medium">+{credit.toLocaleString("en-MW", { minimumFractionDigits: 2 })}</span>;
    if (debit  && debit  > 0) return <span className="text-red-500 font-medium">−{debit.toLocaleString("en-MW", { minimumFractionDigits: 2 })}</span>;
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <Link href="/astelfin_26/reconciliation" className="hover:text-brand-gold">Reconciliation</Link>
          <span>›</span>
          <span className="text-gray-600">{statement.accountName}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">{statement.accountName}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {statement.bankName} · {statement.currency} ·{" "}
              {formatDate(statement.fromDate)} – {formatDate(statement.toDate)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              statement.status === "RECONCILED" ? "bg-green-100 text-green-700" :
              statement.status === "IN_REVIEW"  ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-500"
            }`}>
              {statement.status === "IN_REVIEW" ? "In Review" : statement.status}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Total Transactions</p>
          <p className="text-2xl font-bold text-brand-navy">{total}</p>
        </div>
        <div className="bg-green-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Matched</p>
          <p className="text-2xl font-bold text-green-600">{matched}</p>
          <div className="mt-2 bg-white/60 rounded-full h-1.5">
            <div
              className="bg-green-500 h-1.5 rounded-full"
              style={{ width: `${total > 0 ? (matched / total) * 100 : 0}%` }}
            />
          </div>
        </div>
        <div className={`rounded-2xl p-5 border border-gray-100 ${unmatched > 0 ? "bg-amber-50" : "bg-green-50"}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Unmatched</p>
          <p className={`text-2xl font-bold ${unmatched > 0 ? "text-amber-600" : "text-green-600"}`}>{unmatched}</p>
        </div>
      </div>

      {/* Mark reconciled */}
      {statement.status !== "RECONCILED" && allReviewed && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4">
          <p className="text-sm font-semibold text-green-800 mb-3">
            All transactions have been reviewed — ready to mark as reconciled.
          </p>
          <form action={markReconciled} className="flex items-center gap-3">
            <input type="hidden" name="statementId" value={statement.id} />
            <input
              type="text"
              name="notes"
              placeholder="Optional note…"
              className="flex-1 rounded-xl border border-green-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            />
            <button
              type="submit"
              className="bg-green-600 text-white font-semibold text-sm px-5 py-2 rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              Mark Reconciled
            </button>
          </form>
        </div>
      )}

      {statement.status === "RECONCILED" && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-sm text-green-800">
          ✓ Reconciled on {statement.reconciledAt ? formatDate(statement.reconciledAt) : "–"}
          {statement.notes && <span className="ml-2 text-green-600 italic">· {statement.notes}</span>}
        </div>
      )}

      {/* Transactions table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Transactions</h2>
          <p className="text-xs text-gray-400">All amounts in {statement.currency}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Description</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Amount</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Balance</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-600">Status</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-600">Matched to</th>
                {statement.status !== "RECONCILED" && (
                  <th className="px-4 py-3 text-xs uppercase tracking-wide text-gray-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => {
                const statusInfo = STATUS_LABEL[tx.matchStatus] ?? STATUS_LABEL.UNMATCHED;
                return (
                  <tr key={tx.id} className={`${tx.matchStatus === "EXCLUDED" ? "opacity-50" : ""} hover:bg-gray-50/50`}>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(tx.transactionDate)}
                    </td>
                    <td className="px-4 py-3 text-brand-navy max-w-xs">
                      <p className="line-clamp-2 text-xs">{tx.description}</p>
                      {tx.matchNote && (
                        <p className="text-[10px] text-gray-400 mt-0.5 italic">{tx.matchNote}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs whitespace-nowrap">
                      {fmtAmt(tx.debit, tx.credit)}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-gray-400 whitespace-nowrap">
                      {tx.balance != null ? tx.balance.toLocaleString("en-MW", { minimumFractionDigits: 2 }) : "–"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {tx.matchEntityType && tx.matchEntityId ? (
                        <span className="font-medium text-brand-navy">
                          {tx.matchEntityType}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    {statement.status !== "RECONCILED" && (
                      <td className="px-4 py-3">
                        <ReconcileActions
                          tx={tx}
                          candidates={manualCandidates}
                          updateMatch={updateMatch}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Candidate loader ──────────────────────────────────────────────────────────

async function loadCandidates(currency: string, from: Date, to: Date) {
  const bufMs = 3 * 24 * 60 * 60 * 1000;
  const bFrom = new Date(from.getTime() - bufMs);
  const bTo   = new Date(to.getTime()   + bufMs);

  const [incomes, expenses, payrolls, payables] = await Promise.all([
    prisma.income.findMany({
      where:  { receivedDate: { gte: bFrom, lte: bTo }, currency, deletedAt: null },
      select: { id: true, receivedDate: true, amount: true, description: true },
    }),
    prisma.expense.findMany({
      where:  { paidDate: { gte: bFrom, lte: bTo }, currency, deletedAt: null },
      select: { id: true, paidDate: true, amount: true, description: true },
    }),
    prisma.payroll.findMany({
      where:   { paidDate: { gte: bFrom, lte: bTo }, currency, deletedAt: null },
      include: { employee: { select: { name: true } } },
    }),
    prisma.accountPayable.findMany({
      where:  { paidDate: { gte: bFrom, lte: bTo }, currency, deletedAt: null, status: "PAID" },
      select: { id: true, paidDate: true, amount: true, description: true },
    }),
  ]);

  return [
    ...incomes.map(  (r) => ({ type: "Income",         id: r.id, date: r.receivedDate, amount: r.amount,   label: `Income — ${r.description.slice(0, 40)}` })),
    ...expenses.map( (r) => ({ type: "Expense",        id: r.id, date: r.paidDate,     amount: r.amount,   label: `Expense — ${r.description.slice(0, 40)}` })),
    ...payrolls.map( (r) => ({ type: "Payroll",        id: r.id, date: r.paidDate!,    amount: r.netPay,   label: `Payroll — ${r.employee.name}` })),
    ...payables.map( (r) => ({ type: "AccountPayable", id: r.id, date: r.paidDate!,    amount: r.amount,   label: `Payable — ${r.description.slice(0, 40)}` })),
  ].filter((c) => c.date != null) as Array<{ type: string; id: string; date: Date; amount: number; label: string }>;
}

// ── Inline actions sub-component ──────────────────────────────────────────────

function ReconcileActions({
  tx,
  candidates,
  updateMatch,
}: {
  tx: {
    id: string;
    matchStatus: string;
    matchEntityType: string | null;
    matchEntityId: string | null;
  };
  candidates: Array<{ type: string; id: string; date: Date; amount: number; label: string }>;
  updateMatch: (fd: FormData) => Promise<void>;
}) {
  if (tx.matchStatus === "EXCLUDED") {
    return (
      <form action={updateMatch}>
        <input type="hidden" name="txId"        value={tx.id} />
        <input type="hidden" name="matchStatus" value="UNMATCHED" />
        <button type="submit" className="text-[10px] text-brand-gold hover:underline">
          Reinstate
        </button>
      </form>
    );
  }

  if (tx.matchStatus === "UNMATCHED") {
    return (
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        {/* Manual match */}
        <form action={updateMatch} className="flex items-center gap-1">
          <input type="hidden" name="txId"        value={tx.id} />
          <input type="hidden" name="matchStatus" value="MANUAL_MATCHED" />
          <select
            name="entityId"
            required
            className="flex-1 rounded border border-gray-200 text-[10px] px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-gold/40"
            defaultValue=""
          >
            <option value="" disabled>Select record…</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id} data-type={c.type}>
                {c.label}
              </option>
            ))}
          </select>
          {/* entityType is derived from the selected option — workaround: hidden field updated by JS */}
          <input type="hidden" name="entityType" value="" />
          <button type="submit" className="text-[10px] text-brand-gold font-semibold whitespace-nowrap hover:underline">
            Match
          </button>
        </form>
        {/* Exclude */}
        <form action={updateMatch}>
          <input type="hidden" name="txId"        value={tx.id} />
          <input type="hidden" name="matchStatus" value="EXCLUDED" />
          <input type="hidden" name="matchNote"   value="Excluded by reviewer" />
          <button type="submit" className="text-[10px] text-gray-400 hover:text-red-500 hover:underline">
            Exclude
          </button>
        </form>
      </div>
    );
  }

  // AUTO_MATCHED or MANUAL_MATCHED — allow clearing
  return (
    <form action={updateMatch} className="flex items-center gap-1">
      <input type="hidden" name="txId"        value={tx.id} />
      <input type="hidden" name="matchStatus" value="UNMATCHED" />
      <input type="hidden" name="entityType"  value="" />
      <input type="hidden" name="entityId"    value="" />
      <button type="submit" className="text-[10px] text-gray-400 hover:text-red-500 hover:underline">
        Clear match
      </button>
    </form>
  );
}
