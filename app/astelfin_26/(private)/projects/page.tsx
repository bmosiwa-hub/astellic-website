import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Projects | Astelfin IMS",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  ON_HOLD:   "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const THEMATIC_LABELS: Record<string, string> = {
  ECONOMIC_DEVELOPMENT: "Economic Development",
  GOVERNANCE:           "Governance",
  SOCIAL_DEVELOPMENT:   "Social Development",
  HEALTH:               "Health",
};

const THEMATIC_COLORS: Record<string, string> = {
  ECONOMIC_DEVELOPMENT: "bg-amber-50 border-amber-200",
  GOVERNANCE:           "bg-blue-50 border-blue-200",
  SOCIAL_DEVELOPMENT:   "bg-purple-50 border-purple-200",
  HEALTH:               "bg-green-50 border-green-200",
};

const THEMATIC_HEADER: Record<string, string> = {
  ECONOMIC_DEVELOPMENT: "text-amber-800",
  GOVERNANCE:           "text-blue-800",
  SOCIAL_DEVELOPMENT:   "text-purple-800",
  HEALTH:               "text-green-800",
};

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  // accessible to FM (financial view), CEO, PM
  if (role === "STAFF" || role === "CONSULTANT") redirect("/astelfin_26/my/submissions");

  const projects = await prisma.project.findMany({
    orderBy: [{ thematicArea: "asc" }, { startDate: "desc" }],
    include: {
      income:     { select: { amount: true } },
      expenses:   { select: { amount: true } },
      milestones: { orderBy: { order: "asc" }, select: { id: true, title: true, status: true, deliveryDate: true } },
      _count: { select: { members: true, milestones: true } },
    },
  });

  // Group by thematic area (null goes to "Unclassified")
  const grouped: Record<string, typeof projects> = {};
  for (const p of projects) {
    const key = p.thematicArea ?? "UNCLASSIFIED";
    (grouped[key] ??= []).push(p);
  }

  const canManage = role === "CEO" || role === "PROJECT_MANAGER";

  // Order: known themes first, then unclassified
  const orderedKeys = [
    "ECONOMIC_DEVELOPMENT", "GOVERNANCE", "SOCIAL_DEVELOPMENT", "HEALTH", "UNCLASSIFIED",
  ].filter((k) => grouped[k]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Projects</h1>
        {canManage && (
          <Link
            href="/astelfin_26/projects/new"
            className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            + New Project
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400 text-sm">
          No projects yet.{canManage && <> <Link href="/astelfin_26/projects/new" className="text-brand-gold hover:underline">Add the first one →</Link></>}
        </div>
      ) : (
        orderedKeys.map((theme) => (
          <div key={theme}>
            {/* Theme header */}
            <div className={`rounded-xl border px-5 py-3 mb-3 ${THEMATIC_COLORS[theme] ?? "bg-gray-50 border-gray-200"}`}>
              <h2 className={`font-bold text-sm uppercase tracking-wide ${THEMATIC_HEADER[theme] ?? "text-gray-600"}`}>
                {THEMATIC_LABELS[theme] ?? "Unclassified"}
                <span className="ml-2 font-normal normal-case text-xs opacity-60">
                  {grouped[theme].length} project{grouped[theme].length !== 1 ? "s" : ""}
                </span>
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Project</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Lead</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Start</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">End</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600">Budget</th>
                    <th className="text-center px-5 py-3 font-semibold text-gray-600">Milestones</th>
                    <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {grouped[theme].map((p) => {
                    const nextMilestone = p.milestones.find((m) => m.status === "PENDING" || m.status === "COMPLETION_REQUESTED");
                    const completedCount = p.milestones.filter((m) => m.status === "APPROVED").length;
                    return (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <p className="font-semibold text-brand-navy">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.client}</p>
                        </td>
                        <td className="px-5 py-3">
                          {p.projectType ? (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.projectType === "PUBLIC" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                              {p.projectType}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-3 text-gray-600 text-xs">{p.projectLead ?? "—"}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(p.startDate)}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{p.endDate ? formatDate(p.endDate) : "Ongoing"}</td>
                        <td className="px-5 py-3 text-right text-gray-700">
                          {p.budget ? formatCurrency(p.budget, p.currency) : "—"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          {p._count.milestones > 0 ? (
                            <span className="text-xs text-gray-600">
                              {completedCount}/{p._count.milestones} done
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                            {p.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <Link href={`/astelfin_26/projects/${p.id}`}
                            className="text-xs text-brand-gold font-semibold hover:underline whitespace-nowrap">
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
