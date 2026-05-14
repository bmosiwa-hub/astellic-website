import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { checkCEOAuth } from "@/lib/delegation";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { reviewSubmission, markSubmissionPaid } from "@/lib/submission-actions";
import DocumentsPanel from "@/components/finance/DocumentsPanel";

export const metadata = {
  title: "Review Submission | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function ReviewSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role    = session.user.role;
  const ceoAuth = await checkCEOAuth(session);
  if (!ceoAuth.authorized && role !== "FINANCE_MANAGER") redirect("/astelfin_26/my/submissions");

  const sub = await prisma.submission.findUnique({
    where: { id },
    include: {
      submitter: { select: { name: true, email: true } },
      project: { select: { name: true } },
      lineItems: { orderBy: { createdAt: "asc" } },
      reviews: {
        orderBy: { createdAt: "asc" },
        include: { reviewer: { select: { name: true } } },
      },
    },
  });

  if (!sub) notFound();

  const isFM  = role === "FINANCE_MANAGER";
  const isCEO = ceoAuth.authorized;

  // FM can action PENDING_FM; CEO (or delegate) can action PENDING_CEO or APPROVED (mark paid)
  const canFMAction  = isFM && sub.status === "PENDING_FM";
  const canCEOAction = isCEO && sub.status === "PENDING_CEO";
  const canMarkPaid  = (isFM || isCEO) && sub.status === "APPROVED";

  // Server action bindings
  const approveFM   = reviewSubmission.bind(null, id, "APPROVED",          "FM");
  const changesFM   = reviewSubmission.bind(null, id, "CHANGES_REQUESTED", "FM");
  const rejectFM    = reviewSubmission.bind(null, id, "REJECTED",          "FM");
  const approveCEO  = reviewSubmission.bind(null, id, "APPROVED",          "CEO");
  const changesCEO  = reviewSubmission.bind(null, id, "CHANGES_REQUESTED", "CEO");
  const rejectCEO   = reviewSubmission.bind(null, id, "REJECTED",          "CEO");

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            Review {sub.type === "INVOICE" ? "Invoice" : "Expense Request"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            From <strong>{sub.submitter.name}</strong> · {formatDate(sub.createdAt)}
          </p>
        </div>
        <Link href="/astelfin_26/invoices" className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back
        </Link>
      </div>

      {/* Submission details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {sub.type === "INVOICE" ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Project:</span> <span className="font-medium">{sub.project?.name ?? "—"}</span></div>
              <div><span className="text-gray-500">Milestone:</span> <span className="font-medium">{sub.milestone ?? "—"}</span></div>
              <div><span className="text-gray-500">Currency:</span> <span className="font-medium">{sub.currency}</span></div>
              <div><span className="text-gray-500">Total:</span> <span className="font-bold text-brand-navy">{formatCurrency(sub.totalAmount, sub.currency)}</span></div>
            </div>
            {sub.lineItems.length > 0 && (
              <table className="w-full text-sm mt-2">
                <thead className="bg-gray-50 rounded">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Item</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Description</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-600">Date</th>
                    <th className="text-right px-3 py-2 font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sub.lineItems.map((li) => (
                    <tr key={li.id}>
                      <td className="px-3 py-2 font-medium">{li.item}</td>
                      <td className="px-3 py-2 text-gray-500">{li.description ?? "—"}</td>
                      <td className="px-3 py-2 text-gray-500">{li.activityDate ? formatDate(li.activityDate) : "—"}</td>
                      <td className="px-3 py-2 text-right">{formatCurrency(li.amount, sub.currency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 font-bold">Total</td>
                    <td className="px-3 py-2 text-right font-bold text-brand-navy">{formatCurrency(sub.totalAmount, sub.currency)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2"><span className="text-gray-500">Purpose:</span> <span className="font-medium">{sub.purpose}</span></div>
            <div><span className="text-gray-500">Request Date:</span> <span className="font-medium">{sub.requestDate ? formatDate(sub.requestDate) : "—"}</span></div>
            <div><span className="text-gray-500">Activity Date:</span> <span className="font-medium">{sub.activityDate ? formatDate(sub.activityDate) : "—"}</span></div>
            <div><span className="text-gray-500">Budget Line:</span> <span className="font-medium">{sub.budgetLine ?? "—"}</span></div>
            <div><span className="text-gray-500">Amount:</span> <span className="font-bold text-brand-navy">{formatCurrency(sub.totalAmount, sub.currency)}</span></div>
          </div>
        )}
        {sub.notes && <p className="text-sm text-gray-500 border-t pt-3">Notes: {sub.notes}</p>}
      </div>

      {/* Review history */}
      {sub.reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-brand-navy mb-4">Review History</h2>
          <div className="space-y-3">
            {sub.reviews.map((r) => (
              <div key={r.id} className={`flex items-start gap-3 p-3 rounded-xl text-sm ${
                r.action === "APPROVED" ? "bg-green-50" :
                r.action === "REJECTED" ? "bg-red-50" : "bg-orange-50"
              }`}>
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full shrink-0 ${
                  r.action === "APPROVED" ? "bg-green-200 text-green-800" :
                  r.action === "REJECTED" ? "bg-red-200 text-red-800" : "bg-orange-200 text-orange-800"
                }`}>
                  {r.action === "CHANGES_REQUESTED" ? "Changes" : r.action}
                </span>
                <div>
                  <p className="font-medium">{r.reviewerRole === "FM" ? "Finance Manager" : "Chief Executive Officer"} — {r.reviewer.name}</p>
                  {r.note && <p className="text-gray-600 mt-1">{r.note}</p>}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(r.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FM action panel */}
      {canFMAction && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy">Finance Manager Review</h2>

          <form action={approveFM} className="flex items-center gap-3">
            <input name="note" placeholder="Optional note…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✓ Approve → CEO
            </button>
          </form>

          <form action={changesFM} className="flex items-center gap-3">
            <input name="note" required placeholder="Describe the changes needed…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✎ Request Changes
            </button>
          </form>

          <form action={rejectFM} className="flex items-center gap-3">
            <input name="note" placeholder="Reason for rejection (optional)…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✗ Reject
            </button>
          </form>
        </div>
      )}

      {/* CEO action panel */}
      {canCEOAction && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-brand-navy">Chief Executive Officer Review</h2>

          <form action={approveCEO} className="flex items-center gap-3">
            <input name="note" placeholder="Optional note…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✓ Approve for Payment
            </button>
          </form>

          <form action={changesCEO} className="flex items-center gap-3">
            <input name="note" required placeholder="Describe the changes needed…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✎ Request Changes
            </button>
          </form>

          <form action={rejectCEO} className="flex items-center gap-3">
            <input name="note" placeholder="Reason for rejection (optional)…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400" />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✗ Reject
            </button>
          </form>
        </div>
      )}

      {/* FM mark as paid */}
      {canMarkPaid && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h2 className="font-bold text-brand-navy mb-3">Mark as Paid</h2>
          <p className="text-sm text-gray-600 mb-4">
            The Chief Executive Officer has approved this submission. Once payment is processed, mark it as paid below.
          </p>
          <form action={markSubmissionPaid.bind(null, id)} className="flex items-center gap-3">
            <input name="paymentNote" placeholder="Payment reference or note…"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap">
              ✓ Mark as Paid
            </button>
          </form>
        </div>
      )}

      {/* Supporting documents */}
      <DocumentsPanel
        entityType="Submission"
        entityId={id}
        revalidateTo={`/astelfin_26/invoices/${id}`}
      />
    </div>
  );
}
