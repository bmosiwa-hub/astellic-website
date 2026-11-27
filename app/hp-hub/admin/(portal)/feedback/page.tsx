import Link from "next/link";
import { PageHeader, Pill, STATUS_TONE, fmtDate, Flash, btnSecondary, inputCls } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { updateFeedback } from "@/lib/hp-hub/admin/review-actions";
import { FEEDBACK_LABELS } from "@/lib/hp-hub/constants";

export const metadata = { title: "Reports & requests" };

export default async function FeedbackPage({ searchParams }: { searchParams: Promise<{ status?: string; ok?: string }> }) {
  await requireHpPage("feedback.review");
  const sp = await searchParams;
  const status = sp.status === "closed" ? "closed" : "open";
  const items = await prisma.hpFeedback.findMany({
    where: status === "open" ? { status: "OPEN" } : { status: { in: ["RESOLVED", "DISMISSED"] } },
    orderBy: { createdAt: status === "open" ? "asc" : "desc" },
    take: 200,
    include: { document: { select: { id: true, title: true, slug: true } }, resolvedBy: { include: { user: { select: { name: true } } } } },
  });

  return (
    <div className="max-w-5xl">
      <PageHeader title="Reports & requests" description="Corrections, broken links, access requests and takedown requests from document pages. Takedown requests should be handled first." />
      <Flash ok={sp.ok} />
      <nav className="flex gap-4 border-b border-gray-200 mb-5" aria-label="Status">
        {(["open", "closed"] as const).map((k) => (
          <Link key={k} href={`/hp-hub/admin/feedback?status=${k}`} aria-current={k === status ? "page" : undefined}
            className={`pb-2 text-sm border-b-2 -mb-px ${k === status ? "border-brand-gold font-semibold text-brand-navy" : "border-transparent text-brand-muted"}`}>
            {k === "open" ? "Open" : "Closed"}
          </Link>
        ))}
      </nav>
      {items.length === 0 && <p className="text-sm text-brand-muted py-10 text-center">Nothing here.</p>}
      <ul className="space-y-4">
        {items
          .sort((a, b) => (a.type === "TAKEDOWN" ? -1 : 0) - (b.type === "TAKEDOWN" ? -1 : 0))
          .map((f) => (
            <li key={f.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Pill tone={f.type === "TAKEDOWN" ? "red" : f.type === "ACCESS_REQUEST" ? "blue" : "gray"}>{FEEDBACK_LABELS[f.type]}</Pill>
                <Pill tone={STATUS_TONE[f.status]}>{f.status.toLowerCase()}</Pill>
                <span className="text-xs text-brand-muted">{fmtDate(f.createdAt, true)}</span>
              </div>
              {f.document && (
                <p className="text-sm mb-1">
                  <Link href={`/hp-hub/admin/documents/${f.document.id}`} className="font-semibold text-brand-navy hover:text-brand-teal">
                    {f.document.title}
                  </Link>
                </p>
              )}
              <p className="text-sm text-gray-700 whitespace-pre-line">{f.message}</p>
              {(f.name || f.email || f.organisation) && (
                <p className="text-xs text-brand-muted mt-2">{[f.name, f.organisation, f.email].filter(Boolean).join(" · ")}</p>
              )}
              <form action={updateFeedback} className="mt-4 flex flex-wrap gap-2 items-start">
                <input type="hidden" name="id" value={f.id} />
                <input name="resolution" defaultValue={f.resolution ?? ""} placeholder="Resolution note (internal)" className={`${inputCls} flex-1 min-w-56`} aria-label="Resolution note" />
                <select name="status" defaultValue={f.status === "OPEN" ? "RESOLVED" : f.status} className={`${inputCls} w-auto`} aria-label="Status">
                  <option value="RESOLVED">Resolved</option>
                  <option value="DISMISSED">Dismissed</option>
                  <option value="OPEN">Reopen</option>
                </select>
                <button className={btnSecondary}>Save</button>
              </form>
              {f.resolvedBy && <p className="text-xs text-brand-muted mt-2">Closed by {f.resolvedBy.user.name}, {fmtDate(f.resolvedAt)}</p>}
            </li>
          ))}
      </ul>
    </div>
  );
}
