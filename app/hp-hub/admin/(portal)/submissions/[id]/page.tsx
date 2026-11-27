import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Panel, Pill, STATUS_TONE, fmtDate, Flash, btnPrimary, btnSecondary, inputCls, textareaCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { submissionToTracker, updateSubmission } from "@/lib/hp-hub/admin/review-actions";
import { SUBMISSION_LABELS } from "@/lib/hp-hub/constants";
import { formatFileSize } from "@/lib/hp-hub/text";

export const metadata = { title: "Submission" };

export default async function SubmissionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireHpPage("submission.review");
  const { id } = await params;
  const sp = await searchParams;
  const s = await prisma.hpSubmission.findUnique({
    where: { id },
    include: { country: true, document: { select: { id: true, title: true } }, reviewedBy: { include: { user: { select: { name: true } } } } },
  });
  if (!s) notFound();

  // Possible duplicates already in the repository or tracker.
  const words = s.title.split(/\s+/).filter((w) => w.length > 3).slice(0, 4);
  const [docMatches, trackerMatches] = words.length
    ? await Promise.all([
        prisma.hpDocument.findMany({ where: { AND: words.map((w) => ({ title: { contains: w, mode: "insensitive" as const } })) }, select: { id: true, title: true, status: true }, take: 5 }),
        prisma.hpAcquisitionItem.findMany({ where: { AND: words.map((w) => ({ title: { contains: w, mode: "insensitive" as const } })) }, select: { id: true, title: true, status: true }, take: 5 }),
      ])
    : [[], []];

  const rows: [string, React.ReactNode][] = [
    ["Title", s.title],
    ["Country", s.country?.name ?? "—"],
    ["Publisher", s.publisherName ?? "—"],
    ["Document type", s.documentTypeName ?? "—"],
    ["Year", s.year ?? "—"],
    [
      "Source URL",
      s.sourceUrl ? (
        <a href={s.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-brand-teal break-all">
          {s.sourceUrl}
        </a>
      ) : (
        "—"
      ),
    ],
    [
      "File",
      s.storagePath ? (
        <a href={`/api/hp-hub/admin/file?kind=submission&id=${s.id}`} target="_blank" rel="noopener" className="text-brand-teal">
          {s.fileName} ({formatFileSize(s.fileSize)})
        </a>
      ) : (
        "—"
      ),
    ],
    ["Submitted by", `${s.submitterName} <${s.submitterEmail}>`],
    ["Received", fmtDate(s.createdAt, true)],
    ["Additional information", <span key="i" className="whitespace-pre-line">{s.info ?? "—"}</span>],
  ];

  return (
    <div className="max-w-5xl">
      <PageHeader title={s.title} back={{ href: "/hp-hub/admin/submissions", label: "Submissions" }} description={<Pill tone={STATUS_TONE[s.status]}>{SUBMISSION_LABELS[s.status]}</Pill>} />
      <Flash ok={sp.ok} err={sp.err} />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <Panel title="Submission">
          <dl className="divide-y divide-gray-100 -my-2">
            {rows.map(([k, v]) => (
              <div key={k} className="grid sm:grid-cols-[10rem_minmax(0,1fr)] gap-2 py-2.5 text-sm">
                <dt className="text-brand-muted">{k}</dt>
                <dd className="text-brand-navy min-w-0">{v}</dd>
              </div>
            ))}
          </dl>
          {s.storagePath && (
            <p className="text-xs text-amber-800 mt-4">Treat submitted files as untrusted: preview opens sandboxed. Check the rights before hosting.</p>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel title="Next step">
            {s.document ? (
              <p className="text-sm">
                Catalogued as{" "}
                <Link href={`/hp-hub/admin/documents/${s.document.id}`} className="font-semibold text-brand-teal">
                  {s.document.title}
                </Link>
                .
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <Link href={`/hp-hub/admin/documents/new?submission=${s.id}`} className={btnPrimary}>
                  Catalogue as a draft document
                </Link>
                <form action={submissionToTracker}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className={`${btnSecondary} w-full`}>Add to Missing Documents tracker</button>
                </form>
              </div>
            )}
          </Panel>

          <Panel title="Review status">
            <form action={updateSubmission} className="space-y-3">
              <input type="hidden" name="id" value={s.id} />
              <select name="status" defaultValue={s.status} className={inputCls} aria-label="Status">
                {Object.entries(SUBMISSION_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <textarea name="reviewNotes" rows={3} defaultValue={s.reviewNotes ?? ""} placeholder="Review notes (internal)" className={textareaCls} aria-label="Review notes" />
              <button className={`${btnSecondary} w-full`}>Save</button>
              {s.reviewedBy && <p className="text-xs text-brand-muted">Last reviewed by {s.reviewedBy.user.name}, {fmtDate(s.reviewedAt)}</p>}
            </form>
          </Panel>

          {(docMatches.length > 0 || trackerMatches.length > 0) && (
            <Panel title="Possible duplicates">
              <ul className="space-y-1.5 text-sm">
                {docMatches.map((d) => (
                  <li key={d.id}>
                    <Link href={`/hp-hub/admin/documents/${d.id}`} className="text-brand-navy hover:text-brand-teal">
                      {d.title}
                    </Link>{" "}
                    <span className="text-xs text-brand-muted">document</span>
                  </li>
                ))}
                {trackerMatches.map((t) => (
                  <li key={t.id}>
                    <Link href={`/hp-hub/admin/tracker/${t.id}`} className="text-brand-navy hover:text-brand-teal">
                      {t.title}
                    </Link>{" "}
                    <span className="text-xs text-brand-muted">tracker</span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
