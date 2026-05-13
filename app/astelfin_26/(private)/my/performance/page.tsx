import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "My Performance | Astelfin",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OBJECTIVES_DRAFT:     { label: "Objectives Draft",      color: "bg-gray-100 text-gray-600" },
  OBJECTIVES_SUBMITTED: { label: "Awaiting Approval",     color: "bg-blue-100 text-blue-700" },
  OBJECTIVES_APPROVED:  { label: "Objectives Approved",   color: "bg-green-100 text-green-700" },
  REVIEWING:            { label: "Self-Review Submitted",  color: "bg-amber-100 text-amber-700" },
  CEO_PENDING:          { label: "Pending CEO Decision",   color: "bg-purple-100 text-purple-700" },
  COMPLETED:            { label: "Completed",              color: "bg-emerald-100 text-emerald-700" },
};

export default async function MyPerformancePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { employeeId: true, name: true },
  });
  if (!user?.employeeId) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">My Performance</h1>
        <p className="text-gray-500 text-sm">
          Your account is not linked to an employee record. Please contact HR.
        </p>
      </div>
    );
  }

  const cycles = await prisma.performanceCycle.findMany({
    where:   { employeeId: user.employeeId },
    orderBy: [{ year: "desc" }, { startDate: "desc" }],
  });

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">My Performance</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track your objectives and review cycles.
          </p>
        </div>
        <Link
          href="/astelfin_26/my/performance/new"
          className="bg-brand-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors"
        >
          + New Cycle
        </Link>
      </div>

      {cycles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-gray-600 font-medium">No performance cycles yet.</p>
          <p className="text-gray-400 text-sm mt-1">Start by creating your first cycle.</p>
          <Link
            href="/astelfin_26/my/performance/new"
            className="inline-block mt-4 bg-brand-gold text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-gold/90 transition-colors"
          >
            Create First Cycle
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {cycles.map((cycle) => {
            const s = STATUS_LABELS[cycle.status] ?? { label: cycle.status, color: "bg-gray-100 text-gray-600" };
            return (
              <Link
                key={cycle.id}
                href={`/astelfin_26/my/performance/${cycle.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 hover:border-brand-gold/40 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors">
                    {cycle.cycleType} {cycle.year}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(cycle.startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {" – "}
                    {new Date(cycle.endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.color}`}>
                    {s.label}
                  </span>
                  <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
