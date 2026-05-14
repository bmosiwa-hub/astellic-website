import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Login History | Astelfin IMS",
  robots: { index: false, follow: false },
};

function formatDateTime(d: Date) {
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

export default async function LoginHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const { email: filterEmail, page: pageStr } = await searchParams;
  const page    = Math.max(1, parseInt(pageStr ?? "1") || 1);
  const perPage = 50;
  const skip    = (page - 1) * perPage;

  const where = filterEmail
    ? { email: { contains: filterEmail, mode: "insensitive" as const } }
    : {};

  const [events, total] = await Promise.all([
    prisma.loginEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take:    perPage,
      skip,
    }),
    prisma.loginEvent.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/astelfin_26/settings"
          className="text-gray-400 hover:text-brand-navy transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Login History</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Full authentication audit log — all login attempts across all users.
            {" "}<span className="font-medium text-brand-navy">{total.toLocaleString()}</span> events total.
          </p>
        </div>
      </div>

      {/* Filter */}
      <form method="GET" className="flex items-center gap-3">
        <input
          name="email"
          defaultValue={filterEmail}
          placeholder="Filter by email…"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/40 w-64"
        />
        <button type="submit"
          className="bg-brand-navy hover:bg-brand-navy/90 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          Filter
        </button>
        {filterEmail && (
          <Link href="/astelfin_26/settings/login-history"
            className="text-sm text-gray-400 hover:text-brand-navy">
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <p className="py-12 text-center text-gray-400 text-sm">No login events found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Time</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Result</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Reason</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">IP Address</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden lg:table-cell">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {events.map((e) => (
                <tr key={e.id} className={`hover:bg-gray-50 ${!e.success ? "bg-red-50/30" : ""}`}>
                  <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                    {formatDateTime(e.createdAt)}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-800">{e.email}</td>
                  <td className="px-5 py-3">
                    {e.success ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Success
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-500 hidden md:table-cell">
                    {e.failureReason ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-xs font-mono text-gray-500 hidden lg:table-cell">
                    {e.ipAddress}
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 hidden lg:table-cell max-w-[220px] truncate">
                    {e.userAgent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/astelfin_26/settings/login-history?${filterEmail ? `email=${encodeURIComponent(filterEmail)}&` : ""}page=${page - 1}`}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/astelfin_26/settings/login-history?${filterEmail ? `email=${encodeURIComponent(filterEmail)}&` : ""}page=${page + 1}`}
                className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
