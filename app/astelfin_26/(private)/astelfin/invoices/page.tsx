import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import Link from "next/link";

export const metadata = {
  title: "Astelfin | Invoices & Requests",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_FM:            "bg-yellow-100 text-yellow-800",
  FM_CHANGES_REQUESTED:  "bg-orange-100 text-orange-800",
  PENDING_CEO:           "bg-blue-100 text-blue-800",
  CEO_CHANGES_REQUESTED: "bg-orange-100 text-orange-800",
  APPROVED:              "bg-green-100 text-green-800",
  PAID:                  "bg-emerald-100 text-emerald-800",
  REJECTED:              "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_FM:            "Pending FM",
  FM_CHANGES_REQUESTED:  "Changes Requested",
  PENDING_CEO:           "Pending CEO",
  CEO_CHANGES_REQUESTED: "Changes Requested",
  APPROVED:              "Approved",
  PAID:                  "Paid",
  REJECTED:              "Rejected",
};

const TYPE_LABELS: Record<string, string> = {
  INVOICE: "Invoice",
  REQUEST: "Payment Request",
};

export default async function AstelfinInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const { tab = "pending" } = await searchParams;
  const org = await getAstelfinOrg();

  const pendingStatuses = role === "FINANCE_MANAGER"
    ? ["PENDING_FM"]
    : ["PENDING_CEO", "APPROVED"];

  const [pending, all] = org
    ? await Promise.all([
        prisma.submission.findMany({
          where: { organisationId: org.id, status: { in: pendingStatuses as ("PENDING_FM" | "PENDING_CEO" | "APPROVED")[] }, deletedAt: null },
          orderBy: { createdAt: "asc" },
          include: { submitter: { select: { name: true } }, project: { select: { name: true } } },
        }),
        prisma.submission.findMany({
          where: { organisationId: org.id, deletedAt: null },
          orderBy: { updatedAt: "desc" },
          take: 50,
          include: { submitter: { select: { name: true } }, project: { select: { name: true } } },
        }),
      ])
    : [[], []];

  const list = tab === "pending" ? pending : all;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
          <h1 className="text-3xl font-bold text-brand-navy">Invoices &amp; Requests</h1>
          <p className="text-brand-muted text-sm">Payment requests submitted within Astelfin</p>
        </div>
        <Link
          href="/astelfin_26/astelfin/invoices/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          + New Request
        </Link>
      </div>

      {!org && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          Astelfin organisation is not configured. Contact your system administrator.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "pending", label: `Pending (${pending.length})` },
          { key: "all",     label: `All (${all.length})` },
        ].map((t) => (
          <Link
            key={t.key}
            href={`?tab=${t.key}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-white text-brand-navy shadow-sm" : "text-gray-500 hover:text-brand-navy"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* List */}
      {list.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-10 text-center text-brand-muted text-sm">
          {tab === "pending" ? "No pending requests." : "No submissions yet."}
        </div>
      ) : (
        <div className="space-y-2">
          {(list as { id: string; type: string; status: string; totalAmount: number; currency: string; purpose: string | null; createdAt: Date; submitter: { name: string }; project: { name: string } | null }[]).map((s) => (
            <Link
              key={s.id}
              href={`/astelfin_26/astelfin/invoices/${s.id}`}
              className="group flex items-center justify-between bg-white border border-gray-100 hover:border-brand-gold/40 rounded-xl px-5 py-4 transition-all hover:shadow-sm gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{TYPE_LABELS[s.type] ?? s.type}</span>
                  {s.project && <span className="text-[10px] text-brand-gold font-semibold">· {s.project.name}</span>}
                </div>
                <p className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors truncate">
                  {s.purpose ?? "Payment request"}
                </p>
                <p className="text-xs text-brand-muted mt-0.5">
                  {s.submitter.name} · {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-brand-navy">
                  {s.currency} {s.totalAmount.toLocaleString()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[s.status] ?? "bg-gray-100 text-gray-600"}`}>
                  {STATUS_LABELS[s.status] ?? s.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
