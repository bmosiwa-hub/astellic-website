import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { reviewLiquidation } from "@/lib/liquidation-actions";

async function approveOverspendingRefund(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const refundId = formData.get("refundId") as string;
  const ceoNote  = (formData.get("ceoNote") as string) || null;
  const liqId    = formData.get("liquidationId") as string;

  await prisma.overspendingRefund.update({
    where: { id: refundId },
    data:  { status: "CEO_APPROVED", ceoNote },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "APPROVE",
    entity:   "OverspendingRefund",
    entityId: refundId,
    detail:   ceoNote || "CEO approved overspending refund for payroll addition",
  });

  redirect(`/astelfin_26/liquidations/${liqId}?success=refund_approved`);
}

async function rejectOverspendingRefund(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const refundId = formData.get("refundId") as string;
  const ceoNote  = (formData.get("ceoNote") as string) || null;
  const liqId    = formData.get("liquidationId") as string;

  await prisma.overspendingRefund.update({
    where: { id: refundId },
    data:  { status: "CEO_REJECTED", ceoNote } as never,
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "REJECT",
    entity:   "OverspendingRefund",
    entityId: refundId,
    detail:   ceoNote || "CEO rejected overspending refund",
  });

  redirect(`/astelfin_26/liquidations/${liqId}?success=refund_rejected`);
}

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
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id }      = await params;
  const { success } = await searchParams;
  const session     = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/my/liquidations");

  const liq = await prisma.liquidation.findUnique({
    where: { id },
    include: {
      submitter: { select: { name: true, email: true } },
      submission: { select: { type: true, totalAmount: true, currency: true, purpose: true, milestone: true } },
      documents:  { orderBy: { uploadedAt: "asc" } },
      overspendingRefunds: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!liq) notFound();

  const canReview = liq.status === "PENDING_FM" || liq.status === "CHANGES_REQUESTED";

  const approveAction = reviewLiquidation.bind(null, id, "FM_APPROVED");
  const rejectAction  = reviewLiquidation.bind(null, id, "FM_REJECTED");
  const changesAction = reviewLiquidation.bind(null, id, "CHANGES_REQUESTED");

  const isOverspent = liq.refundRequired < 0;
  const owesBack    = liq.refundRequired > 0;

  // Find pending overspending refunds for CEO
  const pendingCEORefund = liq.overspendingRefunds.find((r) => r.status === "PENDING_CEO");
  const approvedRefund   = liq.overspendingRefunds.find((r) => r.status === "CEO_APPROVED");
  const addedRefund      = liq.overspendingRefunds.find((r) => r.status === "PAYROLL_ADDED");

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

      {success === "refund_approved" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Overspending refund approved. It will appear in the employee&apos;s next payroll run.
        </div>
      )}
      {success === "refund_rejected" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Overspending refund rejected.
        </div>
      )}

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
                    <a key={d.id} href={`/api/documents/proxy?type=liquidation&id=${d.id}`} target="_blank" rel="noopener noreferrer"
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
          <strong>Operations Manager Note:</strong> {liq.fmNote}
          {liq.reviewedAt && <span className="ml-2 text-gray-400">· {formatDate(liq.reviewedAt)}</span>}
        </div>
      )}

      {/* CEO overspending refund approval */}
      {role === "CEO" && pendingCEORefund && (
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-6 space-y-4">
          <div>
            <h2 className="font-bold text-amber-800 text-sm uppercase tracking-wide">
              Overspending Refund — CEO Approval Required
            </h2>
            <p className="text-xs text-amber-700 mt-1">
              The Operations Manager has approved this liquidation where the employee overspent.
              The employee is owed <strong>{formatCurrency(pendingCEORefund.amount, pendingCEORefund.currency)}</strong>.
              Approve to add to their next payroll, or reject.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form action={approveOverspendingRefund} className="space-y-2">
              <input type="hidden" name="refundId"      value={pendingCEORefund.id} />
              <input type="hidden" name="liquidationId" value={id} />
              <input name="ceoNote" placeholder="Optional approval note…"
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white" />
              <button type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                ✓ Approve Refund — Add to Payroll
              </button>
            </form>
            <form action={rejectOverspendingRefund} className="space-y-2">
              <input type="hidden" name="refundId"      value={pendingCEORefund.id} />
              <input type="hidden" name="liquidationId" value={id} />
              <input name="ceoNote" placeholder="Reason for rejection…"
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white" />
              <button type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                ✗ Reject Refund
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Show approved refund status */}
      {approvedRefund && !pendingCEORefund && (
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-5 text-sm text-blue-800">
          <p className="font-bold mb-1">Overspending Refund: CEO Approved</p>
          <p className="text-xs text-blue-600">
            {formatCurrency(approvedRefund.amount, approvedRefund.currency)} will be added to this employee&apos;s next payroll.
            {approvedRefund.ceoNote && ` Note: ${approvedRefund.ceoNote}`}
          </p>
        </div>
      )}
      {addedRefund && (
        <div className="bg-green-50 rounded-2xl border border-green-200 p-5 text-sm text-green-800">
          <p className="font-bold mb-1">Overspending Refund: Added to Payroll ✓</p>
          <p className="text-xs text-green-600">
            {formatCurrency(addedRefund.amount, addedRefund.currency)} was added to the employee&apos;s payroll.
          </p>
        </div>
      )}
    </div>
  );
}
