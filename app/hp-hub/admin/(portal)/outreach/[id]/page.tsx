import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/hp-hub/CopyButton";
import { PageHeader, Panel, Pill, STATUS_TONE, fmtDate, Flash, btnPrimary, btnSecondary, inputCls, textareaCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { updateOutreach } from "@/lib/hp-hub/admin/tracker-actions";
import { OUTREACH_LABELS, PERMISSION_LABELS, RECIPIENT_LABELS } from "@/lib/hp-hub/constants";

export const metadata = { title: "Acquisition request" };

export default async function OutreachDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  await requireHpPage("outreach.manage");
  const { id } = await params;
  const sp = await searchParams;
  const r = await prisma.hpOutreachRequest.findUnique({
    where: { id },
    include: { item: { select: { id: true, title: true } }, createdBy: { include: { user: { select: { name: true } } } } },
  });
  if (!r) notFound();
  const mailto = r.recipientEmail
    ? `mailto:${encodeURIComponent(r.recipientEmail)}?subject=${encodeURIComponent(r.subject)}&body=${encodeURIComponent(r.body.slice(0, 1800))}`
    : null;
  const awaiting = r.status === "SENT" || r.status === "AWAITING_RESPONSE";

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={`${r.recipientOrg}`}
        back={r.item ? { href: `/hp-hub/admin/tracker/${r.item.id}`, label: r.item.title } : { href: "/hp-hub/admin/outreach", label: "Requests" }}
        description={
          <span className="flex flex-wrap gap-2 items-center">
            <Pill tone={STATUS_TONE[r.status]}>{OUTREACH_LABELS[r.status]}</Pill>
            <span>
              {r.recipientName} · {RECIPIENT_LABELS[r.recipientType]}
              {r.recipientEmail ? ` · ${r.recipientEmail}` : ""}
            </span>
          </span>
        }
      />
      <Flash ok={sp.ok} />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <Panel title="Message" actions={<CopyButton text={`${r.subject}\n\n${r.body}`} label="Copy" />}>
          <p className="text-sm font-semibold text-brand-navy mb-3">{r.subject}</p>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{r.body}</p>
          {mailto && (
            <a href={mailto} className={`${btnSecondary} mt-5`}>
              Open in email app
            </a>
          )}
          <p className="text-xs text-brand-muted mt-4">
            Drafted by {r.createdBy?.user.name ?? "—"} on {fmtDate(r.createdAt)}. HP-Hub doesn&rsquo;t send email itself; send it from your own mailbox so replies reach you.
          </p>
        </Panel>

        <div className="space-y-5">
          <Panel title="Timeline">
            <dl className="text-sm space-y-1.5">
              <div className="flex justify-between gap-4"><dt className="text-brand-muted">Sent</dt><dd>{fmtDate(r.sentAt)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-brand-muted">Reminder due</dt><dd>{fmtDate(r.reminderDueAt)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-brand-muted">Reminders sent</dt><dd>{r.remindersSent}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-brand-muted">Response</dt><dd>{fmtDate(r.responseAt)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-brand-muted">Permission</dt><dd>{r.permissionOutcome ? PERMISSION_LABELS[r.permissionOutcome] : "—"}</dd></div>
            </dl>
            {r.responseSummary && <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{r.responseSummary}</p>}
            {r.outcome && <p className="text-sm text-brand-navy font-semibold mt-2">Outcome: {r.outcome}</p>}
          </Panel>

          {r.status === "DRAFT" && (
            <Panel title="Mark as sent">
              <form action={updateOutreach} className="space-y-3">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="intent" value="sent" />
                <label className="block text-xs font-semibold text-brand-muted">Date sent<input name="sentAt" type="date" className={`${inputCls} mt-1`} /></label>
                <label className="block text-xs font-semibold text-brand-muted">Reminder on<input name="reminderDueAt" type="date" className={`${inputCls} mt-1`} /></label>
                <button className={`${btnPrimary} w-full`}>Record as sent</button>
              </form>
            </Panel>
          )}

          {awaiting && (
            <Panel title="Reminder">
              <form action={updateOutreach} className="space-y-3">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="intent" value="reminder" />
                <label className="block text-xs font-semibold text-brand-muted">Next reminder on<input name="reminderDueAt" type="date" className={`${inputCls} mt-1`} /></label>
                <button className={`${btnSecondary} w-full`}>Record reminder sent</button>
              </form>
            </Panel>
          )}

          {r.status !== "DRAFT" && (
            <Panel title="Record response or outcome">
              <form action={updateOutreach} className="space-y-3">
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="intent" value="response" />
                <select name="status" defaultValue={r.status === "AWAITING_RESPONSE" || r.status === "SENT" ? "RESPONDED" : r.status} className={inputCls} aria-label="Status">
                  {(["RESPONDED", "DOCUMENT_RECEIVED", "DECLINED", "NO_RESPONSE"] as const).map((k) => <option key={k} value={k}>{OUTREACH_LABELS[k]}</option>)}
                </select>
                <select name="permissionOutcome" defaultValue={r.permissionOutcome ?? ""} className={inputCls} aria-label="Permission outcome">
                  <option value="">Permission: not discussed</option>
                  {Object.entries(PERMISSION_LABELS).map(([k, v]) => <option key={k} value={k}>Permission: {v}</option>)}
                </select>
                <label className="block text-xs font-semibold text-brand-muted">Response date<input name="responseAt" type="date" className={`${inputCls} mt-1`} /></label>
                <textarea name="responseSummary" rows={3} defaultValue={r.responseSummary ?? ""} placeholder="What did they say?" className={textareaCls} aria-label="Response summary" />
                <input name="outcome" defaultValue={r.outcome ?? ""} placeholder="Outcome, e.g. PDF received; may host with attribution" className={inputCls} aria-label="Outcome" />
                <button className={`${btnPrimary} w-full`}>Save response</button>
              </form>
              {r.item && <p className="text-xs text-brand-muted mt-3">Logged on the <Link href={`/hp-hub/admin/tracker/${r.item.id}`} className="underline">tracker record</Link>.</p>}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
