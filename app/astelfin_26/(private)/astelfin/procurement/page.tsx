import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import Link from "next/link";

export const metadata = {
  title: "Astelfin | Procurement",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT:            "bg-gray-100 text-gray-500",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  APPROVED:         "bg-green-100 text-green-700",
  REJECTED:         "bg-red-100 text-red-700",
  COMPLETED:        "bg-blue-100 text-blue-700",
  CANCELLED:        "bg-gray-100 text-gray-400",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT:            "Draft",
  PENDING_APPROVAL: "Pending Approval",
  APPROVED:         "Approved",
  REJECTED:         "Rejected",
  COMPLETED:        "Completed",
  CANCELLED:        "Cancelled",
};

export default async function AstelfinProcurementPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const { status } = await searchParams;
  const org = await getAstelfinOrg();

  const procurements = org
    ? await prisma.procurement.findMany({
        where: {
          organisationId: org.id,
          deletedAt: null,
          ...(status ? { status } : {}),
        },
        orderBy: { createdAt: "desc" },
        include: {
          requester:  { select: { name: true } },
          quotations: { select: { id: true } },
        },
      })
    : [];

  const pendingCount   = procurements.filter((p) => p.status === "PENDING_APPROVAL").length;
  const draftCount     = procurements.filter((p) => p.status === "DRAFT").length;
  const approvedCount  = procurements.filter((p) => p.status === "APPROVED").length;
  const completedCount = procurements.filter((p) => p.status === "COMPLETED").length;

  const statuses = ["PENDING_APPROVAL", "DRAFT", "APPROVED", "COMPLETED", "REJECTED", "CANCELLED"];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
          <h1 className="text-3xl font-bold text-brand-navy">Procurement</h1>
          <p className="text-brand-muted text-sm">Manage Astelfin procurement requests and approvals</p>
        </div>
        <Link
          href="/astelfin_26/astelfin/procurement/new"
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

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pending",   count: pendingCount,   color: "text-amber-600" },
          { label: "Drafts",    count: draftCount,     color: "text-gray-500" },
          { label: "Approved",  count: approvedCount,  color: "text-emerald-600" },
          { label: "Completed", count: completedCount, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl px-4 py-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-brand-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="?"
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${!status ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          All ({procurements.length})
        </Link>
        {statuses.map((s) => {
          const count = procurements.filter((p) => p.status === s).length;
          if (count === 0 && status !== s) return null;
          return (
            <Link
              key={s}
              href={`?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${status === s ? "bg-brand-navy text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {STATUS_LABELS[s]} ({count})
            </Link>
          );
        })}
      </div>

      {/* List */}
      {procurements.length === 0 ? (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-10 text-center text-brand-muted text-sm">
          No procurement requests yet.{" "}
          <Link href="/astelfin_26/astelfin/procurement/new" className="text-brand-gold font-semibold hover:underline">
            Create the first one
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {(procurements as { id: string; title: string; category: string | null; estimatedCost: number; currency: string; status: string; createdAt: Date; requester: { name: string }; quotations: { id: string }[] }[]).map((p) => (
            <Link
              key={p.id}
              href={`/astelfin_26/astelfin/procurement/${p.id}`}
              className="group flex items-center justify-between bg-white border border-gray-100 hover:border-brand-gold/40 rounded-xl px-5 py-4 transition-all hover:shadow-sm gap-4"
            >
              <div className="min-w-0 flex-1">
                {p.category && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{p.category}</p>
                )}
                <p className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors truncate">{p.title}</p>
                <p className="text-xs text-brand-muted mt-0.5">
                  {p.requester.name} · {new Date(p.createdAt).toLocaleDateString()} · {p.quotations.length} quotation{p.quotations.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-brand-navy">
                  {p.currency} {p.estimatedCost.toLocaleString()}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {STATUS_LABELS[p.status] ?? p.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
