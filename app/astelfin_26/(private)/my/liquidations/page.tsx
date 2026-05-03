import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "My Liquidations | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_FM:         "bg-yellow-100 text-yellow-800",
  CHANGES_REQUESTED:  "bg-orange-100 text-orange-800",
  FM_APPROVED:        "bg-green-100 text-green-800",
  FM_REJECTED:        "bg-red-100 text-red-800",
};

export default async function MyLiquidationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const liquidations = await prisma.liquidation.findMany({
    where: { submittedBy: session.user.id! },
    orderBy: { createdAt: "desc" },
    include: {
      submission: { select: { type: true, totalAmount: true, currency: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">My Liquidations</h1>
          <p className="text-gray-500 text-sm mt-1">{liquidations.length} total</p>
        </div>
      </div>

      {liquidations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-16 text-center text-gray-400">
          <p>No liquidations submitted yet.</p>
          <p className="text-sm mt-1">After a request is paid, return here to liquidate the funds.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Activity</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Budget Line</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Received</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Accounted</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Balance</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {liquidations.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(l.liquidationDate)}</td>
                  <td className="px-5 py-3 font-medium text-brand-navy">{l.activity}</td>
                  <td className="px-5 py-3 text-gray-500">{l.budgetLine}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(l.fundsReceived, l.currency)}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(l.fundsAccountedFor, l.currency)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${l.refundRequired > 0 ? "text-orange-600" : l.refundRequired < 0 ? "text-red-600" : "text-green-600"}`}>
                    {l.refundRequired > 0
                      ? `Owe ${formatCurrency(l.refundRequired, l.currency)}`
                      : l.refundRequired < 0
                      ? `Over ${formatCurrency(Math.abs(l.refundRequired), l.currency)}`
                      : "Break even"}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[l.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {l.status.replace("FM_", "").replace("_", " ")}
                    </span>
                    {l.fmNote && (
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{l.fmNote}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
