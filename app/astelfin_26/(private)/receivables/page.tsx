import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { markReceivableReceived } from "@/lib/recurring-actions";

export const metadata = {
  title: "Accounts Receivable | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  EXPECTED:  "bg-blue-100 text-blue-700",
  RECEIVED:  "bg-green-100 text-green-700",
  PARTIAL:   "bg-yellow-100 text-yellow-700",
  OVERDUE:   "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const TABS = ["outstanding", "all"] as const;
type Tab = typeof TABS[number];

export default async function AccountsReceivablePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = "outstanding" } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const now = new Date();

  const where: Prisma.AccountReceivableWhereInput =
    tab === "outstanding"
      ? { status: { in: ["EXPECTED", "PARTIAL", "OVERDUE"] } }
      : {};

  const [receivables, overdueCnt, totalOutstanding] = await Promise.all([
    prisma.accountReceivable.findMany({
      where,
      orderBy: { expectedDate: "asc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.accountReceivable.count({
      where: { expectedDate: { lt: now }, status: { in: ["EXPECTED", "PARTIAL"] } },
    }),
    prisma.accountReceivable.aggregate({
      where: { status: { in: ["EXPECTED", "PARTIAL", "OVERDUE"] } },
      _sum: { amount: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Accounts Receivable</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total outstanding:{" "}
            <span className="font-semibold text-brand-navy">
              {formatCurrency(totalOutstanding._sum.amount ?? 0)}
            </span>
            {overdueCnt > 0 && (
              <span className="ml-3 bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {overdueCnt} overdue
              </span>
            )}
          </p>
        </div>
        <Link
          href="/astelfin_26/receivables/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Receivable
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/astelfin_26/receivables?tab=${t}`}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
              tab === t
                ? "border-brand-gold text-brand-navy"
                : "border-transparent text-gray-500 hover:text-brand-navy"
            }`}
          >
            {t === "outstanding" ? (
              <>
                Outstanding
                {overdueCnt > 0 && (
                  <span className="ml-1.5 bg-red-100 text-red-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {overdueCnt}
                  </span>
                )}
              </>
            ) : "All"}
          </Link>
        ))}
      </div>

      {receivables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400 text-sm">
          No receivables for this view.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Payer</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Project</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Expected</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {receivables.map((r) => {
                const isOverdue = ["EXPECTED", "PARTIAL"].includes(r.status) && r.expectedDate < now;
                const markFull    = markReceivableReceived.bind(null, r.id);
                const markPartial = markReceivableReceived.bind(null, r.id);
                return (
                  <tr key={r.id} className={`hover:bg-gray-50 ${isOverdue ? "bg-red-50/30" : ""}`}>
                    <td className="px-5 py-3 font-medium text-brand-navy">
                      {r.description}
                      {r.note && <p className="text-xs text-gray-400 font-normal mt-0.5">{r.note}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{r.payer ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{r.project?.name ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                      {formatCurrency(r.amount, r.currency)}
                    </td>
                    <td className={`px-5 py-3 ${isOverdue ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                      {formatDate(r.expectedDate)}
                      {isOverdue && " ⚠"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status] ?? "bg-gray-100"}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {(r.status === "EXPECTED" || r.status === "PARTIAL" || r.status === "OVERDUE") && (
                        <div className="flex flex-col gap-1">
                          <form action={markFull}>
                            <input type="hidden" name="partial" value="false" />
                            <input name="note" placeholder="Ref…" className="w-24 border border-gray-200 rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-green-400" />
                            <button type="submit" className="w-full text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-semibold">
                              ✓ Received
                            </button>
                          </form>
                          <form action={markPartial}>
                            <input type="hidden" name="partial" value="true" />
                            <button type="submit" className="w-full text-xs border border-yellow-400 text-yellow-700 hover:bg-yellow-50 px-2 py-1 rounded font-semibold">
                              Partial
                            </button>
                          </form>
                        </div>
                      )}
                      {r.status === "RECEIVED" && r.receivedDate && (
                        <span className="text-xs text-gray-400">{formatDate(r.receivedDate)}</span>
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
