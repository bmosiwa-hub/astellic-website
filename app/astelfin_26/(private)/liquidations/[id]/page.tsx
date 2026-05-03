import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { reviewLiquidation } from "@/lib/liquidation-actions";

export const metadata = {
  title: "Review Liquidation | Astellic Finance",
  robots: { index: false, follow: false },
};

const DOC_LABELS: Record<string, string> = {
  RECEIPT:                  "Receipt",
  REFUND_PROOF:             "Proof of Refund",
  OVER_EXPENDITURE_PROOF:   "Over-Expenditure Proof",
  PRIOR_APPROVAL_PROOF:     "Prior Approval",
};

export default async function ReviewLiquidationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/my/liquidations");

  const liq = await prisma.liquidation.findUnique({
    where: { id },
    include: {
      submitter: { select: { name: true, email: true } },
      submission: { select: { type: true, totalAmount: true, currency: true, purpose: true, milestone: true } },
      documents: { orderBy: { uploadedAt: "asc" } },
    },
  });

  if (!liq) notFound();

  const canReview = liq.status === "PENDING_FM" || liq.status === "CHANGES_REQUESTED";

  const approveAction = reviewLiquidation.bind(null, id, "FM_APPROVED");
  const rejectAction  = reviewLiquidation.bind(null, id, "FM_REJECTED");
  const changesAction = reviewLiquidation.bind(null, id, "CHANGES_REQUESTED");

  const isOverspent = liq.refundRequired < 0;
  const owesBack    = liq.refundRequired > 0;

  const docsByType = liq.documents.reduce<Record<string, typeof liq.documents>>(
    (acc, d) => { (acc[d.docType] ??= []).push(d); return acc; },
    {}
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Review Liquidation</h1>
          <p className="text-gray-500 text-sm mt-1">
            From <strong>{liq.submitter.name}</strong> · {formatDate(liq.liquidationDate)}
          </p>
        </div>
        <Link href="/astelfin_26/liquidations" className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back
        </Link>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-brand-navy mb-4">Liquidation Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div><span className="text-gray-500">Activity:</span> <span className="font-medium">{liq.activity}</span></div>
          <div><span className="text-gray-500">Budget Line:</span> <span className="font-medium">{liq.budgetLine}</span></div>
          <div><span className="text-gray-500">Original Request:</span> <span className="font-medium">{formatCurrency(liq.submission.totalAmount, liq.currency)}</span></div>
        </div>

        {/* Balance breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Received</p>
            <p className="text-xl font-bold text-gray-700">{formatCurrency(liq.fundsReceived, liq.currency)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Accounted For</p>
            <p className="text-xl font-bold text-gray-700">{formatCurrency(liq.fundsAccountedFor, liq.currency)}</p>
          </div>
          <div className={`rounded-xl p-4 text-center ${owesBack ? "bg-orange-50" : isOverspent ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Balance</p>
            <p className={`text-xl font-bold ${owesBack ? "text-orange-600" : isOverspent ? "text-red-600" : "text-green-600"}`}>
              {owesBack
                ? `Owes ${formatCurrency(liq.refundRequired, liq.currency)}`
                : isOverspent
                ? `Over-spent ${formatCurrency(Math.abs(liq.refundRequired), liq.currency)}`
                : "Break even ✓"}
            </p>
          </div>
        </div>

        {isOverspent && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-800">
            ⚠ This person spent more than they received. Check that over-expenditure proof and prior approval documents are attached below.
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-brand-navy mb-4">Supporting Documents</h2>
        {liq.documents.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No documents uploaded.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(docsByType).map(([docType, docs]) => (
              <div key={docType}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                  {DOC_LABELS[docType] ?? docType}
                </p>
                <div className="flex flex-wrap gap-2">
                  {docs.map((d) => (
                    <a key={d.id} href={d.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium text-brand-navy transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      {d.filename}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FM review panel */}
      {canReview && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy">Finance Manager Review</h2>

          <form action={approveAction} className="flex items-center gap-3">
            <input name="note" placeholder="Optional note…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✓ Approve
            </button>
          </form>

          <form action={changesAction} className="flex items-center gap-3">
            <input name="note" required placeholder="What changes or documents are needed?"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✎ Request Changes
            </button>
          </form>

          <form action={rejectAction} className="flex items-center gap-3">
            <input name="note" placeholder="Reason for rejection (optional)…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✗ Reject
            </button>
          </form>
        </div>
      )}

      {!canReview && liq.fmNote && (
        <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 text-sm text-gray-600">
          <strong>FM Note:</strong> {liq.fmNote}
          {liq.reviewedAt && <span className="ml-2 text-gray-400">· {formatDate(liq.reviewedAt)}</span>}
        </div>
      )}
    </div>
  );
}
