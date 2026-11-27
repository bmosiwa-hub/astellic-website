import Link from "next/link";
import { PageHeader, Pill, STATUS_TONE, Table, fmtDate, Flash } from "@/components/hp-hub/admin/ui";
import { prisma } from "@/lib/prisma";
import { requireHpPage } from "@/lib/hp-hub/auth";
import { SUBMISSION_LABELS } from "@/lib/hp-hub/constants";

export const metadata = { title: "Submissions" };

const TABS = [
  { key: "open", label: "To review", where: { status: { in: ["NEW", "IN_REVIEW"] as ("NEW" | "IN_REVIEW")[] } } },
  { key: "closed", label: "Closed", where: { status: { in: ["ACCEPTED", "REJECTED", "DUPLICATE"] as ("ACCEPTED" | "REJECTED" | "DUPLICATE")[] } } },
] as const;

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<{ tab?: string; ok?: string }> }) {
  await requireHpPage("submission.review");
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab) ?? TABS[0];
  const subs = await prisma.hpSubmission.findMany({
    where: tab.where,
    orderBy: { createdAt: tab.key === "open" ? "asc" : "desc" },
    take: 200,
    include: { country: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader title="Public submissions" description="Documents suggested or shared through the public form. Nothing is published until it has been catalogued and reviewed." />
      <Flash ok={sp.ok} />
      <nav className="flex gap-4 border-b border-gray-200 mb-4" aria-label="Submission status">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/hp-hub/admin/submissions?tab=${t.key}`}
            aria-current={t.key === tab.key ? "page" : undefined}
            className={`pb-2 text-sm border-b-2 -mb-px ${t.key === tab.key ? "border-brand-gold font-semibold text-brand-navy" : "border-transparent text-brand-muted"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <Table head={["Title", "Country", "Submitted by", "File", "Received", "Status"]} empty={!subs.length && <p className="px-4 py-10 text-center text-sm text-brand-muted">Nothing here.</p>}>
        {subs.map((s) => (
          <tr key={s.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 min-w-64">
              <Link href={`/hp-hub/admin/submissions/${s.id}`} className="font-semibold text-brand-navy hover:text-brand-teal">
                {s.title}
              </Link>
              <p className="text-xs text-brand-muted">{[s.publisherName, s.year].filter(Boolean).join(" · ")}</p>
            </td>
            <td className="px-4 py-3">{s.country?.name ?? "—"}</td>
            <td className="px-4 py-3">{s.submitterName}</td>
            <td className="px-4 py-3">{s.storagePath ? "Yes" : s.sourceUrl ? "Link" : "—"}</td>
            <td className="px-4 py-3 whitespace-nowrap text-xs text-brand-muted">{fmtDate(s.createdAt)}</td>
            <td className="px-4 py-3">
              <Pill tone={STATUS_TONE[s.status]}>{SUBMISSION_LABELS[s.status]}</Pill>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}
