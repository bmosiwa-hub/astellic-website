import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import Link from "next/link";
import { redirect } from "next/navigation";

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
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const [payrolls, unliquidatedSubs] = await Promise.all([
    prisma.payroll.findMany({
      orderBy: [{ period: "desc" }, { createdAt: "desc" }],
      include: { employee: { select: { name: true, position: true } } },
    }),
    // Paid submissions that have no FM-approved liquidation and belong to an employee
    prisma.submission.findMany({
      where: {
        status: "PAID",
        liquidations: { none: { status: "FM_APPROVED" } },
        submitter: { employeeId: { not: null } },
      },
      include: {
        submitter: { select: { name: true, employeeId: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const totalNetPaid = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((s: number, p) => s + p.netPay, 0);

  const totalPAYE = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((s: number, p) => s + p.paye, 0);

  // Group unliquidated subs by employee name for the banner
  const unliqByEmployee = unliquidatedSubs.reduce<
    Record<string, { name: string; count: number; totalAmount: number }>
  >((acc, sub) => {
    const name = sub.submitter.name ?? "Unknown";
    if (!acc[name]) acc[name] = { name, count: 0, totalAmount: 0 };
    acc[name].count += 1;
    acc[name].totalAmount += sub.totalAmount;
    return acc;
  }, {});

  const flaggedEmployees = Object.values(unliqByEmployee);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Payroll</h1>
          <p className="text-gray-500 text-sm mt-1">
            Total Net Paid:{" "}
            <span className="font-semibold text-brand-navy">{formatCurrency(totalNetPaid)}</span>
            {" · "}
            PAYE:{" "}
            <span className="font-semibold text-orange-600">{formatCurrency(totalPAYE)}</span>
          </p>
        </div>
        <Link
          href="/astelfin_26/payroll/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          + Run Payroll
        </Link>
      </div>

      {/* Unliquidated funds warning banner */}
      {flaggedEmployees.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800 mb-1">
                Outstanding Unliquidated Balances
              </p>
              <p className="text-xs text-orange-700 mb-3">
                The following employees have received funds that have not yet been liquidated.
                Please decide on deductions or allow more time before processing payroll.
              </p>
              <div className="space-y-2">
                {flaggedEmployees.map((emp) => (
                  <div key={emp.name} className="flex items-center justify-between bg-white border border-orange-100 rounded-xl px-4 py-2.5 text-sm">
                    <div>
                      <span className="font-semibold text-brand-navy">{emp.name}</span>
                      <span className="ml-2 text-orange-600 text-xs">
                        {emp.count} unliquidated submission{emp.count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-orange-700">
                        {formatCurrency(emp.totalAmount)}
                      </span>
                      <Link
                        href="/astelfin_26/liquidations"
                        className="text-xs text-brand-gold font-semibold hover:underline"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
