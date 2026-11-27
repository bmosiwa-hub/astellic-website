import Link from "next/link";
import { PageHeader, Panel, Stat } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";

export const metadata = { title: "Analytics" };

const PERIODS = { "30": 30, "90": 90, "365": 365 } as const;

function Bars({ rows, total, label }: { rows: { key: string; label: string; n: number; href?: string }[]; total: number; label: string }) {
  if (!rows.length) return <p className="text-sm text-brand-muted">No {label} recorded in this period.</p>;
  const max = Math.max(...rows.map((r) => r.n));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.key} className="text-sm">
          <div className="flex justify-between gap-4 mb-1">
            {r.href ? (
              <Link href={r.href} className="text-brand-navy hover:text-brand-teal truncate">
                {r.label}
              </Link>
            ) : (
              <span className="text-brand-navy truncate">{r.label}</span>
            )}
            <span className="tabular-nums text-brand-muted shrink-0">
              {r.n}
              {total ? <span className="text-xs"> · {Math.round((r.n / total) * 100)}%</span> : null}
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded" aria-hidden>
            <div className="h-full bg-brand-teal rounded" style={{ width: `${(r.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await requireHpPage("analytics.view");
  const sp = await searchParams;
  const days = PERIODS[(sp.days ?? "90") as keyof typeof PERIODS] ?? 90;
  const since = new Date(Date.now() - days * 86400000);
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  type Row = { key: string; label: string; n: bigint };
  const [allTime, inPeriod, sourceVisits, perDoc, byCountry, byTheme, overTime, byReferrer] = await Promise.all([
    prisma.hpDownloadEvent.count({ where: { method: "DOWNLOAD" } }),
    prisma.hpDownloadEvent.count({ where: { method: "DOWNLOAD", createdAt: { gte: since } } }),
    prisma.hpDownloadEvent.count({ where: { method: "EXTERNAL_SOURCE", createdAt: { gte: since } } }),
    prisma.$queryRaw<Row[]>`
      SELECT d."id" AS key, d."title" AS label, count(*) AS n
      FROM "HpDownloadEvent" e JOIN "HpDocument" d ON d."id" = e."documentId"
      WHERE e."createdAt" >= ${since} AND e."method" = 'DOWNLOAD'
      GROUP BY d."id", d."title" ORDER BY n DESC LIMIT 20`,
    prisma.$queryRaw<Row[]>`
      SELECT coalesce(e."country", '??') AS key, coalesce(e."country", 'Unknown') AS label, count(*) AS n
      FROM "HpDownloadEvent" e WHERE e."createdAt" >= ${since} AND e."method" = 'DOWNLOAD'
      GROUP BY e."country" ORDER BY n DESC LIMIT 20`,
    prisma.$queryRaw<Row[]>`
      SELECT t."slug" AS key, t."name" AS label, count(*) AS n
      FROM "HpDownloadEvent" e
      JOIN "HpDocumentTheme" dt ON dt."documentId" = e."documentId"
      JOIN "HpTheme" t ON t."id" = dt."themeId"
      WHERE e."createdAt" >= ${since} AND e."method" = 'DOWNLOAD'
      GROUP BY t."slug", t."name" ORDER BY n DESC LIMIT 21`,
    prisma.$queryRaw<{ key: string; n: bigint }[]>`
      SELECT to_char(date_trunc(${days > 90 ? "month" : "week"}, e."createdAt"), 'YYYY-MM-DD') AS key, count(*) AS n
      FROM "HpDownloadEvent" e WHERE e."createdAt" >= ${since} AND e."method" = 'DOWNLOAD'
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<Row[]>`
      SELECT coalesce(e."referrerHost", 'direct') AS key, coalesce(e."referrerHost", 'Direct / unknown') AS label, count(*) AS n
      FROM "HpDownloadEvent" e WHERE e."createdAt" >= ${since}
      GROUP BY e."referrerHost" ORDER BY n DESC LIMIT 10`,
  ]);
  const num = (r: Row[]) => r.map((x) => ({ key: x.key, label: x.label, n: Number(x.n) }));
  const countryLabel = (code: string) => {
    try {
      return code.length === 2 ? `${regionNames.of(code) ?? code}` : "Unknown";
    } catch {
      return code;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Download analytics"
        description="Human downloads only: known bots and repeat downloads by the same visitor on the same day aren't counted. No IP addresses or personal data are stored."
        actions={
          <nav className="flex gap-1 text-sm" aria-label="Period">
            {Object.keys(PERIODS).map((k) => (
              <Link key={k} href={`/hp-hub/admin/analytics?days=${k}`} aria-current={Number(k) === days ? "page" : undefined}
                className={`px-3 h-9 inline-flex items-center rounded ${Number(k) === days ? "bg-brand-navy text-white" : "border border-gray-300 text-brand-navy"}`}>
                {k === "365" ? "12 months" : `${k} days`}
              </Link>
            ))}
          </nav>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Downloads, all time" value={allTime} />
        <Stat label={`Downloads, last ${days} days`} value={inPeriod} />
        <Stat label={`Original-source visits, last ${days} days`} value={sourceVisits} />
        <Stat label="Documents downloaded" value={perDoc.length === 20 ? "20+" : perDoc.length} />
      </div>

      <Panel title={`Downloads over time (by ${days > 90 ? "month" : "week"})`}>
        {overTime.length ? (
          <div className="flex items-end gap-1.5 h-40" role="img" aria-label="Downloads over time">
            {overTime.map((p) => {
              const max = Math.max(...overTime.map((x) => Number(x.n)));
              return (
                <div key={p.key} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-0 h-full" title={`${p.key}: ${p.n}`}>
                  <span className="text-[10px] tabular-nums text-brand-muted">{Number(p.n)}</span>
                  <div className="w-full bg-brand-teal rounded-t" style={{ height: `${(Number(p.n) / max) * 100}%`, minHeight: 2 }} />
                  <span className="text-[10px] text-brand-muted truncate w-full text-center">{p.key.slice(5)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-brand-muted">No downloads in this period.</p>
        )}
      </Panel>

      <div className="grid xl:grid-cols-2 gap-6">
        <Panel title="Most downloaded documents">
          <Bars rows={num(perDoc).map((r) => ({ ...r, href: `/hp-hub/admin/documents/${r.key}` }))} total={inPeriod} label="downloads" />
        </Panel>
        <Panel title="By visitor country">
          <Bars rows={num(byCountry).map((r) => ({ ...r, label: countryLabel(r.key) }))} total={inPeriod} label="downloads" />
        </Panel>
        <Panel title="By theme">
          <Bars rows={num(byTheme)} total={0} label="downloads" />
          <p className="text-xs text-brand-muted mt-3">A document in several themes counts towards each.</p>
        </Panel>
        <Panel title="Referring websites (downloads and source visits)">
          <Bars rows={num(byReferrer)} total={0} label="visits" />
        </Panel>
      </div>
    </div>
  );
}
