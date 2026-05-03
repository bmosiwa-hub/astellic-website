import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";

export const metadata = {
  title: "Payroll | Astellic Finance",
  robots: { index: false, follow: false },
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  PAID: "bg-green-100 text-green-700",
  PARTIAL: "bg-blue-100 text-blue-700",
};

export default async function PayrollPage() {
  const payrolls = await prisma.payroll.findMany({
    orderBy: [{ period: "desc" }, { createdAt: "desc" }],
    include: { employee: { select: { name: true, position: true } } },
  });

  const totalNetPaid = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((s: number, p) => s + p.netPay, 0);

  const totalPAYE = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((s: number, p) => s + p.paye, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total Net Paid: <span className="font-semibold text-brand-navy">{formatCurrency(totalNetPaid)}</span>
            {" · "}
            PAYE: <span className="font-semibold text-orange-600">{formatCurrency(totalPAYE)}</span>
          </p>
        </div>
        <Link
          href="/astelfin_26/payroll/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Run Payroll
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {payrolls.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No payroll records yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Period</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Employee</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Gross</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">PAYE</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">NSSF</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Net Pay</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payrolls.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-gray-500">{p.period}</td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-brand-navy">{p.employee.name}</p>
                    <p className="text-xs text-gray-400">{p.employee.position}</p>
                  </td>
                  <td className="px-5 py-3 text-right text-gray-700">{formatCurrency(p.grossSalary, p.currency)}</td>
                  <td className="px-5 py-3 text-right text-orange-600">{formatCurrency(p.paye, p.currency)}</td>
                  <td className="px-5 py-3 text-right text-gray-500">{formatCurrency(p.nssfEmployee, p.currency)}</td>
                  <td className="px-5 py-3 text-right font-bold text-brand-navy">{formatCurrency(p.netPay, p.currency)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
