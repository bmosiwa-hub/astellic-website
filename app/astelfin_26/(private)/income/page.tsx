import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import Link from "next/link";
import DeleteButton from "@/components/finance/DeleteButton";

export const metadata = {
  title: "Income | Astellic Finance",
  robots: { index: false, follow: false },
};

const TYPE_LABELS: Record<string, string> = {
  GRANT: "Grant",
  PRIVATE_SERVICE: "Private Service",
  DONATION: "Donation",
};

const TYPE_COLORS: Record<string, string> = {
  GRANT: "bg-blue-100 text-blue-700",
  PRIVATE_SERVICE: "bg-purple-100 text-purple-700",
  DONATION: "bg-green-100 text-green-700",
};

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; type?: string; edit_requested?: string; error?: string }>;
}) {
  const { project, type, edit_requested, error } = await searchParams;

  const session     = await auth();
  const activeOrgId = await getActiveOrgId(session);
  const orgFilter   = orgWhere(activeOrgId);

  const [income, projects, pendingChanges] = await Promise.all([
    prisma.income.findMany({
      where: {
        ...(project ? { projectId: project } : {}),
        ...(type ? { incomeType: type as "GRANT" | "PRIVATE_SERVICE" | "DONATION" } : {}),
        ...orgFilter,
      },
      orderBy: { receivedDate: "desc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.pendingChange.findMany({
      where: { entity: "Income", status: "PENDING" },
      select: { entityId: true, changeType: true },
    }),
  ]);

  const total = income.reduce((s: number, r) => s + r.amount, 0);
  const pendingMap = new Map(pendingChanges.map((c) => [c.entityId, c.changeType]));

  return (
    <div className="space-y-6">
      {edit_requested && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-sm text-blue-800">
          Your edit request has been submitted. The Chief Executive Officer will review it shortly.
        </div>
      )}
      {error === "already_pending" && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 text-sm text-orange-800">
          A change request is already pending for that record. Please wait for approval before submitting another.
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Income</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: <span className="font-semibold text-green-600">{formatCurrency(total)}</span>
            {" · "}
            <Link
              href="/astelfin_26/income/breakdown"
              className="text-brand-gold hover:underline text-sm font-semibold"
            >
              View breakdown →
            </Link>
          </p>
        </div>
        <Link
          href="/astelfin_26/income/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Record Income
        </Link>
      </div>

      {/* Filter */}
      <form method="get" className="flex items-center gap-3 flex-wrap">
        <select
          name="project"
          defaultValue={project ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          name="type"
          defaultValue={type ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <option value="">All Types</option>
          <option value="GRANT">Grant</option>
          <option value="PRIVATE_SERVICE">Private Service</option>
          <option value="DONATION">Donation</option>
        </select>
        <button
          type="submit"
          className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Filter
        </button>
        {(project || type) && (
          <Link href="/astelfin_26/income" className="text-sm text-brand-gold hover:underline">
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {income.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No income records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Project</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Source</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {income.map((r) => {
                const pending = pendingMap.get(r.id);
                return (
                  <tr key={r.id} className={`hover:bg-gray-50 transition-colors ${pending ? "bg-orange-50/40" : ""}`}>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {formatDate(r.receivedDate)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[r.incomeType]}`}
                      >
                        {TYPE_LABELS[r.incomeType]}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-brand-navy">{r.description}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {r.project?.name ?? <span className="italic text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{r.source ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-green-600">
                      {formatCurrency(r.amount, r.currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {pending ? (
                        <span className="text-xs text-orange-500 font-medium italic whitespace-nowrap">
                          ⏳ {pending === "DELETE" ? "Delete" : "Edit"} pending
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/astelfin_26/income/${r.id}/edit`}
                            className="text-xs text-brand-gold font-semibold hover:underline"
                          >
                            Edit
                          </Link>
                          <DeleteButton entity="Income" entityId={r.id} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td colSpan={6} className="px-5 py-3 font-bold text-brand-navy">
                  Total
                </td>
                <td className="px-5 py-3 text-right font-bold text-green-600">
                  {formatCurrency(total)}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
