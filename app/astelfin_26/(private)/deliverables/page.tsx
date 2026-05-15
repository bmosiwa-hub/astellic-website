import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { requestMilestoneCompletion, approveMilestone, rejectMilestone } from "@/lib/project-actions";

export const metadata = {
  title: "Deliverables | Astelfin IMS",
  robots: { index: false, follow: false },
};

export default async function DeliverablesPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role === "STAFF" || role === "CONSULTANT") redirect("/astelfin_26/my/submissions");

  const canManage = role === "CEO" || role === "PROJECT_MANAGER";

  // Get active projects with their milestones
  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    include: {
      milestones: {
        orderBy: { order: "asc" },
        include: { completer: { select: { name: true } } },
      },
    },
  });

  // For each project, find the current "active" milestone:
  //  - COMPLETION_REQUESTED ones first (need PM action), then
  //  - first PENDING one that follows all APPROVEDs
  type ActiveItem = {
    projectId: string;
    projectName: string;
    client: string;
    milestone: typeof projects[0]["milestones"][0];
    needsApproval: boolean;
    isOverdue: boolean;
  };

  const items: ActiveItem[] = [];
  const now = new Date();

  for (const p of projects) {
    // Any pending approval?
    const requestedMilestones = p.milestones.filter((m) => m.status === "COMPLETION_REQUESTED");
    for (const m of requestedMilestones) {
      items.push({ projectId: p.id, projectName: p.name, client: p.client, milestone: m, needsApproval: true, isOverdue: m.deliveryDate < now });
    }
    // Next PENDING milestone (first one where all prior are APPROVED)
    if (requestedMilestones.length === 0) {
      const nextPending = p.milestones.find((m, i) =>
        m.status === "PENDING" && p.milestones.slice(0, i).every((x) => x.status === "APPROVED")
      );
      if (nextPending) {
        items.push({ projectId: p.id, projectName: p.name, client: p.client, milestone: nextPending, needsApproval: false, isOverdue: nextPending.deliveryDate < now });
      }
    }
  }

  // Sort: overdue first, then by delivery date
  items.sort((a, b) => {
    if (a.needsApproval !== b.needsApproval) return a.needsApproval ? -1 : 1;
    return a.milestone.deliveryDate.getTime() - b.milestone.deliveryDate.getTime();
  });

  const awaitingApproval = items.filter((i) => i.needsApproval).length;
  const overdueCount     = items.filter((i) => i.isOverdue && !i.needsApproval).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Deliverables</h1>
        <p className="text-gray-500 text-sm mt-1">
          Next active milestone per project, ordered by anticipated delivery date.
          {awaitingApproval > 0 && (
            <span className="ml-2 bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {awaitingApproval} awaiting approval
            </span>
          )}
          {overdueCount > 0 && (
            <span className="ml-2 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {overdueCount} overdue
            </span>
          )}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400 text-sm">
          No active deliverables. All projects are either complete or have no milestones.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ projectId, projectName, client, milestone: m, needsApproval, isOverdue }) => {
            const completeAction = requestMilestoneCompletion.bind(null, m.id);
            const approveAction  = approveMilestone.bind(null, m.id);
            const rejectAction   = rejectMilestone.bind(null, m.id);

            return (
              <div key={m.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-5 ${
                  needsApproval ? "border-yellow-300 bg-yellow-50/30" :
                  isOverdue     ? "border-red-200 bg-red-50/20" :
                                  "border-gray-100"
                }`}
              >
                {/* Status dot */}
                <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${
                  needsApproval ? "bg-yellow-400" :
                  isOverdue     ? "bg-red-400" :
                                  "bg-brand-gold"
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <Link href={`/astelfin_26/projects/${projectId}`}
                      className="font-semibold text-brand-navy hover:underline text-sm">
                      {projectName}
                    </Link>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{client}</span>
                    {needsApproval && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-0.5 rounded-full">
                        Awaiting Approval
                      </span>
                    )}
                    {isOverdue && !needsApproval && (
                      <span className="text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full">
                        Overdue
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-800">{m.title}</p>
                  {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Due: <strong className={isOverdue ? "text-red-600" : ""}>{formatDate(m.deliveryDate)}</strong></span>
                    {m.paymentExpected && (
                      <span>Payment: <strong>{formatCurrency(m.paymentExpected, m.currency)}</strong></span>
                    )}
                  </div>

                  {needsApproval && m.completer && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Marked complete by <strong>{m.completer.name}</strong>
                      {m.completedAt && ` on ${formatDate(m.completedAt)}`}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="shrink-0 flex flex-col gap-2 min-w-[140px]">
                  {/* Version control link */}
                  <Link href={`/astelfin_26/deliverables/${m.id}`}
                    className="w-full text-xs text-center border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg">
                    📎 View Submissions
                  </Link>
                  {!needsApproval && !canManage && (
                    <form action={completeAction}>
                      <button type="submit"
                        className="w-full text-sm bg-brand-gold hover:bg-brand-gold/80 text-white px-4 py-2 rounded-lg font-semibold">
                        ✓ Mark Complete
                      </button>
                    </form>
                  )}
                  {needsApproval && canManage && (
                    <>
                      <form action={approveAction}>
                        <button type="submit"
                          className="w-full text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-semibold">
                          ✓ Approve
                        </button>
                      </form>
                      <form action={rejectAction} className="flex gap-1">
                        <input name="note" placeholder="Reason…"
                          className="flex-1 border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-300 min-w-0" />
                        <button type="submit"
                          className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1.5 rounded font-semibold whitespace-nowrap">
                          ✗
                        </button>
                      </form>
                    </>
                  )}
                  {needsApproval && !canManage && (
                    <span className="text-xs text-yellow-600 font-medium text-center">Awaiting PM approval</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
