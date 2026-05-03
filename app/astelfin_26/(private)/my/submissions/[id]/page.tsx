import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SubmissionForm from "@/components/finance/SubmissionForm";

export const metadata = {
  title: "Submission Details | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_FM:            "bg-yellow-100 text-yellow-800",
  FM_CHANGES_REQUESTED:  "bg-orange-100 text-orange-800",
  PENDING_CEO:           "bg-blue-100 text-blue-800",
  CEO_CHANGES_REQUESTED: "bg-orange-100 text-orange-800",
  APPROVED:              "bg-green-100 text-green-800",
  PAID:                  "bg-emerald-100 text-emerald-800",
  REJECTED:              "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_FM:            "Awaiting Finance Manager Review",
  FM_CHANGES_REQUESTED:  "Finance Manager Requested Changes",
  PENDING_CEO:           "Awaiting Executive Director Review",
  CEO_CHANGES_REQUESTED: "Executive Director Requested Changes",
  APPROVED:              "Approved — Awaiting Payment",
  PAID:                  "Paid",
  REJECTED:              "Rejected",
};

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const [sub, projects] = await Promise.all([
    prisma.submission.findUnique({
      where: { id },
      include: {
        project: { select: { name: true } },
        lineItems: { orderBy: { createdAt: "asc" } },
        reviews: {
          orderBy: { createdAt: "asc" },
          include: { reviewer: { select: { name: true } } },
        },
        liquidations: { select: { id: true, status: true, refundRequired: true } },
      },
    }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!sub) notFound();
  // Only the submitter can view this page via the "my" route
  if (sub.submittedBy !== session.user.id) redirect("/astelfin_26/my/submissions");

  const needsResubmit =
    sub.status === "FM_CHANGES_REQUESTED" || sub.status === "CEO_CHANGES_REQUESTED";
  const lastReview = sub.reviews[sub.reviews.length - 1];

  const budgetLines = ["Admin", ...projects.map((p) => p.name)];

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {sub.type === "INVOICE" ? "Invoice" : "Expense Request"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Submitted {formatDate(sub.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${STATUS_STYLES[sub.status] ?? "bg-gray-100"}`}>
            {STATUS_LABELS[sub.status] ?? sub.status}
          </span>
          <Link href="/astelfin_26/my/submissions" className="text-sm text-brand-gold hover:underline font-semibold">
            ← Back
          </Link>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        {sub.type === "INVOICE" ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Project:</span> <span className="font-medium">{sub.project?.name ?? "—"}</span></div>
              <div><span className="text-gray-500">Milestone:</span> <span className="font-medium">{sub.milestone ?? "—"}</span></div>
            </div>
            {sub.lineItems.length > 0 && (
              <table className="w-full text-sm mt-2">
                <thead className="bg-gray-50">
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
                      <td className="px-3 py-2 text-right font-semibold">{formatCurrency(li.amount, sub.currency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-3 py-2 font-bold text-brand-navy">Total</td>
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
        {sub.notes && <p className="text-sm text-gray-500 mt-2 pt-2 border-t">Notes: {sub.notes}</p>}
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
                <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                  r.action === "APPROVED" ? "bg-green-200 text-green-800" :
                  r.action === "REJECTED" ? "bg-red-200 text-red-800" : "bg-orange-200 text-orange-800"
                }`}>
                  {r.action === "CHANGES_REQUESTED" ? "Changes" : r.action}
                </span>
                <div>
                  <p className="font-medium text-gray-800">
                    {r.reviewerRole === "FM" ? "Finance Manager" : "Executive Director"} — {r.reviewer.name}
                  </p>
                  {r.note && <p className="text-gray-600 mt-1">{r.note}</p>}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(r.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resubmit form */}
      {needsResubmit && lastReview && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <h2 className="font-bold text-brand-navy mb-2">Resubmit with Changes</h2>
          <p className="text-sm text-orange-800 mb-5">
            <strong>Feedback:</strong> {lastReview.note ?? "Please review and resubmit."}
          </p>
          <SubmissionForm
            projects={projects}
            budgetLines={budgetLines}
            mode="resubmit"
            submissionId={sub.id}
            defaultValues={{
              type: sub.type,
              projectId: sub.projectId ?? undefined,
              milestone: sub.milestone ?? undefined,
              purpose: sub.purpose ?? undefined,
              requestDate: sub.requestDate ? new Date(sub.requestDate).toISOString().split("T")[0] : undefined,
              activityDate: sub.activityDate ? new Date(sub.activityDate).toISOString().split("T")[0] : undefined,
              budgetLine: sub.budgetLine ?? undefined,
              currency: sub.currency,
              totalAmount: sub.totalAmount,
              notes: sub.notes ?? undefined,
              lineItems: sub.lineItems.map((li) => ({
                item: li.item,
                description: li.description ?? "",
                activityDate: li.activityDate ? new Date(li.activityDate).toISOString().split("T")[0] : "",
                amount: String(li.amount),
              })),
            }}
          />
        </div>
      )}

      {/* Liquidation link */}
      {sub.status === "PAID" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-brand-navy mb-2">Liquidation</h2>
          {sub.liquidations.length === 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">You have received payment. Please submit a liquidation to account for the funds.</p>
              <Link
                href={`/astelfin_26/my/liquidations/new?submissionId=${sub.id}`}
                className="bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ml-4"
              >
                Submit Liquidation
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {sub.liquidations.map((l) => (
                <div key={l.id} className="flex items-center justify-between text-sm">
                  <span>Refund balance: <strong>{formatCurrency(Math.abs(l.refundRequired))}</strong>
                    {l.refundRequired > 0 ? " (owed back)" : l.refundRequired < 0 ? " (over-spent)" : " (break even)"}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    l.status === "FM_APPROVED" ? "bg-green-100 text-green-700" :
                    l.status === "FM_REJECTED" ? "bg-red-100 text-red-700" :
                    l.status === "CHANGES_REQUESTED" ? "bg-orange-100 text-orange-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>{l.status.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
