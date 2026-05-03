import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "Consultants | Astellic Finance",
  robots: { index: false, follow: false },
};

export default async function ConsultantsPage() {
  const consultants = await prisma.consultant.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { payments: true } },
      payments: { select: { grossAmount: true, netAmount: true, withholdingTax: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Consultants</h1>
        <Link
          href="/finance/consultants/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Consultant
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {consultants.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No consultants registered yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Specialisation</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Daily Rate</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Total Paid (Net)</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">WHT Withheld</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {consultants.map((c) => {
                const totalNet = c.payments.reduce((s: number, p) => s + p.netAmount, 0);
                const totalWHT = c.payments.reduce((s: number, p) => s + p.withholdingTax, 0);
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{c.name}</p>
                      {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{c.specialisation ?? "—"}</td>
                    <td className="px-5 py-3 text-gray-500">
                      {c.dailyRate ? formatCurrency(c.dailyRate, c.currency) : "—"}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                      {formatCurrency(totalNet, c.currency)}
                    </td>
                    <td className="px-5 py-3 text-right text-orange-600">
                      {formatCurrency(totalWHT, c.currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/finance/consultants/${c.id}/pay`}
                        className="text-brand-gold hover:underline text-xs font-semibold"
                      >
                        Record Payment
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
