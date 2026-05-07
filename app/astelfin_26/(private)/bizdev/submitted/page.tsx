import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { formatDate } from "@/lib/finance-utils";
import { getEffectivePermissions } from "@/lib/permissions";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Submitted Opportunities | Astelfin IMS",
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
  ECONOMIC_DEVELOPMENT: "Economic Development",
  GOVERNANCE:           "Governance",
  SOCIAL_DEVELOPMENT:   "Social Development",
  HEALTH:               "Health",
};

// Three months in ms
const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;

// ── Server Actions ────────────────────────────────────────────────────────────

async function markWon(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { role: true, permissions: true } });
  const perms = getEffectivePermissions(dbUser?.role ?? "", dbUser?.permissions);
  if (!perms.tabs.bizdev || !perms.functions.canUpdateBidStatus) redirect("/astelfin_26/my");

  const id   = formData.get("id") as string;
  const opp  = await prisma.opportunity.findUnique({ where: { id } });
  if (!opp) redirect("/astelfin_26/bizdev/submitted");

  await prisma.opportunity.update({ where: { id }, data: { bidStatus: "WON" } });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Opportunity",
    entityId: id,
    detail:   `Bid WON: ${opp.name}`,
  });

  // Redirect to projects/new with opportunity details pre-filled
  const params = new URLSearchParams({
    oppId:      id,
    oppName:    opp.name,
    ...(opp.funder        ? { client:      opp.funder }        : {}),
    ...(opp.thematicArea  ? { thematic:    opp.thematicArea }  : {}),
    ...(opp.classification? { oppType:     opp.classification } : {}),
  });

  redirect(`/astelfin_26/projects/new?${params.toString()}`);
}

async function markRejected(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { role: true, permissions: true } });
  const perms = getEffectivePermissions(dbUser?.role ?? "", dbUser?.permissions);
  if (!perms.tabs.bizdev || !perms.functions.canUpdateBidStatus) redirect("/astelfin_26/my");

  const id  = formData.get("id") as string;
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { name: true } });

  await prisma.opportunity.update({ where: { id }, data: { bidStatus: "REJECTED" } });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Opportunity",
    entityId: id,
    detail:   `Bid REJECTED: ${opp?.name}`,
  });

  redirect("/astelfin_26/bizdev/submitted");
}

async function requestDeletion(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { role: true, permissions: true } });
  const perms = getEffectivePermissions(dbUser?.role ?? "", dbUser?.permissions);
  if (!perms.tabs.bizdev || !perms.functions.canRequestOppDeletion) redirect("/astelfin_26/my");

  const id = formData.get("id") as string;
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { name: true } });

  await prisma.opportunity.update({
    where: { id },
    data:  { deletionRequestedBy: session.user.id, deletionRequestedAt: new Date() },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Opportunity",
    entityId: id,
    detail:   `Deletion requested for no-feedback opportunity: ${opp?.name}`,
  });

  redirect("/astelfin_26/bizdev/submitted");
}

async function approveDeletion(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const id  = formData.get("id") as string;
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { name: true } });

  await auditLog({
    userId:   session.user.id!,
    action:   "DELETE",
    entity:   "Opportunity",
    entityId: id,
    detail:   `Deletion approved by CEO: ${opp?.name}`,
  });

  await prisma.opportunity.delete({ where: { id } });

  redirect("/astelfin_26/bizdev/submitted");
}

async function rejectDeletion(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const id  = formData.get("id") as string;
  const opp = await prisma.opportunity.findUnique({ where: { id }, select: { name: true } });

  await prisma.opportunity.update({
    where: { id },
    data:  { deletionRequestedBy: null, deletionRequestedAt: null },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Opportunity",
    entityId: id,
    detail:   `Deletion request rejected by CEO: ${opp?.name}`,
  });

  redirect("/astelfin_26/bizdev/submitted");
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function SubmittedOpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const dbUser = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { role: true, permissions: true },
  });
  const perms = getEffectivePermissions(dbUser?.role ?? "", dbUser?.permissions);
  if (!perms.tabs.bizdev) redirect("/astelfin_26/my");

  const { tab } = await searchParams;
  const activeTab = tab === "nofeedback" ? "nofeedback" : tab === "closed" ? "closed" : "submitted";
  const isCEO = session.user.role === "CEO";
  const now = new Date();
  const cutoff = new Date(now.getTime() - THREE_MONTHS_MS);

  // All submitted opportunities
  const allSubmitted = await prisma.opportunity.findMany({
    where:   { status: "SUBMITTED" },
    orderBy: { submittedAt: "desc" },
    include: { creator: { select: { name: true } } },
  });

  // Split into sections
  const active      = allSubmitted.filter((o) => !o.bidStatus && o.submittedAt && o.submittedAt > cutoff);
  const noFeedback  = allSubmitted.filter((o) => !o.bidStatus && o.submittedAt && o.submittedAt <= cutoff);
  const closed      = allSubmitted.filter((o) => o.bidStatus && o.bidStatus !== null);

  // Deletion requests (CEO sees these)
  const pendingDeletion = noFeedback.filter((o) => o.deletionRequestedBy && !o.deletionApprovedBy);

  const currentList = activeTab === "nofeedback" ? noFeedback : activeTab === "closed" ? closed : active;

  function OppRow({ opp, showBidActions, showDelete }: {
    opp: typeof allSubmitted[number];
    showBidActions: boolean;
    showDelete: boolean;
  }) {
    const hasPendingDelete = !!opp.deletionRequestedBy;
    return (
      <tr className="hover:bg-gray-50">
        <td className="px-5 py-3">
          <p className="font-medium text-brand-navy">{opp.name}</p>
          <p className="text-xs text-gray-400">
            {opp.creator.name}
            {opp.funder ? ` · ${opp.funder}` : ""}
          </p>
          {opp.link && (
            <a href={opp.link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-brand-gold hover:underline">
              Link ↗
            </a>
          )}
        </td>
        <td className="px-5 py-3">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CLASSIFICATION_COLORS[opp.classification] ?? "bg-gray-100 text-gray-600"}`}>
            {CLASSIFICATION_LABELS[opp.classification] ?? opp.classification}
          </span>
        </td>
        <td className="px-5 py-3 text-gray-600 text-xs">
          {opp.thematicArea ? (THEMATIC_LABELS[opp.thematicArea] ?? opp.thematicArea) : "—"}
        </td>
        <td className="px-5 py-3 text-gray-600 text-xs">
          {opp.submittedAt ? formatDate(opp.submittedAt) : "—"}
        </td>
        <td className="px-5 py-3">
          {opp.bidStatus === "WON" && (
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Won</span>
          )}
          {opp.bidStatus === "REJECTED" && (
            <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Rejected</span>
          )}
          {!opp.bidStatus && hasPendingDelete && (
            <span className="text-xs font-medium text-orange-600">Deletion Pending CEO</span>
          )}
          {!opp.bidStatus && !hasPendingDelete && (
            <span className="text-xs text-gray-400">Awaiting</span>
          )}
        </td>
        <td className="px-5 py-3 text-right">
          <div className="inline-flex items-center gap-2 flex-wrap justify-end">
            {/* Bid status actions */}
            {showBidActions && !opp.bidStatus && (perms.functions.canUpdateBidStatus || isCEO) && (
              <>
                <form action={markWon}>
                  <input type="hidden" name="id" value={opp.id} />
                  <button type="submit" className="text-xs font-semibold text-green-600 hover:underline">Won</button>
                </form>
                <form action={markRejected}>
                  <input type="hidden" name="id" value={opp.id} />
                  <button type="submit" className="text-xs font-semibold text-red-500 hover:underline">Rejected</button>
                </form>
              </>
            )}
            {/* Deletion workflow (no feedback only) */}
            {showDelete && !opp.bidStatus && (
              <>
                {!hasPendingDelete && (perms.functions.canRequestOppDeletion || isCEO) && (
                  <form action={requestDeletion}>
                    <input type="hidden" name="id" value={opp.id} />
                    <button type="submit" className="text-xs font-medium text-gray-400 hover:text-red-500 hover:underline">
                      Request Deletion
                    </button>
                  </form>
                )}
                {hasPendingDelete && isCEO && (
                  <>
                    <form action={approveDeletion}>
                      <input type="hidden" name="id" value={opp.id} />
                      <button type="submit" className="text-xs font-bold text-red-600 hover:underline">Approve Delete</button>
                    </form>
                    <form action={rejectDeletion}>
                      <input type="hidden" name="id" value={opp.id} />
                      <button type="submit" className="text-xs font-medium text-gray-500 hover:underline">Reject</button>
                    </form>
                  </>
                )}
              </>
            )}
            {/* Won: link to project if created */}
            {opp.bidStatus === "WON" && opp.linkedProjectId && (
              <Link href={`/astelfin_26/projects/${opp.linkedProjectId}`}
                className="text-xs font-semibold text-brand-gold hover:underline">
                View Project
              </Link>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/astelfin_26/bizdev"
            className="text-gray-400 hover:text-brand-navy transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-brand-navy">Submitted Opportunities</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track bids and feedback status.</p>
          </div>
        </div>
      </div>

      {/* CEO pending deletion alert */}
      {isCEO && pendingDeletion.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          📋 <strong>{pendingDeletion.length}</strong> no-feedback opportunit{pendingDeletion.length > 1 ? "ies" : "y"} pending deletion approval.{" "}
          <Link href="/astelfin_26/bizdev/submitted?tab=nofeedback" className="underline font-semibold">
            Review →
          </Link>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Submitted (Active)</p>
          <p className="text-2xl font-bold text-brand-navy mt-1">{active.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">No Feedback (&gt;3 months)</p>
          <p className={`text-2xl font-bold mt-1 ${noFeedback.length > 0 ? "text-amber-600" : "text-gray-400"}`}>{noFeedback.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Closed (Won / Rejected)</p>
          <p className="text-2xl font-bold text-gray-600 mt-1">{closed.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: "submitted",  label: `Submitted (${active.length})` },
          { key: "nofeedback", label: `No Feedback (${noFeedback.length})` },
          { key: "closed",     label: `Closed (${closed.length})` },
        ].map(({ key, label }) => (
          <Link
            key={key}
            href={`/astelfin_26/bizdev/submitted?tab=${key}`}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-brand-gold text-brand-navy font-semibold"
                : "border-transparent text-gray-500 hover:text-brand-navy"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* No feedback info banner */}
      {activeTab === "nofeedback" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
          These opportunities were submitted more than 3 months ago with no response. They remain here until
          a deletion request is approved by the CEO.
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {currentList.length === 0 ? (
          <p className="text-center py-12 text-gray-400">
            {activeTab === "submitted"  ? "No recently submitted opportunities." :
             activeTab === "nofeedback" ? "No opportunities without feedback." :
             "No closed opportunities yet."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Opportunity</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Thematic Area</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Submitted</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentList.map((opp) => (
                <OppRow
                  key={opp.id}
                  opp={opp}
                  showBidActions={activeTab !== "closed"}
                  showDelete={activeTab === "nofeedback"}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
