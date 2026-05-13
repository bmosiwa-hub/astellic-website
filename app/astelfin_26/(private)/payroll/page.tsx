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

  const now = new Date();

  const [payrolls, unliquidatedSubs, pendingRefunds] = await Promise.all([
    prisma.payroll.findMany({
      orderBy: [{ period: "desc" }, { createdAt: "desc" }],
      include: { employee: { select: { name: true, position: true } } },
    }),
    // Paid REQUEST submissions where liquidation is overdue (past 14-day deadline)
    prisma.submission.findMany({
      where: {
        status:              "PAID",
        type:                "REQUEST",
        liquidationDeadline: { lt: now },
        liquidations:        { none: { status: "FM_APPROVED" } },
        submitter:           { employeeId: { not: null } },
      },
      include: {
        submitter: { select: { name: true, employeeId: true } },
      },
      orderBy: { liquidationDeadline: "asc" },
    }),
    // CEO-approved overspending refunds not yet on payroll
    prisma.overspendingRefund.findMany({
      where: { status: "CEO_APPROVED" },
    }),
  ]);

  const totalNetPaid = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((s: number, p) => s + p.netPay, 0);

  const totalPAYE = payrolls
    .filter((p) => p.status === "PAID")
    .reduce((s: number, p) => s + p.paye, 0);

  // Group overdue liquidations by employee
  const unliqByEmployee = unliquidatedSubs.reduce<
    Record<string, { name: string; count: number; totalAmount: number; oldestDeadline: Date | null }>
  >((acc, sub) => {
    const name = sub.submitter.name ?? "Unknown";
    if (!acc[name]) acc[name] = { name, count: 0, totalAmount: 0, oldestDeadline: null };
    acc[name].count += 1;
    acc[name].totalAmount += sub.totalAmount;
    if (sub.liquidationDeadline) {
      if (!acc[name].oldestDeadline || sub.liquidationDeadline < acc[name].oldestDeadline!) {
        acc[name].oldestDeadline = sub.liquidationDeadline;
      }
    }
    return acc;
  }, {});

  const flaggedEmployees = Object.values(unliqByEmployee);
  const pendingRefundCount = pendingRefunds.length;

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

      {/* Overdue liquidations banner */}
      {flaggedEmployees.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-orange-800 mb-1">
                Overdue Liquidations — 14-Day Deadline Passed
              </p>
              <p className="text-xs text-orange-700 mb-3">
                The following employees have unliquidated funds where the 14-day liquidation period has expired.
                Deduct from salary in the next payroll run or grant more time.
              </p>
              <div className="space-y-2">
                {flaggedEmployees.map((emp) => (
                  <div key={emp.name} className="flex items-center justify-between bg-white border border-orange-100 rounded-xl px-4 py-2.5 text-sm">
                    <div>
                      <span className="font-semibold text-brand-navy">{emp.name}</span>
                      <span className="ml-2 text-orange-600 text-xs">
                        {emp.count} overdue submission{emp.count !== 1 ? "s" : ""}
                      </span>
                      {emp.oldestDeadline && (
                        <span className="ml-2 text-red-500 text-xs font-semibold">
                          · overdue since {formatDate(emp.oldestDeadline)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-orange-700">{formatCurrency(emp.totalAmount)}</span>
                      <Link href="/astelfin_26/liquidations" className="text-xs text-brand-gold font-semibold hover:underline">
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

      {/* Approved overspending refunds banner */}
      {pendingRefundCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-800 mb-1">
                {pendingRefundCount} CEO-Approved Overspending Refund{pendingRefundCount !== 1 ? "s" : ""} to Add
              </p>
              <p className="text-xs text-blue-700">
                The CEO has approved overspending reimbursements for employees. Add these to the relevant employee payrolls in the next run.
              </p>
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
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Net Pay</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3"></th>
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
                  <td className="px-5 py-3 text-right font-bold text-brand-navy">{formatCurrency(p.netPay, p.currency)}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/astelfin_26/payroll/${p.id}/payslip`}
                      className="text-xs text-brand-gold font-semibold hover:underline whitespace-nowrap">
                      Payslip →
                    </Link>
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
