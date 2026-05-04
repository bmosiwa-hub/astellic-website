import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Procurement | Astelfin IMS",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT:            "bg-gray-100 text-gray-500",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED:         "bg-green-100 text-green-700",
  REJECTED:         "bg-red-100 text-red-700",
  COMPLETED:        "bg-blue-100 text-blue-700",
  CANCELLED:        "bg-gray-100 text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT:            "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED:         "Approved",
  REJECTED:         "Rejected",
  COMPLETED:        "Completed",
  CANCELLED:        "Cancelled",
};

export default async function ProcurementPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const { success } = await searchParams;
  const isCEO = role === "CEO";

  const procurements = await prisma.procurement.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      requester: { select: { name: true } },
      quotations: { select: { id: true } },
    },
  });

  const pendingCount = procurements.filter((p) => p.status === "PENDING_APPROVAL").length;
  const draftCount   = procurements.filter((p) => p.status === "DRAFT").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Procurement</h1>
          <p className="text-gray-500 text-sm mt-1">Manage procurement requests and approvals.</p>
        </div>
        {!isCEO && (
          <Link href="/astelfin_26/procurement/new"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            + New Request
          </Link>
        )}
      </div>

      {success === "submitted" && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          Procurement request submitted for CEO approval.
        </div>
      )}
      {success === "created" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium">
          Draft saved. Add quotations and submit when ready.
        </div>
      )}

      {/* Summary cards */}
      {isCEO && pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          📋 <strong>{pendingCount}</strong> procurement request{pendingCount > 1 ? "s" : ""} pending your review.
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Pending Approval</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{draftCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{procurements.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {procurements.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No procurement requests yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Request</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Requested By</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Est. Cost</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Quotations</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {procurements.map((p) => {
                const needsQuotes = p.estimatedCost >= 100000;
                const hasEnough  = p.quotations.length >= 3;
                const canSubmit  = !needsQuotes || hasEnough;
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{p.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(p.createdAt)}{p.category ? ` · ${p.category}` : ""}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{p.requester.name}</td>
                    <td className="px-5 py-3 text-gray-700 font-medium">
                      {formatCurrency(p.estimatedCost, p.currency)}
                    </td>
                    <td className="px-5 py-3">
                      {needsQuotes ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          hasEnough ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"
                        }`}>
                          {p.quotations.length}/3
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {STATUS_LABELS[p.status] ?? p.status}
                      </span>
                      {p.status === "DRAFT" && !canSubmit && (
                        <p className="text-xs text-orange-500 mt-0.5">3 quotations required</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`/astelfin_26/procurement/${p.id}`}
                        className="text-brand-gold hover:underline text-xs font-semibold">
                        {isCEO && p.status === "PENDING_APPROVAL" ? "Review" : "View"}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
