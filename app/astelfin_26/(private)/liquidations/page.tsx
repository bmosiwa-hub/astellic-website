import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Liquidations | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  PENDING_FM:        "bg-yellow-100 text-yellow-800",
  CHANGES_REQUESTED: "bg-orange-100 text-orange-800",
  FM_APPROVED:       "bg-green-100 text-green-800",
  FM_REJECTED:       "bg-red-100 text-red-800",
};

export default async function LiquidationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/my/liquidations");

  const liquidations = await prisma.liquidation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      submitter: { select: { name: true } },
      submission: { select: { type: true } },
      documents: { select: { docType: true } },
    },
  });

  const pending = liquidations.filter((l) => l.status === "PENDING_FM" || l.status === "CHANGES_REQUESTED");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Liquidations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review expense liquidations submitted by staff and consultants.
          {pending.length > 0 && (
            <span className="ml-2 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {pending.length} pending
            </span>
          )}
        </p>
      </div>

      {liquidations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-12 text-center text-gray-400 text-sm">
          No liquidations submitted yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">From</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Activity</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Budget Line</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Received</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Accounted</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Balance</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Docs</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {liquidations.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(l.liquidationDate)}</td>
                  <td className="px-5 py-3 font-medium text-brand-navy">{l.submitter.name}</td>
                  <td className="px-5 py-3 text-gray-700 max-w-xs truncate">{l.activity}</td>
                  <td className="px-5 py-3 text-gray-500">{l.budgetLine}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(l.fundsReceived, l.currency)}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(l.fundsAccountedFor, l.currency)}</td>
                  <td className={`px-5 py-3 text-right font-semibold ${l.refundRequired > 0 ? "text-orange-600" : l.refundRequired < 0 ? "text-red-600" : "text-green-600"}`}>
                    {l.refundRequired > 0
                      ? `+${formatCurrency(l.refundRequired, l.currency)}`
                      : l.refundRequired < 0
                      ? `−${formatCurrency(Math.abs(l.refundRequired), l.currency)}`
                      : "—"}
                  </td>
                  <td className="px-5 py-3 text-center text-gray-500 text-xs">
                    {l.documents.length} file{l.documents.length !== 1 ? "s" : ""}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[l.status] ?? "bg-gray-100"}`}>
                      {l.status.replace("FM_", "").replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/astelfin_26/liquidations/${l.id}`}
                      className="text-xs text-brand-gold font-semibold hover:underline whitespace-nowrap">
                      Review →
                    </Link>
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
