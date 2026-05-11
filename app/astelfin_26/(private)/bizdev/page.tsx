import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { formatDate } from "@/lib/finance-utils";
import { getEffectivePermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Business Development | Astelfin IMS",
  robots: { index: false, follow: false },
};

const CLASSIFICATION_LABELS: Record<string, string> = {
  CONSULTANCY:    "Consultancy",
  ADVISORY:       "Advisory",
  IMPLEMENTATION: "Implementation",
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  CONSULTANCY:    "bg-blue-100 text-blue-700",
  ADVISORY:       "bg-purple-100 text-purple-700",
  IMPLEMENTATION: "bg-teal-100 text-teal-700",
};

const THEMATIC_LABELS: Record<string, string> = {
  HEALTH_NUTRITION:        "Health & Nutrition Systems",
  GOVERNANCE_PUBLIC_SECTOR:"Governance & Public Sector Reform",
  HUMAN_DEVELOPMENT:       "Human Development & Social Systems",
  CLIMATE_AGRICULTURE:     "Climate, Agriculture & Sustainability",
};

// ── Server Actions ────────────────────────────────────────────────────────────

async function markSubmitted(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { role: true, permissions: true } });
  const perms = getEffectivePermissions(user?.role ?? "", user?.permissions);
  if (!perms.tabs.bizdev || !perms.functions.canSubmitOpportunity) redirect("/astelfin_26/my");

  const id = formData.get("id") as string;
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { name: true } });

  await prisma.opportunity.update({
    where: { id },
    data:  { status: "SUBMITTED", submittedAt: new Date() },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Opportunity",
    entityId: id,
    detail:   `Marked as submitted: ${opp?.name}`,
  });

  redirect("/astelfin_26/bizdev?success=submitted");
}

async function ignoreOpportunity(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { role: true, permissions: true } });
  const perms = getEffectivePermissions(user?.role ?? "", user?.permissions);
  if (!perms.tabs.bizdev) redirect("/astelfin_26/my");

  const id = formData.get("id") as string;
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { name: true } });

  await prisma.opportunity.delete({ where: { id } });

  await auditLog({
    userId:   session.user.id!,
    action:   "DELETE",
    entity:   "Opportunity",
    entityId: id,
    detail:   `Ignored & removed: ${opp?.name}`,
  });

  redirect("/astelfin_26/bizdev");
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function BizDevPage({
  searchParams,
}: {
  searchParams: Promise<{ thematic?: string; success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const dbUser = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { role: true, permissions: true },
  });
  const perms = getEffectivePermissions(dbUser?.role ?? "", dbUser?.permissions);
  if (!perms.tabs.bizdev) redirect("/astelfin_26/my");

  const { thematic, success } = await searchParams;
  const isCEO = session.user.role === "CEO";

  const opportunities = await prisma.opportunity.findMany({
    where: {
      status: "OPEN",
      ...(thematic ? { thematicArea: thematic } : {}),
    },
    orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    include: { creator: { select: { name: true } } },
  });

  const today    = new Date();
  const urgentCount = opportunities.filter(
    (o) => o.deadline && o.deadline <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Business Development</h1>
          <p className="text-gray-500 text-sm mt-1">Track opportunities — Consultancies, Advisory, and Implementation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/astelfin_26/bizdev/submitted"
            className="text-sm font-semibold text-brand-gold hover:underline">
            Submitted Opportunities →
          </Link>
          {(isCEO || perms.functions.canAddOpportunity) && (
            <Link href="/astelfin_26/bizdev/new"
              className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              + Add Opportunity
            </Link>
          )}
        </div>
      </div>

      {/* Alerts */}
      {success === "submitted" && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          Opportunity marked as submitted and moved to Submitted Opportunities.
        </div>
      )}
      {success === "intel_accepted" && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 font-medium">
          ✓ Opportunity accepted from Intelligence Feed and added to the pipeline.
        </div>
      )}
      {urgentCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          ⚠ <strong>{urgentCount}</strong> opportunit{urgentCount > 1 ? "ies have" : "y has"} a deadline within 7 days.
        </div>
      )}

      {/* Thematic filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filter:</span>
        {[{ value: "", label: "All" }, ...Object.entries(THEMATIC_LABELS).map(([v, l]) => ({ value: v, label: l }))].map(
          ({ value, label }) => (
            <Link
              key={value}
              href={value ? `/astelfin_26/bizdev?thematic=${value}` : "/astelfin_26/bizdev"}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                (thematic ?? "") === value
                  ? "bg-brand-navy text-white border-brand-navy"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-navy hover:text-brand-navy"
              }`}
            >
              {label}
            </Link>
          )
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {opportunities.length === 0 ? (
          <p className="text-center py-12 text-gray-400">
            {thematic ? "No open opportunities in this thematic area." : "No open opportunities. Add one to get started."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Opportunity</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Funder / Client</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Thematic Area</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Deadline</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {opportunities.map((opp) => {
                const isUrgent = opp.deadline && opp.deadline <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
                const isOverdue = opp.deadline && opp.deadline < today;
                return (
                  <tr key={opp.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{opp.name}</p>
                      <p className="text-xs text-gray-400">Added by {opp.creator.name}</p>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {opp.link && (
                          <a href={opp.link} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-brand-gold hover:underline">
                            View Link ↗
                          </a>
                        )}
                        {opp.notes && (
                          <details className="inline">
                            <summary className="text-xs text-gray-400 hover:text-brand-navy cursor-pointer list-none inline-flex items-center gap-0.5">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              Notes
                            </summary>
                            <p className="mt-1.5 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 max-w-xs whitespace-pre-wrap">
                              {opp.notes}
                            </p>
                          </details>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CLASSIFICATION_COLORS[opp.classification] ?? "bg-gray-100 text-gray-600"}`}>
                        {CLASSIFICATION_LABELS[opp.classification] ?? opp.classification}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{opp.funder ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {opp.thematicArea ? (THEMATIC_LABELS[opp.thematicArea] ?? opp.thematicArea) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      {opp.deadline ? (
                        <span className={`text-xs font-medium ${isOverdue ? "text-red-600 font-bold" : isUrgent ? "text-orange-600 font-semibold" : "text-gray-600"}`}>
                          {isOverdue ? "⚠ " : ""}{formatDate(opp.deadline)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-2 flex-wrap justify-end">
                        <Link href={`/astelfin_26/bizdev/${opp.id}/edit`}
                          className="text-xs font-semibold text-brand-navy hover:underline">
                          Edit
                        </Link>
                        {perms.functions.canSubmitOpportunity && (
                          <form action={markSubmitted}>
                            <input type="hidden" name="id" value={opp.id} />
                            <button type="submit"
                              className="text-xs font-semibold text-green-600 hover:underline">
                              Submitted
                            </button>
                          </form>
                        )}
                        <form action={ignoreOpportunity}>
                          <input type="hidden" name="id" value={opp.id} />
                          <button type="submit"
                            className="text-xs font-semibold text-gray-400 hover:text-red-500 hover:underline">
                            Ignore
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
