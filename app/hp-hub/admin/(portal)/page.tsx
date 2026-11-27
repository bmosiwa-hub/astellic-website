import Link from "next/link";
import { PageHeader, Panel, Pill, Stat, STATUS_TONE, fmtDate, Notice } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { STATUS_LABELS, SUBMISSION_LABELS } from "@/lib/hp-hub/constants";
import { storageConfigured } from "@/lib/hp-hub/storage";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const actor = await requireHpPage();
  const sp = await searchParams;

  const [byStatus, awaitingVerification, downloads, recentDocs, recentSubs, popular, tracker, overdue] = await Promise.all([
    prisma.hpDocument.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.hpDocument.count({ where: { verificationStatus: { in: ["UNVERIFIED", "PENDING_VERIFICATION"] }, status: { not: "ARCHIVED" } } }),
    prisma.hpDownloadEvent.count({ where: { method: "DOWNLOAD" } }),
    prisma.hpDocument.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, title: true, status: true, createdAt: true, isSynthetic: true, createdBy: { select: { user: { select: { name: true } } } } },
    }),
    prisma.hpSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, title: true, status: true, createdAt: true, submitterName: true } }),
    prisma.hpDocument.findMany({ where: { downloadCount: { gt: 0 } }, orderBy: { downloadCount: "desc" }, take: 5, select: { id: true, title: true, downloadCount: true } }),
    prisma.hpAcquisitionItem.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.hpAcquisitionItem.findMany({
      where: { nextActionDue: { lte: new Date() }, status: { not: "ACQUIRED" } },
      orderBy: { nextActionDue: "asc" },
      take: 5,
      select: { id: true, title: true, nextAction: true, nextActionDue: true },
    }),
  ]);

  const statusCount = (s: string) => byStatus.find((b) => b.status === s)?._count._all ?? 0;
  const total = byStatus.reduce((n, b) => n + b._count._all, 0);
  const trackerCount = (s: string) => tracker.find((t) => t.status === s)?._count._all ?? 0;
  const identified = tracker.reduce((n, t) => n + t._count._all, 0);

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description={`Signed in as ${actor.name}. All figures are live counts from the repository database.`} />

      {sp.error === "forbidden" && <Notice tone="error">Your role doesn&rsquo;t include access to that page.</Notice>}
      {!storageConfigured() && (
        <Notice tone="warn">File storage isn&rsquo;t configured (no BLOB_READ_WRITE_TOKEN), so uploads and downloads are disabled.</Notice>
      )}

      <section aria-labelledby="repo-stats">
        <h2 id="repo-stats" className="text-xs font-bold uppercase tracking-[0.16em] text-brand-muted mb-3">
          Repository
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          <Stat label="Total documents" value={total} href="/hp-hub/admin/documents" />
          <Stat label="Published" value={statusCount("PUBLISHED")} href="/hp-hub/admin/documents?status=PUBLISHED" />
          <Stat label="Drafts" value={statusCount("DRAFT")} href="/hp-hub/admin/documents?status=DRAFT" />
          <Stat label="Awaiting review" value={statusCount("PENDING_REVIEW")} href="/hp-hub/admin/documents?status=PENDING_REVIEW" tone="alert" />
          <Stat label="Awaiting verification" value={awaitingVerification} href="/hp-hub/admin/documents?verification=UNVERIFIED,PENDING_VERIFICATION" />
          <Stat label="Downloads" value={downloads} href="/hp-hub/admin/analytics" />
        </div>
      </section>

      <section aria-labelledby="tracker-stats">
        <h2 id="tracker-stats" className="text-xs font-bold uppercase tracking-[0.16em] text-brand-muted mb-3">
          Missing documents tracker
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
          <Stat label="Documents identified" value={identified} href="/hp-hub/admin/tracker" />
          <Stat label="Acquired" value={trackerCount("ACQUIRED")} href="/hp-hub/admin/tracker?status=ACQUIRED" />
          <Stat label="Missing" value={trackerCount("MISSING")} href="/hp-hub/admin/tracker?status=MISSING" tone="alert" />
          <Stat label="Awaiting verification" value={trackerCount("NEEDS_VERIFICATION")} href="/hp-hub/admin/tracker?status=NEEDS_VERIFICATION" />
          <Stat label="Broken source links" value={trackerCount("BROKEN_LINK")} href="/hp-hub/admin/tracker?status=BROKEN_LINK" tone="alert" />
          <Stat label="Need permission" value={trackerCount("PERMISSION_REQUIRED")} href="/hp-hub/admin/tracker?status=PERMISSION_REQUIRED" />
          <Stat label="Need updating" value={trackerCount("NEEDS_UPDATING")} href="/hp-hub/admin/tracker?status=NEEDS_UPDATING" />
        </div>
      </section>

      <div className="grid xl:grid-cols-2 gap-6">
        <Panel title="Recent uploads" actions={<Link href="/hp-hub/admin/documents/new" className="text-sm font-semibold text-brand-teal">Add document</Link>}>
          {recentDocs.length ? (
            <ul className="divide-y divide-gray-100 -my-2">
              {recentDocs.map((d) => (
                <li key={d.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/hp-hub/admin/documents/${d.id}`} className="text-sm font-semibold text-brand-navy hover:text-brand-teal">
                      {d.title}
                    </Link>
                    <p className="text-xs text-brand-muted">
                      {fmtDate(d.createdAt)} · {d.createdBy?.user.name ?? "Import"}
                      {d.isSynthetic ? " · synthetic" : ""}
                    </p>
                  </div>
                  <Pill tone={STATUS_TONE[d.status]}>{STATUS_LABELS[d.status]}</Pill>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-muted">No documents yet.</p>
          )}
        </Panel>

        <Panel title="Recent submissions" actions={<Link href="/hp-hub/admin/submissions" className="text-sm font-semibold text-brand-teal">Review queue</Link>}>
          {recentSubs.length ? (
            <ul className="divide-y divide-gray-100 -my-2">
              {recentSubs.map((s) => (
                <li key={s.id} className="py-2.5 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link href={`/hp-hub/admin/submissions/${s.id}`} className="text-sm font-semibold text-brand-navy hover:text-brand-teal">
                      {s.title}
                    </Link>
                    <p className="text-xs text-brand-muted">
                      {fmtDate(s.createdAt)} · {s.submitterName}
                    </p>
                  </div>
                  <Pill tone={STATUS_TONE[s.status]}>{SUBMISSION_LABELS[s.status]}</Pill>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-muted">No public submissions yet.</p>
          )}
        </Panel>

        <Panel title="Most downloaded">
          {popular.length ? (
            <ol className="divide-y divide-gray-100 -my-2">
              {popular.map((d) => (
                <li key={d.id} className="py-2.5 flex items-center justify-between gap-4">
                  <Link href={`/hp-hub/admin/documents/${d.id}`} className="text-sm text-brand-navy hover:text-brand-teal min-w-0">
                    {d.title}
                  </Link>
                  <span className="text-sm font-semibold tabular-nums text-brand-navy">{d.downloadCount}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-brand-muted">No downloads recorded yet.</p>
          )}
        </Panel>

        <Panel title="Overdue follow-ups" actions={<Link href="/hp-hub/admin/tracker?due=overdue" className="text-sm font-semibold text-brand-teal">Tracker</Link>}>
          {overdue.length ? (
            <ul className="divide-y divide-gray-100 -my-2">
              {overdue.map((t) => (
                <li key={t.id} className="py-2.5">
                  <Link href={`/hp-hub/admin/tracker/${t.id}`} className="text-sm font-semibold text-brand-navy hover:text-brand-teal">
                    {t.title}
                  </Link>
                  <p className="text-xs text-red-700">
                    Due {fmtDate(t.nextActionDue)}
                    {t.nextAction ? ` · ${t.nextAction}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-brand-muted">No follow-ups are overdue.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
