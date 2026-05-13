import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Team Performance | Astelfin",
  robots: { index: false, follow: false },
};

export default async function TeamPerformancePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  // Find what employeeId this user maps to (for supervisor filtering)
  const currentUser = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { employeeId: true, name: true },
  });

  // CEO sees all; others see their subordinates' cycles only
  const whereBase =
    role === "CEO"
      ? {}
      : currentUser?.employeeId
      ? { employee: { supervisorId: currentUser.employeeId } }
      : { id: "__never__" }; // no subordinates

  const pendingObjectives = await prisma.performanceCycle.findMany({
    where:   { ...whereBase, status: "OBJECTIVES_SUBMITTED" },
    include: { employee: { select: { name: true } } },
    orderBy: { updatedAt: "asc" },
  });

  const pendingSupReview = await prisma.performanceCycle.findMany({
    where:   { ...whereBase, status: "REVIEWING" },
    include: {
      employee: { select: { name: true } },
      reviews:  { where: { reviewType: "SELF" }, select: { submittedAt: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  const ceoPending = role === "CEO"
    ? await prisma.performanceCycle.findMany({
        where:   { status: "CEO_PENDING" },
        include: { employee: { select: { name: true } } },
        orderBy: { updatedAt: "asc" },
      })
    : [];

  const recentCompleted = await prisma.performanceCycle.findMany({
    where:   { ...whereBase, status: "COMPLETED" },
    include: { employee: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
    take:    10,
  });

  const totalPending = pendingObjectives.length + pendingSupReview.length + ceoPending.length;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Team Performance</h1>
        <p className="text-gray-500 text-sm mt-1">
          {totalPending > 0
            ? `${totalPending} item${totalPending > 1 ? "s" : ""} require your attention.`
            : "No pending actions."}
        </p>
      </div>

      {/* ── Pending Objective Approvals ──────────────────────────────────── */}
      <Section
        title="Objectives Awaiting Approval"
        count={pendingObjectives.length}
        color="blue"
        empty="No objectives pending approval."
      >
        {pendingObjectives.map((c) => (
          <CycleRow key={c.id} cycle={c} badge="Review Objectives" />
        ))}
      </Section>

      {/* ── Pending Supervisor Reviews ───────────────────────────────────── */}
      <Section
        title="Awaiting Your Supervisor Assessment"
        count={pendingSupReview.length}
        color="amber"
        empty="No pending supervisor assessments."
      >
        {pendingSupReview.map((c) => (
          <CycleRow
            key={c.id}
            cycle={c}
            badge="Complete Assessment"
            sub={
              c.reviews[0]?.submittedAt
                ? `Self-review submitted ${new Date(c.reviews[0].submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
                : undefined
            }
          />
        ))}
      </Section>

      {/* ── CEO Decisions ─────────────────────────────────────────────────── */}
      {role === "CEO" && (
        <Section
          title="Awaiting CEO Decision"
          count={ceoPending.length}
          color="purple"
          empty="No reviews awaiting your decision."
        >
          {ceoPending.map((c) => (
            <CycleRow key={c.id} cycle={c} badge="Make Decision" />
          ))}
        </Section>
      )}

      {/* ── Recent Completed ──────────────────────────────────────────────── */}
      {recentCompleted.length > 0 && (
        <Section
          title="Recently Completed"
          count={recentCompleted.length}
          color="green"
          empty=""
        >
          {recentCompleted.map((c) => (
            <CycleRow key={c.id} cycle={c} badge="View" completed />
          ))}
        </Section>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  count,
  color,
  empty,
  children,
}: {
  title:    string;
  count:    number;
  color:    "blue" | "amber" | "purple" | "green";
  empty:    string;
  children: React.ReactNode;
}) {
  const dotColors = {
    blue:   "bg-blue-500",
    amber:  "bg-amber-500",
    purple: "bg-purple-500",
    green:  "bg-green-500",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dotColors[color]}`} />
        <h2 className="font-bold text-brand-navy text-sm">{title}</h2>
        {count > 0 && (
          <span className="ml-auto text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {count === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-400">{empty}</p>
      ) : (
        <div className="divide-y divide-gray-50">{children}</div>
      )}
    </div>
  );
}

function CycleRow({
  cycle,
  badge,
  sub,
  completed,
}: {
  cycle:     { id: string; employee: { name: string }; cycleType: string; year: number };
  badge:     string;
  sub?:      string;
  completed?: boolean;
}) {
  return (
    <Link
      href={`/astelfin_26/performance/${cycle.id}`}
      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
    >
      <div>
        <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-gold transition-colors">
          {cycle.employee.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {cycle.cycleType} {cycle.year}
          {sub && <> · {sub}</>}
        </p>
      </div>
      <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
        completed
          ? "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
          : "bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold group-hover:text-white"
      }`}>
        {badge} →
      </span>
    </Link>
  );
}
