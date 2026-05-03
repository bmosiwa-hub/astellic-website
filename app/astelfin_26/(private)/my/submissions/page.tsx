import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Submissions | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_FM:             "bg-yellow-100 text-yellow-800",
  FM_CHANGES_REQUESTED:   "bg-orange-100 text-orange-800",
  PENDING_CEO:            "bg-blue-100  text-blue-800",
  CEO_CHANGES_REQUESTED:  "bg-orange-100 text-orange-800",
  APPROVED:               "bg-green-100 text-green-800",
  PAID:                   "bg-emerald-100 text-emerald-800",
  REJECTED:               "bg-red-100  text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_FM:             "Awaiting FM",
  FM_CHANGES_REQUESTED:   "Changes Requested",
  PENDING_CEO:            "Awaiting CEO",
  CEO_CHANGES_REQUESTED:  "Changes Requested",
  APPROVED:               "Approved — Pending Payment",
  PAID:                   "Paid",
  REJECTED:               "Rejected",
};

export default async function MySubmissionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const submissions = await prisma.submission.findMany({
    where: { submittedBy: session.user.id! },
    orderBy: { createdAt: "desc" },
    include: {
      project: { select: { name: true } },
      lineItems: { select: { amount: true } },
      liquidations: { select: { status: true } },
    },
  });

  const pendingChanges = submissions.filter(
    (s) => s.status === "FM_CHANGES_REQUESTED" || s.status === "CEO_CHANGES_REQUESTED"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">My Submissions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {submissions.length} total
            {pendingChanges > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingChanges} need{pendingChanges === 1 ? "s" : ""} attention
              </span>
            )}
          </p>
        </div>
        <Link
          href="/astelfin_26/my/submissions/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + New Submission
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400">
          <p className="text-lg mb-2">No submissions yet.</p>
          <Link href="/astelfin_26/my/submissions/new" className="text-brand-gold hover:underline text-sm font-semibold">
            Create your first invoice or request →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => {
            const needsAction =
              s.status === "FM_CHANGES_REQUESTED" || s.status === "CEO_CHANGES_REQUESTED";
            const hasLiquidation = s.liquidations.length > 0;
            const liquidated = s.liquidations.some((l) => l.status === "FM_APPROVED");
            return (
              <Link
                key={s.id}
                href={`/astelfin_26/my/submissions/${s.id}`}
                className={`block bg-white rounded-2xl border shadow-sm px-6 py-4 hover:shadow-md transition-shadow ${
                  needsAction ? "border-orange-200" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                        s.type === "INVOICE"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {s.type === "INVOICE" ? "Invoice" : "Request"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-navy truncate">
                        {s.type === "INVOICE"
                          ? s.milestone || s.project?.name || "Invoice"
                          : s.purpose || "Expense Request"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(s.createdAt)}
                        {s.project && ` · ${s.project.name}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-semibold text-brand-navy">
                      {formatCurrency(s.totalAmount, s.currency)}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                    {s.status === "PAID" && (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          liquidated
                            ? "bg-green-100 text-green-700"
                            : hasLiquidation
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {liquidated ? "Liquidated" : hasLiquidation ? "Liquidation pending" : "Not liquidated"}
                      </span>
                    )}
                  </div>
                </div>

                {needsAction && (
                  <p className="mt-2 text-xs text-orange-700 font-medium">
                    ⚠ Changes were requested — click to view feedback and resubmit
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
