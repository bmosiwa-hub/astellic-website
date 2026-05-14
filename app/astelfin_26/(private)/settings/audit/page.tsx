import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Audit Log | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDateTime(d: Date) {
  return d.toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

const ACTION_COLORS: Record<string, string> = {
  CREATE:       "bg-green-100 text-green-700",
  UPDATE:       "bg-blue-100 text-blue-700",
  DELETE:       "bg-red-100 text-red-700",
  APPROVE:      "bg-emerald-100 text-emerald-700",
  REJECT:       "bg-rose-100 text-rose-700",
  SUBMIT:       "bg-amber-100 text-amber-700",
  SUBMITTED:    "bg-amber-100 text-amber-700",
  LOGIN:        "bg-indigo-100 text-indigo-700",
  LOGOUT:       "bg-gray-100 text-gray-500",
  EXPORT:       "bg-cyan-100 text-cyan-700",
  LOCK:         "bg-purple-100 text-purple-700",
  LOCK_PERIOD:  "bg-purple-100 text-purple-700",
  CLOSE_PERIOD: "bg-orange-100 text-orange-700",
  REOPEN_PERIOD:"bg-yellow-100 text-yellow-700",
};

const ROLE_COLORS: Record<string, string> = {
  CEO:             "bg-brand-gold text-white",
  FINANCE_MANAGER: "bg-blue-100 text-blue-700",
  PROJECT_MANAGER: "bg-emerald-100 text-emerald-700",
  STAFF:           "bg-gray-100 text-gray-600",
  CONSULTANT:      "bg-purple-100 text-purple-700",
};

// Build a URL preserving existing params while overriding specified ones
function buildUrl(base: Record<string, string>, overrides: Record<string, string | undefined>) {
  const params = new URLSearchParams(base);
  for (const [k, v] of Object.entries(overrides)) {
    if (v == null || v === "") params.delete(k);
    else params.set(k, v);
  }
  params.delete("page"); // filter changes always reset to page 1
  return `/astelfin_26/settings/audit?${params.toString()}`;
}

function pageUrl(base: Record<string, string>, page: number) {
  const params = new URLSearchParams(base);
  params.set("page", String(page));
  return `/astelfin_26/settings/audit?${params.toString()}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?:       string;
    user?:       string;
    entity?:     string;
    action?:     string;
    dateFrom?:   string;
    dateTo?:     string;
  }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const sp = await searchParams;
  const page     = Math.max(1, parseInt(sp.page ?? "1") || 1);
  const perPage  = 50;
  const skip     = (page - 1) * perPage;

  const filterUser   = sp.user?.trim()   || undefined;
  const filterEntity = sp.entity?.trim() || undefined;
  const filterAction = sp.action?.trim() || undefined;
  const filterFrom   = sp.dateFrom       || undefined;
  const filterTo     = sp.dateTo         || undefined;

  // Build Prisma where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};
  if (filterUser) {
    where.OR = [
      { userName:  { contains: filterUser, mode: "insensitive" } },
      { userEmail: { contains: filterUser, mode: "insensitive" } },
    ];
  }
  if (filterEntity) where.entityType = filterEntity;
  if (filterAction) where.action     = filterAction;
  if (filterFrom || filterTo) {
    where.createdAt = {};
    if (filterFrom) where.createdAt.gte = new Date(filterFrom);
    if (filterTo)   where.createdAt.lte = new Date(filterTo + "T23:59:59Z");
  }

  // Fetch distinct entity types and actions for dropdowns (unfiltered)
  const [events, total, entityTypes, actions] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take:    perPage,
      skip,
    }),
    prisma.auditEvent.count({ where }),
    prisma.auditEvent.findMany({
      distinct: ["entityType"],
      select:   { entityType: true },
      orderBy:  { entityType: "asc" },
    }),
    prisma.auditEvent.findMany({
      distinct: ["action"],
      select:   { action: true },
      orderBy:  { action: "asc" },
    }),
  ]);

  const totalPages   = Math.ceil(total / perPage);
  const hasFilter    = !!(filterUser || filterEntity || filterAction || filterFrom || filterTo);

  // Current params for URL building (all as strings)
  const currentParams: Record<string, string> = {};
  if (filterUser)   currentParams.user     = filterUser;
  if (filterEntity) currentParams.entity   = filterEntity;
  if (filterAction) currentParams.action   = filterAction;
  if (filterFrom)   currentParams.dateFrom = filterFrom;
  if (filterTo)     currentParams.dateTo   = filterTo;
  if (sp.page)      currentParams.page     = sp.page;

  return (
    <div className="space-y-5 max-w-7xl">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Audit Log</h1>
          <p className="text-gray-500 text-sm mt-1">
            {hasFilter
              ? `${total.toLocaleString()} matching event${total !== 1 ? "s" : ""} (filtered)`
              : `${total.toLocaleString()} total event${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link href="/astelfin_26/settings" className="text-sm text-brand-gold hover:underline mt-1">
          ← Settings
        </Link>
      </div>

      {/* Filter bar */}
      <form method="GET" action="/astelfin_26/settings/audit"
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">User / Email</label>
            <input
              name="user"
              defaultValue={filterUser}
              placeholder="Search user…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Entity Type</label>
            <select name="entity" defaultValue={filterEntity ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
              <option value="">All entities</option>
              {entityTypes.map((e) => (
                <option key={e.entityType} value={e.entityType}>{e.entityType}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Action</label>
            <select name="action" defaultValue={filterAction ?? ""}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
              <option value="">All actions</option>
              {actions.map((a) => (
                <option key={a.action} value={a.action}>{a.action}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
            <input type="date" name="dateFrom" defaultValue={filterFrom}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
            <input type="date" name="dateTo" defaultValue={filterTo}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button type="submit"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
            Apply Filters
          </button>
          {hasFilter && (
            <Link href="/astelfin_26/settings/audit"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Results table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">{hasFilter ? "No events match the current filters." : "No audit events yet."}</p>
            {hasFilter && (
              <Link href="/astelfin_26/settings/audit" className="text-brand-gold text-sm hover:underline mt-2 inline-block">
                Clear filters
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Timestamp</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Entity</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Detail</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">IP</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">Checksum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-2.5 text-xs text-gray-400 whitespace-nowrap font-mono">
                      {fmtDateTime(ev.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-gray-700 text-xs leading-tight">
                        {ev.userName || ev.userEmail || "System"}
                      </p>
                      {ev.userRole && (
                        <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${ROLE_COLORS[ev.userRole] ?? "bg-gray-100 text-gray-500"}`}>
                          {ev.userRole.replace("_", " ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap ${ACTION_COLORS[ev.action] ?? "bg-gray-100 text-gray-600"}`}>
                        {ev.action}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-brand-navy font-medium text-xs">{ev.entityType}</p>
                      {ev.entityId && (
                        <p className="text-gray-400 text-[10px] font-mono mt-0.5 truncate max-w-[120px]" title={ev.entityId}>
                          {ev.entityId.slice(-10)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 max-w-[260px]">
                      <span className="block truncate" title={ev.detail ?? undefined}>
                        {ev.detail ?? <span className="text-gray-300">—</span>}
                      </span>
                      {ev.changedFields.length > 0 && (
                        <span className="text-[10px] text-gray-400 mt-0.5 block">
                          Fields: {ev.changedFields.join(", ")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-gray-400 font-mono hidden xl:table-cell whitespace-nowrap">
                      {ev.ipAddress !== "unknown" ? ev.ipAddress : <span className="text-gray-200">—</span>}
                    </td>
                    <td className="px-4 py-2.5 hidden xl:table-cell">
                      {ev.checksum ? (
                        <span className="text-[10px] font-mono text-gray-300" title={ev.checksum}>
                          {ev.checksum.slice(0, 12)}…
                        </span>
                      ) : <span className="text-gray-200 text-[10px]">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {skip + 1}–{Math.min(skip + perPage, total)} of {total.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <Link href={pageUrl(currentParams, page - 1)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                ← Previous
              </Link>
            )}
            <span className="text-sm text-gray-500 px-2">
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={pageUrl(currentParams, page + 1)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Next →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Quick-filter chips for common views */}
      <div className="flex flex-wrap gap-2 pt-1">
        <p className="text-xs text-gray-400 self-center mr-1">Quick filters:</p>
        {[
          { label: "Deletions",     params: { action: "DELETE" } },
          { label: "Logins",        params: { action: "LOGIN"  } },
          { label: "Period locks",  params: { action: "LOCK_PERIOD" } },
          { label: "Exports",       params: { action: "EXPORT" } },
          { label: "Income",        params: { entity: "Income" } },
          { label: "Procurement",   params: { entity: "Procurement" } },
          { label: "FinancialPeriod", params: { entity: "FinancialPeriod" } },
        ].map(({ label, params }) => (
          <Link key={label}
            href={buildUrl({}, params)}
            className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-brand-gold hover:text-brand-gold transition-colors">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
