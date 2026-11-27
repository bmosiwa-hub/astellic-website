import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { PageHeader, Pill, STATUS_TONE, Table, fmtDate, Flash, btnPrimary, btnSecondary, inputCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { OUTREACH_LABELS, RECIPIENT_LABELS } from "@/lib/hp-hub/constants";

export const metadata = { title: "Acquisition requests" };

type SP = { status?: string; type?: string; due?: string; ok?: string };

export default async function OutreachPage({ searchParams }: { searchParams: Promise<SP> }) {
  await requireHpPage("outreach.manage");
  const sp = await searchParams;
  const now = new Date();
  const where: Prisma.HpOutreachRequestWhereInput = {
    ...(sp.status && sp.status in OUTREACH_LABELS ? { status: sp.status as keyof typeof OUTREACH_LABELS } : {}),
    ...(sp.type && sp.type in RECIPIENT_LABELS ? { recipientType: sp.type as keyof typeof RECIPIENT_LABELS } : {}),
    ...(sp.due === "1" ? { reminderDueAt: { lte: now }, status: { in: ["SENT", "AWAITING_RESPONSE"] } } : {}),
  };
  const [rows, byStatus] = await Promise.all([
    prisma.hpOutreachRequest.findMany({ where, orderBy: { updatedAt: "desc" }, take: 300, include: { item: { select: { id: true, title: true } } } }),
    prisma.hpOutreachRequest.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const remindersDue = await prisma.hpOutreachRequest.count({ where: { reminderDueAt: { lte: now }, status: { in: ["SENT", "AWAITING_RESPONSE"] } } });

  return (
    <div>
      <PageHeader
        title="Acquisition requests"
        description="Systematic requests to ministries, institutions, researchers and partners for documents and permission to host them."
        actions={
          <>
            <Link href="/hp-hub/admin/outreach/templates" className={btnSecondary}>Templates</Link>
            <Link href="/hp-hub/admin/outreach/new" className={btnPrimary}>New request</Link>
          </>
        }
      />
      <Flash ok={sp.ok} />
      <p className="text-sm text-brand-muted mb-4">
        {byStatus.map((b) => `${OUTREACH_LABELS[b.status]}: ${b._count._all}`).join(" · ") || "No requests yet."}
        {remindersDue > 0 && (
          <>
            {" · "}
            <Link href="/hp-hub/admin/outreach?due=1" className="text-red-700 font-semibold">{remindersDue} reminder{remindersDue === 1 ? "" : "s"} due</Link>
          </>
        )}
      </p>
      <form action="/hp-hub/admin/outreach" className="flex flex-wrap gap-3 items-end mb-4">
        <div>
          <label htmlFor="status" className="block text-xs font-semibold text-brand-muted mb-1">Status</label>
          <select id="status" name="status" defaultValue={sp.status ?? ""} className={inputCls}>
            <option value="">All</option>
            {Object.entries(OUTREACH_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="type" className="block text-xs font-semibold text-brand-muted mb-1">Recipient type</label>
          <select id="type" name="type" defaultValue={sp.type ?? ""} className={inputCls}>
            <option value="">All</option>
            {Object.entries(RECIPIENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 h-10 text-sm"><input type="checkbox" name="due" value="1" defaultChecked={sp.due === "1"} /> Reminder due</label>
        <button className={btnSecondary}>Filter</button>
      </form>
      <Table head={["Recipient", "Document", "Status", "Sent", "Reminder", "Outcome"]} empty={!rows.length && <p className="px-4 py-10 text-center text-sm text-brand-muted">No requests.</p>}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 align-top">
            <td className="px-4 py-3">
              <Link href={`/hp-hub/admin/outreach/${r.id}`} className="font-semibold text-brand-navy hover:text-brand-teal">{r.recipientOrg}</Link>
              <p className="text-xs text-brand-muted">{r.recipientName} · {RECIPIENT_LABELS[r.recipientType]}</p>
            </td>
            <td className="px-4 py-3">{r.item ? <Link href={`/hp-hub/admin/tracker/${r.item.id}`} className="hover:text-brand-teal">{r.item.title}</Link> : "General request"}</td>
            <td className="px-4 py-3"><Pill tone={STATUS_TONE[r.status]}>{OUTREACH_LABELS[r.status]}</Pill></td>
            <td className="px-4 py-3 text-xs whitespace-nowrap">{fmtDate(r.sentAt)}</td>
            <td className={`px-4 py-3 text-xs whitespace-nowrap ${r.reminderDueAt && r.reminderDueAt <= now && ["SENT", "AWAITING_RESPONSE"].includes(r.status) ? "text-red-700 font-semibold" : ""}`}>
              {fmtDate(r.reminderDueAt)}{r.remindersSent ? ` (${r.remindersSent} sent)` : ""}
            </td>
            <td className="px-4 py-3 text-xs">{r.outcome ?? "—"}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
