import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "Audit Log | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = parseInt(page ?? "1");
  const pageSize = 50;
  const skip = (pageNum - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      take: pageSize,
      skip,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  const ACTION_COLORS: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700",
    UPDATE: "bg-blue-100 text-blue-700",
    DELETE: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total entries</p>
        </div>
        <Link
          href="/finance/settings"
          className="text-sm text-brand-gold hover:underline"
        >
          ← Settings
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No audit entries yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Time</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">User</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Action</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Entity</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 text-gray-400 whitespace-nowrap text-xs">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-5 py-2.5 text-gray-600 font-medium">{log.user.name}</td>
                  <td className="px-5 py-2.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-brand-navy font-medium">{log.entity}</td>
                  <td className="px-5 py-2.5 text-gray-500 text-xs">{log.detail ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {pageNum > 1 && (
            <Link
              href={`/finance/settings/audit?page=${pageNum - 1}`}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              ← Previous
            </Link>
          )}
          <span className="text-sm text-gray-500">
            Page {pageNum} of {totalPages}
          </span>
          {pageNum < totalPages && (
            <Link
              href={`/finance/settings/audit?page=${pageNum + 1}`}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
