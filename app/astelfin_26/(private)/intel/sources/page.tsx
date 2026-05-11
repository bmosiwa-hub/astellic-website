import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/finance-utils";
import { crawlSource } from "@/lib/intel/crawler";

export const metadata = {
  title: "Crawler Sources | Astelfin IMS",
  robots: { index: false, follow: false },
};

// Allow up to 60s for refresh actions (fetching + storing raw items)
export const maxDuration = 60;

const SOURCE_TYPE_COLORS: Record<string, string> = {
  RSS:        "bg-blue-100 text-blue-700",
  HTML:       "bg-amber-100 text-amber-700",
  PLAYWRIGHT: "bg-purple-100 text-purple-700",
  WPJOBS:     "bg-green-100 text-green-700",
};

// ── Server Actions ────────────────────────────────────────────────────────────

async function toggleSource(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel");
  const id     = formData.get("id") as string;
  const active = formData.get("active") === "true";
  await prisma.crawlerSource.update({ where: { id }, data: { active: !active } });
  redirect("/astelfin_26/intel/sources");
}

async function deleteSource(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel");
  const id = formData.get("id") as string;
  await prisma.crawlerSource.delete({ where: { id } });
  redirect("/astelfin_26/intel/sources");
}

async function refreshOne(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel");
  const id = formData.get("id") as string;
  const result = await crawlSource(id);
  redirect(`/astelfin_26/intel/sources?msg=${result.added}+new+from+refresh`);
}

async function refreshAll(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel");

  const sources = await prisma.crawlerSource.findMany({
    where: { active: true, sourceType: { not: "PLAYWRIGHT" } },
    select: { id: true },
  });

  let totalAdded = 0;
  for (const s of sources) {
    try {
      const result = await crawlSource(s.id);
      totalAdded += result.added;
    } catch {
      // continue on error
    }
  }

  redirect(`/astelfin_26/intel/sources?msg=${totalAdded}+new+from+refresh+all`);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string; msg?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel");
  const { confirm, msg } = await searchParams;

  const sources = await prisma.crawlerSource.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { discoveries: true, crawlRuns: true } },
      crawlRuns: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: { status: true, startedAt: true, itemsNew: true, errorMsg: true },
      },
    },
  });

  const activeRssHtml = sources.filter((s) => s.active && s.sourceType !== "PLAYWRIGHT").length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
            <Link href="/astelfin_26/intel" className="hover:text-brand-navy">← Intelligence Feed</Link>
            <span>/</span>
            <span className="text-brand-navy font-medium">Sources</span>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Crawler Sources</h1>
          <p className="text-gray-500 text-sm mt-1">
            {sources.length} source{sources.length !== 1 ? "s" : ""} configured.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeRssHtml > 0 && (
            <form action={refreshAll}>
              <button type="submit"
                className="border border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                ↻ Refresh All ({activeRssHtml})
              </button>
            </form>
          )}
          <Link href="/astelfin_26/intel/sources/new"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            + Add Source
          </Link>
        </div>
      </div>

      {/* Success message */}
      {msg && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          ✓ {decodeURIComponent(msg).replace(/\+/g, " ")}. New opportunities are in the feed as <strong>Unreviewed</strong> — open each one to trigger AI analysis.
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {sources.length === 0 ? (
          <p className="text-center py-12 text-gray-400">
            No sources configured.{" "}
            <Link href="/astelfin_26/intel/sources/new" className="text-brand-gold hover:underline">
              Add your first source →
            </Link>
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Source</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Interval</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Last Run</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Found</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sources.map((s) => {
                const lastRun = s.crawlRuns[0];
                return (
                  <tr key={s.id} className={`hover:bg-gray-50 ${!s.active ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{s.name}</p>
                      <a href={s.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-brand-gold hover:underline truncate max-w-xs block">
                        {s.url}
                      </a>
                      {s.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {s.tags.map((t) => (
                            <span key={t} className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{t}</span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SOURCE_TYPE_COLORS[s.sourceType] ?? "bg-gray-100"}`}>
                        {s.sourceType}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-gray-500">
                      {s.crawlIntervalMins >= 60 ? `${s.crawlIntervalMins / 60}h` : `${s.crawlIntervalMins}m`}
                    </td>

                    <td className="px-5 py-3">
                      {lastRun ? (
                        <div>
                          <p className={`text-xs font-semibold ${
                            lastRun.status === "COMPLETED" ? "text-green-600"
                            : lastRun.status === "FAILED"    ? "text-red-600"
                            : lastRun.status === "RUNNING"   ? "text-blue-600 animate-pulse"
                            : "text-gray-400"
                          }`}>{lastRun.status}</p>
                          <p className="text-xs text-gray-400">{formatDate(lastRun.startedAt)}</p>
                          {lastRun.itemsNew > 0 && (
                            <p className="text-xs text-brand-navy font-medium">+{lastRun.itemsNew} new</p>
                          )}
                          {lastRun.errorMsg && (
                            <p className="text-xs text-red-500 truncate max-w-[180px]" title={lastRun.errorMsg}>
                              {lastRun.errorMsg}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Never run</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-gray-600">{s._count.discoveries}</td>

                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-3 flex-wrap justify-end">

                        {/* Refresh this source */}
                        {s.active && s.sourceType !== "PLAYWRIGHT" && (
                          <form action={refreshOne}>
                            <input type="hidden" name="id" value={s.id} />
                            <button type="submit"
                              className="text-xs font-semibold text-brand-teal hover:underline">
                              ↻ Refresh
                            </button>
                          </form>
                        )}

                        {/* Edit */}
                        <Link href={`/astelfin_26/intel/sources/${s.id}/edit`}
                          className="text-xs font-semibold text-brand-navy hover:underline">
                          Edit
                        </Link>

                        {/* Pause / Enable */}
                        <form action={toggleSource}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="active" value={String(s.active)} />
                          <button type="submit"
                            className={`text-xs font-semibold hover:underline ${s.active ? "text-gray-400" : "text-green-600"}`}>
                            {s.active ? "Pause" : "Enable"}
                          </button>
                        </form>

                        {/* Delete — URL-param confirm pattern */}
                        {confirm === s.id ? (
                          <span className="inline-flex items-center gap-2">
                            <form action={deleteSource} className="inline">
                              <input type="hidden" name="id" value={s.id} />
                              <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">
                                Confirm
                              </button>
                            </form>
                            <Link href="/astelfin_26/intel/sources" className="text-xs text-gray-400 hover:underline">
                              Cancel
                            </Link>
                          </span>
                        ) : (
                          <Link href={`/astelfin_26/intel/sources?confirm=${s.id}`}
                            className="text-xs font-semibold text-gray-300 hover:text-red-500 hover:underline">
                            Delete
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Info */}
      <div className="bg-brand-light rounded-xl px-5 py-4 text-sm text-brand-muted">
        <p className="font-semibold text-brand-navy mb-1">How refreshing works</p>
        <p>
          <strong>Refresh</strong> fetches a single source now and stores any new items as <em>Unreviewed</em>.
          <strong> Refresh All</strong> does the same for every active RSS/HTML source.
          New items appear in the Discovery Feed — open each one to trigger the AI analysis pipeline.
          PLAYWRIGHT sources can only be refreshed by the Railway crawler service on its normal schedule.
        </p>
      </div>
    </div>
  );
}
