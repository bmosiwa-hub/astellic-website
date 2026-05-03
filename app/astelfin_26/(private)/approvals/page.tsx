import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import { approveChange, rejectChange } from "@/lib/change-actions";

export const metadata = {
  title: "Approvals | Astellic Finance",
  robots: { index: false, follow: false },
};

/* ── field helpers ──────────────────────────────────────────────── */

const FIELD_LABELS: Record<string, string> = {
  incomeType:   "Type",
  description:  "Description",
  amount:       "Amount",
  currency:     "Currency",
  receivedDate: "Date Received",
  paidDate:     "Date Paid",
  source:       "Source",
  invoiceNumber:"Invoice No.",
  projectId:    "Project ID",
  notes:        "Notes",
  category:     "Category",
  vendor:       "Vendor",
  receiptRef:   "Receipt Ref.",
};

const IGNORED = new Set(["id", "createdAt", "updatedAt"]);

function fmtVal(key: string, val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  if (key.toLowerCase().includes("date")) {
    try {
      return new Date(String(val)).toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
      });
    } catch { return String(val); }
  }
  if (key === "amount") return Number(val).toLocaleString();
  return String(val);
}

function getDiff(
  snapshot: Record<string, unknown>,
  proposed: Record<string, unknown>
): { key: string; label: string; old: string; next: string }[] {
  const keys = Object.keys({ ...snapshot, ...proposed }).filter((k) => !IGNORED.has(k));
  return keys
    .filter((k) => String(snapshot[k] ?? "") !== String(proposed[k] ?? ""))
    .map((k) => ({
      key: k,
      label: FIELD_LABELS[k] ?? k,
      old: fmtVal(k, snapshot[k]),
      next: fmtVal(k, proposed[k]),
    }));
}

/* ── page ──────────────────────────────────────────────────────── */

export default async function ApprovalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const isCEO = session.user.role === "CEO";

  const [pending, history] = await Promise.all([
    prisma.pendingChange.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        requester: { select: { name: true } },
      },
    }),
    prisma.pendingChange.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { reviewedAt: "desc" },
      take: 30,
      include: {
        requester: { select: { name: true } },
        approver:  { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">
          {isCEO ? "Approvals" : "Change Requests"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isCEO
            ? "Review and approve or reject pending transaction changes."
            : "Track the status of your edit and delete requests."}
        </p>
      </div>

      {/* ── pending ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">
          Pending Approval
          {pending.length > 0 && (
            <span className="ml-2 bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 text-xs font-bold">
              {pending.length}
            </span>
          )}
        </h2>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-10 text-center text-gray-400 text-sm">
            No pending requests.
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((change) => {
              const snapshot = change.snapshot as Record<string, unknown>;
              const proposed = change.proposed as Record<string, unknown> | null;
              const diff = proposed ? getDiff(snapshot, proposed) : [];

              const approveAction = approveChange.bind(null, change.id);
              const rejectAction  = rejectChange.bind(null, change.id);

              return (
                <div
                  key={change.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${
                          change.changeType === "DELETE"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {change.changeType}
                      </span>
                      <span className="font-semibold text-brand-navy text-sm">
                        {change.entity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Requested by{" "}
                      <span className="font-medium text-gray-600">
                        {change.requester.name}
                      </span>{" "}
                      · {formatDate(change.createdAt)}
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-5">
                    {/* DELETE: show what will be removed */}
                    {change.changeType === "DELETE" && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Record to be deleted
                        </p>
                        <div className="rounded-xl border border-red-100 bg-red-50 overflow-hidden">
                          <table className="w-full text-sm">
                            <tbody className="divide-y divide-red-100">
                              {Object.entries(snapshot)
                                .filter(([k]) => !IGNORED.has(k))
                                .map(([k, v]) => (
                                  <tr key={k}>
                                    <td className="px-4 py-2 text-xs font-medium text-gray-500 w-36">
                                      {FIELD_LABELS[k] ?? k}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-red-800">
                                      {fmtVal(k, v)}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* EDIT: show field diff */}
                    {change.changeType === "EDIT" && diff.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Proposed changes
                        </p>
                        <div className="rounded-xl border border-blue-100 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-blue-50">
                              <tr>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 w-36">
                                  Field
                                </th>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                                  Current
                                </th>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">
                                  Proposed
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-50">
                              {diff.map((row) => (
                                <tr key={row.key} className="bg-white">
                                  <td className="px-4 py-2 text-xs font-medium text-gray-500">
                                    {row.label}
                                  </td>
                                  <td className="px-4 py-2 text-gray-400 line-through">
                                    {row.old}
                                  </td>
                                  <td className="px-4 py-2 font-semibold text-blue-700">
                                    {row.next}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {change.changeType === "EDIT" && diff.length === 0 && (
                      <p className="text-sm text-gray-400 italic">
                        No field differences detected.
                      </p>
                    )}

                    {/* CEO approve / reject forms */}
                    {isCEO && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <form action={approveAction} className="flex items-center gap-2 flex-1">
                          <input
                            name="reviewNote"
                            placeholder="Optional note…"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                          />
                          <button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                          >
                            ✓ Approve
                          </button>
                        </form>

                        <form action={rejectAction} className="flex items-center gap-2">
                          <input
                            name="reviewNote"
                            placeholder="Reason for rejection…"
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                          />
                          <button
                            type="submit"
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
                          >
                            ✗ Reject
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Finance Manager: read-only status */}
                    {!isCEO && (
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block" />
                        Awaiting Executive Director review
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── history ─────────────────────────────────────────────── */}
      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">
            Recent History
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Entity</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Requested by</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Reviewed by</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Note</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${
                          h.changeType === "DELETE"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {h.changeType}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-brand-navy">{h.entity}</td>
                    <td className="px-5 py-3 text-gray-500">{h.requester.name}</td>
                    <td className="px-5 py-3 text-gray-500">{h.approver?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-400 max-w-xs truncate">
                      {h.reviewNote ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          h.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                      {h.reviewedAt ? formatDate(h.reviewedAt) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
