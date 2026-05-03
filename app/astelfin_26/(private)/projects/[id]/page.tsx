import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { requestMilestoneCompletion, approveMilestone, rejectMilestone } from "@/lib/project-actions";

export const metadata = {
  title: "Project | Astelfin",
  robots: { index: false, follow: false },
};

const MILESTONE_STYLES: Record<string, string> = {
  PENDING:                "bg-gray-100 text-gray-600",
  COMPLETION_REQUESTED:   "bg-yellow-100 text-yellow-700",
  APPROVED:               "bg-green-100 text-green-700",
  REJECTED:               "bg-red-100 text-red-700",
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role === "STAFF" || role === "CONSULTANT") redirect("/astelfin_26/my/submissions");

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      members:    { orderBy: { createdAt: "asc" } },
      milestones: { orderBy: { order: "asc" }, include: { completer: { select: { name: true } }, approver: { select: { name: true } } } },
      income:     { select: { amount: true } },
      expenses:   { select: { amount: true } },
    },
  });
  if (!project) notFound();

  const canManage = role === "CEO" || role === "PROJECT_MANAGER";
  const totalIncome   = project.income.reduce((s, r) => s + r.amount, 0);
  const totalExpenses = project.expenses.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{project.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{project.client}{project.projectLead && ` · Lead: ${project.projectLead}`}</p>
        </div>
        <Link href="/astelfin_26/projects" className="text-sm text-brand-gold hover:underline font-semibold">← Back</Link>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Budget",   val: project.budget ? formatCurrency(project.budget, project.currency) : "—", color: "text-gray-700" },
          { label: "Income",   val: formatCurrency(totalIncome,   project.currency), color: "text-green-600" },
          { label: "Expenses", val: formatCurrency(totalExpenses, project.currency), color: "text-red-600"   },
          { label: "Balance",  val: formatCurrency(totalIncome - totalExpenses, project.currency), color: totalIncome - totalExpenses >= 0 ? "text-brand-navy" : "text-red-600" },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.val}</p>
          </div>
        ))}
      </div>

      {/* Team members */}
      {project.members.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-brand-navy mb-4">Project Team</h2>
          <div className="grid grid-cols-2 gap-3">
            {project.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-brand-navy">{m.name}</p>
                  <p className="text-xs text-gray-500">{m.role}{m.email && ` · ${m.email}`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-brand-navy mb-4">Milestones / Deliverables</h2>
        {project.milestones.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No milestones defined.</p>
        ) : (
          <div className="space-y-3">
            {project.milestones.map((m, idx) => {
              const isNext = m.status === "PENDING" && project.milestones.slice(0, idx).every((x) => x.status === "APPROVED");
              const approveAction = approveMilestone.bind(null, m.id);
              const rejectAction  = rejectMilestone.bind(null, m.id);
              const completeAction = requestMilestoneCompletion.bind(null, m.id);

              return (
                <div key={m.id} className={`rounded-xl border p-4 ${isNext ? "border-brand-gold bg-amber-50/40" : "border-gray-100 bg-gray-50"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                        {isNext && <span className="text-xs font-bold text-brand-gold bg-amber-100 px-2 py-0.5 rounded-full">Next Up</span>}
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MILESTONE_STYLES[m.status]}`}>
                          {m.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="font-semibold text-brand-navy text-sm">{m.title}</p>
                      {m.description && <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Due: <strong>{formatDate(m.deliveryDate)}</strong></span>
                        {m.paymentExpected && (
                          <span>Payment: <strong>{formatCurrency(m.paymentExpected, m.currency)}</strong></span>
                        )}
                      </div>
                      {m.status === "COMPLETION_REQUESTED" && m.completer && (
                        <p className="text-xs text-yellow-700 mt-1">Requested by {m.completer.name} on {m.completedAt ? formatDate(m.completedAt) : "—"}</p>
                      )}
                      {m.status === "APPROVED" && m.approver && (
                        <p className="text-xs text-green-700 mt-1">Approved by {m.approver.name} on {m.approvedAt ? formatDate(m.approvedAt) : "—"}</p>
                      )}
                      {m.status === "REJECTED" && m.rejectionNote && (
                        <p className="text-xs text-red-600 mt-1">Rejected: {m.rejectionNote}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="shrink-0 space-y-2">
                      {/* Staff/all: can mark complete if it's the next pending one */}
                      {isNext && m.status === "PENDING" && !canManage && (
                        <form action={completeAction}>
                          <button type="submit" className="text-xs bg-brand-gold text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-gold/80">
                            ✓ Mark Complete
                          </button>
                        </form>
                      )}
                      {/* PM/CEO approve/reject pending completions */}
                      {m.status === "COMPLETION_REQUESTED" && canManage && (
                        <div className="space-y-1">
                          <form action={approveAction}>
                            <button type="submit" className="w-full text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-semibold">
                              ✓ Approve
                            </button>
                          </form>
                          <form action={rejectAction} className="flex gap-1">
                            <input name="note" placeholder="Reason…" className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
                            <button type="submit" className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded font-semibold">✗</button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
