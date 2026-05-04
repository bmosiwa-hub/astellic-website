import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Consultants | Astelfin IMS",
  robots: { index: false, follow: false },
};

export default async function ConsultantsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const isCEO = session.user.role === "CEO";
  const { success } = await searchParams;

  const consultants = await prisma.consultant.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    include: {
      _count:   { select: { payments: true } },
      payments: { select: { grossAmount: true, netAmount: true, withholdingTax: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-navy">Consultants</h1>
        <Link
          href="/astelfin_26/consultants/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Add Consultant
        </Link>
      </div>

      {success === "terminated" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Consultant contract terminated and marked as inactive.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {consultants.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No consultants registered yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Name</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Specialisation</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Total Paid (Net)</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">WHT Withheld</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {consultants.map((c) => {
                const totalNet = c.payments.reduce((s: number, p) => s + p.netAmount, 0);
                const totalWHT = c.payments.reduce((s: number, p) => s + p.withholdingTax, 0);
                return (
                  <tr key={c.id} className={`hover:bg-gray-50 ${!c.active ? "opacity-60" : ""}`}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-brand-navy">{c.name}</p>
                      {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{c.specialisation ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-semibold text-brand-navy">
                      {formatCurrency(totalNet, c.currency)}
                    </td>
                    <td className="px-5 py-3 text-right text-orange-600">
                      {formatCurrency(totalWHT, c.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {c.active && (
                          <Link
                            href={`/astelfin_26/consultants/${c.id}/pay`}
                            className="text-brand-gold hover:underline text-xs font-semibold"
                          >
                            Record Payment
                          </Link>
                        )}
                        {isCEO && c.active && (
                          <Link
                            href={`/astelfin_26/consultants/${c.id}/terminate`}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold"
                          >
                            Terminate
                          </Link>
                        )}
                      </div>
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
