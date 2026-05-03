import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "Projects | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  ON_HOLD: "bg-yellow-100 text-yellow-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  const projects = await prisma.project.findMany({
    where: status ? { status: status as "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED" } : undefined,
    orderBy: { startDate: "desc" },
    include: {
      _count: { select: { income: true, expenses: true } },
      income: { select: { amount: true } },
      expenses: { select: { amount: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Projects</h1>
        <Link
          href="/finance/projects/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Project
        </Link>
      </div>

      {/* Filter */}
      <form method="get" className="flex items-center gap-3">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button type="submit" className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium">
          Filter
        </button>
        {status && (
          <Link href="/finance/projects" className="text-sm text-brand-gold hover:underline">
            Clear
          </Link>
        )}
      </form>

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
            No projects found.
          </div>
        ) : (
          projects.map((p) => {
            const totalIncome = p.income.reduce((s: number, r) => s + r.amount, 0);
            const totalExpenses = p.expenses.reduce((s: number, r) => s + r.amount, 0);
            const balance = totalIncome - totalExpenses;
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-brand-navy text-base">{p.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                        {p.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{p.client}</p>
                    {p.description && (
                      <p className="text-sm text-gray-400 mt-1">{p.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {formatDate(p.startDate)}
                      {p.endDate ? ` → ${formatDate(p.endDate)}` : " → ongoing"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {p.budget && (
                      <p className="text-xs text-gray-400 mb-1">
                        Budget: {formatCurrency(p.budget, p.currency)}
                      </p>
                    )}
                    <p className="text-xs text-green-600">
                      In: {formatCurrency(totalIncome, p.currency)}
                    </p>
                    <p className="text-xs text-red-600">
                      Out: {formatCurrency(totalExpenses, p.currency)}
                    </p>
                    <p className={`text-sm font-bold mt-1 ${balance >= 0 ? "text-brand-navy" : "text-red-600"}`}>
                      {formatCurrency(balance, p.currency)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
