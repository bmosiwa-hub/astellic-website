import Link from "next/link";
import { notFound } from "next/navigation";
import ActivityForm from "@/components/hp-hub/admin/ActivityForm";
import AcquisitionFields from "@/components/hp-hub/admin/AcquisitionFields";
import { PageHeader, Panel, Pill, STATUS_TONE, fmtDate, Flash, btnPrimary, btnSecondary, inputCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { completeTask, linkAcquisitionDocument, updateAcquisition } from "@/lib/hp-hub/admin/tracker-actions";
import { memberOptions } from "@/lib/hp-hub/admin/members";
import { taxonomyOptions, uploadConfig } from "@/lib/hp-hub/admin/options";
import { ACQUISITION_LABELS, OUTREACH_LABELS } from "@/lib/hp-hub/constants";
import { can } from "@/lib/hp-hub/permissions";

export const metadata = { title: "Tracker record" };

const KIND_LABEL = { NOTE: "Note", OUTREACH: "Outreach", EVIDENCE: "Evidence", STATUS_CHANGE: "Status", TASK: "Task" } as const;

export default async function TrackerItemPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const actor = await requireHpPage("acquisition.edit");
  const { id } = await params;
  const sp = await searchParams;
  const item = await prisma.hpAcquisitionItem.findUnique({
    where: { id },
    include: {
      activities: { orderBy: { createdAt: "desc" }, include: { author: { include: { user: { select: { name: true } } } } } },
      outreach: { orderBy: { createdAt: "desc" } },
      document: { select: { id: true, title: true, slug: true, status: true } },
    },
  });
  if (!item) notFound();
  const [options, members] = await Promise.all([taxonomyOptions(), memberOptions()]);
  const openTasks = item.activities.filter((a) => a.kind === "TASK" && !a.completedAt).sort((a, b) => (a.dueAt?.getTime() ?? 0) - (b.dueAt?.getTime() ?? 0));
  const today = new Date();

  return (
    <div>
      <PageHeader
        title={item.title}
        back={{ href: "/hp-hub/admin/tracker", label: "Tracker" }}
        description={
          <span className="flex flex-wrap gap-2 items-center">
            <Pill tone={STATUS_TONE[item.status]}>{ACQUISITION_LABELS[item.status]}</Pill>
            <span>Updated {fmtDate(item.updatedAt, true)}</span>
          </span>
        }
        actions={
          <>
            {can(actor.role, "outreach.manage") && (
              <Link href={`/hp-hub/admin/outreach/new?itemId=${item.id}`} className={btnSecondary}>
                Request this document
              </Link>
            )}
            {!item.document && (
              <Link href="/hp-hub/admin/documents/new" className={btnPrimary}>
                Catalogue document
              </Link>
            )}
          </>
        }
      />
      <Flash ok={sp.ok} err={sp.err} />

      <div className="grid xl:grid-cols-[minmax(0,1fr)_380px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <Panel title="Record">
            <form action={updateAcquisition} className="space-y-5">
              <input type="hidden" name="id" value={item.id} />
              <AcquisitionFields v={item} countries={options.countries} publishers={options.publishers} types={options.types} members={members} />
              <button className={btnPrimary}>Save changes</button>
            </form>
          </Panel>

          <Panel title="Activity and correspondence">
            <div id="activity" className="scroll-mt-6">
              <ActivityForm itemId={item.id} upload={uploadConfig("evidence")} />
            </div>
            <ol className="mt-6 border-t border-gray-100 divide-y divide-gray-100">
              {item.activities.map((a) => (
                <li key={a.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Pill tone={a.kind === "TASK" ? (a.completedAt ? "green" : "amber") : a.kind === "OUTREACH" ? "blue" : a.kind === "EVIDENCE" ? "teal" : "gray"}>
                      {KIND_LABEL[a.kind]}
                      {a.kind === "TASK" && a.completedAt ? " · done" : ""}
                    </Pill>
                    <span className="text-xs text-brand-muted">
                      {a.author?.user.name ?? "System"} · {fmtDate(a.createdAt, true)}
                      {a.dueAt && ` · due ${fmtDate(a.dueAt)}`}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{a.body}</p>
                  {a.attachmentPath && (
                    <a href={`/api/hp-hub/admin/file?kind=evidence&id=${a.id}`} target="_blank" rel="noopener" className="text-xs font-semibold text-brand-teal">
                      📎 {a.attachmentName}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <div className="space-y-5 xl:sticky xl:top-6">
          <Panel title="Open follow-up tasks">
            {openTasks.length ? (
              <ul className="space-y-3">
                {openTasks.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 text-sm">
                    <div>
                      <p className="text-brand-navy">{t.body}</p>
                      <p className={`text-xs ${t.dueAt && t.dueAt < today ? "text-red-700 font-semibold" : "text-brand-muted"}`}>Due {fmtDate(t.dueAt)}</p>
                    </div>
                    <form action={completeTask}>
                      <input type="hidden" name="id" value={t.id} />
                      <button className="text-xs font-semibold text-brand-teal hover:underline whitespace-nowrap">Mark done</button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-muted">No open tasks.</p>
            )}
          </Panel>

          <Panel title="Repository record">
            {item.document ? (
              <p className="text-sm mb-3">
                <Link href={`/hp-hub/admin/documents/${item.document.id}`} className="font-semibold text-brand-teal">
                  {item.document.title}
                </Link>
              </p>
            ) : (
              <p className="text-sm text-brand-muted mb-3">Not catalogued yet. Once it is, link the record here to mark it acquired.</p>
            )}
            <form action={linkAcquisitionDocument} className="flex gap-2">
              <input type="hidden" name="id" value={item.id} />
              <input name="document" defaultValue={item.document?.slug ?? ""} placeholder="Document slug or ID" className={inputCls} aria-label="Document slug or ID" />
              <button className={btnSecondary}>{item.document ? "Update" : "Link"}</button>
            </form>
          </Panel>

          <Panel title="Acquisition requests" actions={can(actor.role, "outreach.manage") ? <Link href={`/hp-hub/admin/outreach/new?itemId=${item.id}`} className="text-sm font-semibold text-brand-teal">New</Link> : undefined}>
            {item.outreach.length ? (
              <ul className="space-y-2.5">
                {item.outreach.map((o) => (
                  <li key={o.id} className="text-sm">
                    <Link href={`/hp-hub/admin/outreach/${o.id}`} className="font-semibold text-brand-navy hover:text-brand-teal">
                      {o.recipientOrg}
                    </Link>
                    <span className="block text-xs text-brand-muted">
                      {OUTREACH_LABELS[o.status]}
                      {o.sentAt && ` · sent ${fmtDate(o.sentAt)}`}
                      {o.reminderDueAt && ` · reminder ${fmtDate(o.reminderDueAt)}`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-brand-muted">No requests sent yet.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
