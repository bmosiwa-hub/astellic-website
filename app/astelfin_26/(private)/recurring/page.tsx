import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { toggleRecurringExpense } from "@/lib/recurring-actions";

export const metadata = {
  title: "Recurring Expenses | Astellic Finance",
  robots: { index: false, follow: false },
};

const FREQ_LABELS: Record<string, string> = {
  WEEKLY:      "Weekly",
  FORTNIGHTLY: "Fortnightly",
  MONTHLY:     "Monthly",
  QUARTERLY:   "Quarterly",
  SEMI_ANNUAL: "Semi-annual",
  ANNUAL:      "Annual",
};

export default async function RecurringExpensesPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const recurring = await prisma.recurringExpense.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { payables: true } },
      payables: {
        where: { status: "UPCOMING" },
        orderBy: { dueDate: "asc" },
        take: 1,
        select: { dueDate: true },
      },
    },
  });

  const totalMonthly = recurring
    .filter((r) => r.active)
    .reduce((sum, r) => {
      const multiplier: Record<string, number> = {
        WEEKLY: 4.33, FORTNIGHTLY: 2.17, MONTHLY: 1,
        QUARTERLY: 0.33, SEMI_ANNUAL: 0.17, ANNUAL: 0.083,
      };
      return sum + r.amount * (multiplier[r.frequency] ?? 1);
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Recurring Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">
            Estimated monthly commitment:{" "}
            <span className="font-semibold text-brand-navy">{formatCurrency(totalMonthly)}</span>
          </p>
        </div>
        <Link
          href="/astelfin_26/recurring/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Recurring
        </Link>
      </div>

      {recurring.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400 text-sm">
          No recurring expenses set up yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Vendor</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Frequency</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Next Due</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Budget Line</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recurring.map((r) => {
                const nextDue = r.payables[0]?.dueDate;
                const isOverdue = nextDue && nextDue < new Date();
                const deactivate = toggleRecurringExpense.bind(null, r.id, false);
                const activate   = toggleRecurringExpense.bind(null, r.id, true);
                return (
                  <tr key={r.id} className={`hover:bg-gray-50 ${!r.active ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3 font-medium text-brand-navy">
                      {r.name}
                      {r.category && (
                        <span className="ml-2 text-xs text-gray-400">{r.category}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{r.vendor ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {FREQ_LABELS[r.frequency]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                      {formatCurrency(r.amount, r.currency)}
                    </td>
                    <td className={`px-5 py-3 ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                      {nextDue ? formatDate(nextDue) : "—"}
                      {isOverdue && " ⚠"}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{r.budgetLine ?? "—"}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {r.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {r.active ? (
                        <form action={deactivate}>
                          <button type="submit" className="text-xs text-red-500 hover:underline font-medium">
                            Deactivate
                          </button>
                        </form>
                      ) : (
                        <form action={activate}>
                          <button type="submit" className="text-xs text-green-600 hover:underline font-medium">
                            Reactivate
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
