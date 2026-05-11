import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/finance-utils";

export const metadata = {
  title: "Crawler Sources | Astelfin IMS",
  robots: { index: false, follow: false },
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  RSS:        "bg-blue-100 text-blue-700",
  HTML:       "bg-amber-100 text-amber-700",
  PLAYWRIGHT: "bg-purple-100 text-purple-700",
};

async function toggleSource(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel");
  const id = formData.get("id") as string;
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

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/intel");
  const { confirm } = await searchParams;

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

  return (
    <div className="space-y-6">
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
            The Railway crawler service checks these on schedule.
          </p>
        </div>
        <Link href="/astelfin_26/intel/sources/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          + Add Source
        </Link>
      </div>

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
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Discoveries</th>
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
                            <span key={t} className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                              {t}
                            </span>
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
                      {s.crawlIntervalMins >= 60
                        ? `${s.crawlIntervalMins / 60}h`
                        : `${s.crawlIntervalMins}m`}
                    </td>
                    <td className="px-5 py-3">
                      {lastRun ? (
                        <div>
                          <p className={`text-xs font-semibold ${
                            lastRun.status === "COMPLETED" ? "text-green-600"
                            : lastRun.status === "FAILED" ? "text-red-600"
                            : lastRun.status === "RUNNING" ? "text-blue-600"
                            : "text-gray-400"
                          }`}>{lastRun.status}</p>
                          <p className="text-xs text-gray-400">{formatDate(lastRun.startedAt)}</p>
                          {lastRun.itemsNew > 0 && (
                            <p className="text-xs text-brand-navy">+{lastRun.itemsNew} new</p>
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
                      <div className="inline-flex items-center gap-3">
                        <Link href={`/astelfin_26/intel/sources/${s.id}/edit`}
                          className="text-xs font-semibold text-brand-navy hover:underline">
                          Edit
                        </Link>
                        <form action={toggleSource}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="active" value={String(s.active)} />
                          <button type="submit"
                            className={`text-xs font-semibold hover:underline ${s.active ? "text-gray-400" : "text-green-600"}`}>
                            {s.active ? "Pause" : "Enable"}
                          </button>
                        </form>
                        {confirm === s.id ? (
                          <form action={deleteSource} className="inline-flex items-center gap-2">
                            <input type="hidden" name="id" value={s.id} />
                            <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">
                              Confirm delete
                            </button>
                            <Link href="/astelfin_26/intel/sources" className="text-xs text-gray-400 hover:underline">
                              Cancel
                            </Link>
                          </form>
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

      {/* Info box */}
      <div className="bg-brand-light rounded-xl px-5 py-4 text-sm text-brand-muted">
        <p className="font-semibold text-brand-navy mb-1">How the crawler works</p>
        <p>
          The Railway crawler service polls these sources according to their interval.
          When a new opportunity is detected, it&apos;s submitted to the IMS via the
          <code className="text-xs bg-white px-1 py-0.5 rounded mx-1">/api/intel/discover</code>
          endpoint, deduplicated, and processed by the AI pipeline automatically.
          RSS sources are scraped with fast-xml-parser; HTML sources with Cheerio;
          JavaScript-rendered pages with Playwright.
        </p>
      </div>
    </div>
  );
}
