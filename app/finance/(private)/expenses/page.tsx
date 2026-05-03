import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "Expenses | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; category?: string }>;
}) {
  const { project, category } = await searchParams;

  const [expenses, projects] = await Promise.all([
    prisma.expense.findMany({
      where: {
        ...(project ? { projectId: project } : {}),
        ...(category ? { category } : {}),
      },
      orderBy: { paidDate: "desc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const total = expenses.reduce((s: number, r) => s + r.amount, 0);

  const categories = [
    "Travel", "Accommodation", "Meals", "Equipment", "Software",
    "Printing", "Communications", "Subcontracting", "Professional Fees",
    "Office Supplies", "Bank Charges", "Other",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total: <span className="font-semibold text-red-600">{formatCurrency(total)}</span>
          </p>
        </div>
        <Link
          href="/finance/expenses/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Record Expense
        </Link>
      </div>

      {/* Filter */}
      <form method="get" className="flex items-center gap-3 flex-wrap">
        <select
          name="project"
          defaultValue={project ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit" className="bg-brand-navy text-white px-4 py-2 rounded-lg text-sm font-medium">
          Filter
        </button>
        {(project || category) && (
          <Link href="/finance/expenses" className="text-sm text-brand-gold hover:underline">
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {expenses.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No expense records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Category</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Project</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Vendor</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(r.paidDate)}</td>
                  <td className="px-5 py-3 font-medium text-brand-navy">{r.description}</td>
                  <td className="px-5 py-3">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                      {r.category}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{r.project?.name ?? "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{r.vendor ?? "—"}</td>
                  <td className="px-5 py-3 text-right font-semibold text-red-600">
                    {formatCurrency(r.amount, r.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-200 bg-gray-50">
              <tr>
                <td colSpan={5} className="px-5 py-3 font-bold text-brand-navy">Total</td>
                <td className="px-5 py-3 text-right font-bold text-red-600">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
