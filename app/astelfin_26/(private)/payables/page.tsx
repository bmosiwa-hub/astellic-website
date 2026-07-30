import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { markPayablePaid } from "@/lib/recurring-actions";

export const metadata = {
  title: "Accounts Payable | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  UPCOMING: "bg-blue-100 text-blue-700",
  DUE:      "bg-yellow-100 text-yellow-700",
  PAID:     "bg-green-100 text-green-700",
  OVERDUE:  "bg-red-100 text-red-700",
  CANCELLED:"bg-gray-100 text-gray-500",
};

const TABS = ["this_month", "upcoming", "overdue", "all"] as const;
type Tab = typeof TABS[number];

function tabLabel(t: Tab) {
  return { this_month: "This Month", upcoming: "Upcoming", overdue: "Overdue", all: "All" }[t];
}

export default async function AccountsPayablePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "this_month" } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const next3Months = new Date(now);
  next3Months.setMonth(next3Months.getMonth() + 3);

  // Build where clause per tab
  const where: Prisma.AccountPayableWhereInput =
    tab === "this_month"
      ? { dueDate: { gte: monthStart, lte: monthEnd }, status: { not: "CANCELLED" } }
      : tab === "upcoming"
      ? { dueDate: { gt: now, lte: next3Months }, status: { in: ["UPCOMING", "DUE"] } }
      : tab === "overdue"
      ? { dueDate: { lt: now }, status: { in: ["UPCOMING", "DUE", "OVERDUE"] } }
      : { status: { not: "CANCELLED" } };

  const [payables, overdueCnt, thisMonthTotal] = await Promise.all([
    prisma.accountPayable.findMany({
      where,
      orderBy: { dueDate: "asc" },
      include: { recurringExpense: { select: { name: true, frequency: true } } },
    }),
    prisma.accountPayable.count({
      where: { dueDate: { lt: now }, status: { in: ["UPCOMING", "DUE", "OVERDUE"] } },
    }),
    prisma.accountPayable.aggregate({
      where: { dueDate: { gte: monthStart, lte: monthEnd }, status: { not: "CANCELLED" } },
      _sum: { amount: true },
    }),
  ]);

  const unpaidThisMonth = payables
    .filter((p) => tab === "this_month" && p.status !== "PAID")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Accounts Payable</h1>
          <p className="text-gray-500 text-sm mt-1">
            This month total:{" "}
            <span className="font-semibold text-brand-navy">
              {formatCurrency(thisMonthTotal._sum.amount ?? 0)}
            </span>
            {overdueCnt > 0 && (
              <span className="ml-3 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {overdueCnt} overdue
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {role === "CEO" && (
            <Link href="/astelfin_26/recurring" className="text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors">
              Manage Recurring
            </Link>
          )}
          <Link href="/astelfin_26/payables/new" className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            + Add Payable
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/astelfin_26/payables?tab=${t}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t
                ? "border-brand-gold text-brand-navy"
                : "border-transparent text-gray-500 hover:text-brand-navy"
            }`}
          >
            {tabLabel(t as Tab)}
            {t === "overdue" && overdueCnt > 0 && (
              <span className="ml-1.5 bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {overdueCnt}
              </span>
            )}
          </Link>
        ))}
      </div>

      {payables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400 text-sm">
          No payables for this view.
        </div>
      ) : (
        <>
          {tab === "this_month" && unpaidThisMonth > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-3 text-sm text-orange-800 font-medium">
              Outstanding this month: {formatCurrency(unpaidThisMonth)}
            </div>
          )}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Description</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Vendor</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Budget Line</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-600">Due Date</th>
                  <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payables.map((p) => {
                  const isOverdue = p.status !== "PAID" && p.status !== "CANCELLED" && p.dueDate < now;
                  const markPaid = markPayablePaid.bind(null, p.id);
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 ${isOverdue ? "bg-red-50/30" : ""}`}>
                      <td className="px-5 py-3 font-medium text-brand-navy">
                        {p.description}
                        {p.note && <p className="text-xs text-gray-400 font-normal mt-0.5 truncate max-w-xs">{p.note}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{p.vendor ?? "—"}</td>
                      <td className="px-5 py-3 text-gray-500 text-xs">{p.budgetLine ?? "—"}</td>
                      <td className="px-5 py-3">
                        {p.recurringExpense ? (
                          <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                            🔁 Recurring
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                            One-off
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                        {formatCurrency(p.amount, p.currency)}
                      </td>
                      <td className={`px-5 py-3 ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                        {formatDate(p.dueDate)}
                        {isOverdue && " ⚠"}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] ?? "bg-gray-100"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {p.status !== "PAID" && p.status !== "CANCELLED" && (
                          <form action={markPaid} className="flex items-center gap-1">
                            <input
                              name="note"
                              placeholder="Ref…"
                              className="w-24 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-400"
                            />
                            <button
                              type="submit"
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-semibold whitespace-nowrap"
                            >
                              ✓ Paid
                            </button>
                          </form>
                        )}
                        {p.status === "PAID" && p.paidDate && (
                          <span className="text-xs text-gray-400">{formatDate(p.paidDate)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
