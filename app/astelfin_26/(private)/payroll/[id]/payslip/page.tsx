import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/finance-utils";
import { getEffectivePermissions } from "@/lib/permissions";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { PrintButton } from "@/components/finance/PrintButton";

export const metadata = {
  title: "Payslip | Astelfin IMS",
  robots: { index: false, follow: false },
};

export default async function PayslipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") {
    // Read-only access for users granted "View Payroll & Tax Dashboard"
    const dbUser = await prisma.user.findUnique({
      where:  { id: session.user.id! },
      select: { permissions: true },
    });
    const perms = getEffectivePermissions(role, dbUser?.permissions ?? null);
    if (!perms.functions.canViewPayroll && !perms.functions.canProcessPayroll) redirect("/astelfin_26/dashboard");
  }

  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          name: true, position: true, employeeNumber: true,
          departments: true, taxPin: true, currency: true,
          contractType: true, level: true, pensionRate: true,
          payeExempt: true, nssfApplicable: true,
          nssfEmployeeRate: true, nssfEmployerRate: true,
        },
      },
    },
  });

  if (!payroll) notFound();

  const emp       = payroll.employee;
  const isMWK     = payroll.currency === "MWK";
  const grossNative = payroll.grossSalary;
  const netNative   = payroll.netPay;

  // Prefer the exact snapshot captured at run time; fall back to estimating from
  // stored pensions (pension = emp.pensionRate% of grossMWK) for older records.
  const grossMWKest = payroll.grossMWK
    ?? (emp.pensionRate > 0
      ? (payroll.pension / (emp.pensionRate / 100)) || (grossNative)
      : grossNative);

  const totalDeductions =
    payroll.paye + payroll.pension + payroll.nssfEmployee + payroll.otherDeductions;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/astelfin_26/payroll"
          className="text-sm text-brand-gold font-semibold hover:underline">
          ← Back to Payroll
        </Link>
        <PrintButton className="bg-brand-navy text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors" />
      </div>

      {/* Payslip */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm print:shadow-none print:border-0 print:rounded-none">

        {/* Header */}
        <div className="bg-brand-navy text-white px-8 py-6 flex items-start justify-between">
          <div>
            <p className="text-2xl font-bold tracking-tight">ASTELLIC</p>
            <p className="text-brand-gold text-xs uppercase tracking-widest font-semibold mt-0.5">
              Group of Companies
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg">Payslip</p>
            <p className="text-gray-300 text-sm">Period: {payroll.period}</p>
            {payroll.paidDate && (
              <p className="text-gray-400 text-xs mt-0.5">Paid: {formatDate(payroll.paidDate)}</p>
            )}
          </div>
        </div>

        {/* Employee info */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
          <div className="px-8 py-4 space-y-2 border-r border-gray-100">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Employee</h2>
            <Row label="Name"        value={emp.name} />
            {emp.employeeNumber && <Row label="Employee No." value={emp.employeeNumber} />}
            <Row label="Position"    value={emp.position} />
            {emp.level && <Row label="Level"       value={emp.level} />}
            {emp.departments.length > 0 && (
              <Row label="Department" value={emp.departments.join(", ")} />
            )}
            <Row label="Contract"    value={emp.contractType} />
          </div>
          <div className="px-8 py-4 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Tax &amp; Reference</h2>
            {emp.taxPin && <Row label="TPIN"     value={emp.taxPin} />}
            <Row label="Currency" value={payroll.currency} />
            <Row label="Status"   value={payroll.status} />
          </div>
        </div>

        {/* Earnings */}
        <div className="px-8 py-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Earnings</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 font-semibold text-gray-600">Description</th>
                <th className="text-right py-2 font-semibold text-gray-600">Amount ({payroll.currency})</th>
                {!isMWK && <th className="text-right py-2 font-semibold text-gray-600">MWK Equivalent</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr>
                <td className="py-2.5 text-gray-700">Basic Gross Salary</td>
                <td className="py-2.5 text-right font-medium">{formatCurrency(grossNative, payroll.currency)}</td>
                {!isMWK && <td className="py-2.5 text-right text-gray-500 text-xs">{formatCurrency(grossMWKest)}</td>}
              </tr>
              {payroll.otherAdditions > 0 && (
                <tr>
                  <td className="py-2.5 text-gray-700">
                    Other Additions
                    {payroll.additionNote && <span className="text-xs text-gray-400 ml-1">({payroll.additionNote})</span>}
                  </td>
                  <td className="py-2.5 text-right text-green-600 font-medium">+ {formatCurrency(payroll.otherAdditions, payroll.currency)}</td>
                  {!isMWK && <td />}
                </tr>
              )}
              <tr className="bg-gray-50">
                <td className="py-2.5 font-bold text-brand-navy">Total Earnings</td>
                <td className="py-2.5 text-right font-bold text-brand-navy">
                  {formatCurrency(grossNative + payroll.otherAdditions, payroll.currency)}
                </td>
                {!isMWK && <td />}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Deductions */}
        <div className="px-8 py-5 border-t border-gray-100">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Deductions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 font-semibold text-gray-600">Description</th>
                <th className="text-right py-2 font-semibold text-gray-600">Amount (MWK)</th>
                {!isMWK && <th className="text-right py-2 font-semibold text-gray-600">In {payroll.currency}</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {emp.payeExempt ? (
                <tr>
                  <td className="py-2.5 text-amber-700 italic">PAYE</td>
                  <td className="py-2.5 text-right text-amber-600 italic">Exempt</td>
                  {!isMWK && <td />}
                </tr>
              ) : (
                <tr>
                  <td className="py-2.5 text-gray-700">PAYE (Pay As You Earn)</td>
                  <td className="py-2.5 text-right text-red-600">− {formatCurrency(payroll.paye)}</td>
                  {!isMWK && <td className="py-2.5 text-right text-gray-400 text-xs">
                    {/* paye stored in MWK */}
                  </td>}
                </tr>
              )}
              {payroll.pension > 0 && (
                <tr>
                  <td className="py-2.5 text-gray-700">Employee Pension Contribution ({emp.pensionRate}%)</td>
                  <td className="py-2.5 text-right text-red-600">− {formatCurrency(payroll.pension, payroll.currency)}</td>
                  {!isMWK && <td className="py-2.5 text-right text-gray-400 text-xs">{formatCurrency(payroll.exchangeRateUsed ? payroll.pension * payroll.exchangeRateUsed : payroll.pensionEmployer * (emp.pensionRate / 10))}</td>}
                </tr>
              )}
              {payroll.nssfEmployee > 0 && (
                <tr>
                  <td className="py-2.5 text-gray-700">NSSF Employee Contribution ({emp.nssfEmployeeRate}%)</td>
                  <td className="py-2.5 text-right text-red-600">− {formatCurrency(payroll.nssfEmployee, payroll.currency)}</td>
                  {!isMWK && <td />}
                </tr>
              )}
              {payroll.otherDeductions > 0 && (
                <tr>
                  <td className="py-2.5 text-gray-700">
                    Other Deductions
                    {payroll.deductionNote && <span className="text-xs text-gray-400 ml-1">({payroll.deductionNote})</span>}
                  </td>
                  <td className="py-2.5 text-right text-red-600">− {formatCurrency(payroll.otherDeductions, payroll.currency)}</td>
                  {!isMWK && <td />}
                </tr>
              )}
              <tr className="bg-gray-50">
                <td className="py-2.5 font-bold text-gray-700">Total Deductions</td>
                <td className="py-2.5 text-right font-bold text-red-600">
                  − {formatCurrency(totalDeductions, payroll.currency)}
                </td>
                {!isMWK && <td />}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Employer costs (informational) */}
        {payroll.pensionEmployer > 0 && (
          <div className="px-8 py-4 bg-purple-50/50 border-t border-purple-100">
            <p className="text-xs font-bold uppercase tracking-widest text-purple-500 mb-2">Employer Costs (not deducted from pay)</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-700">Employer Pension Contribution (10%)</span>
              <span className="font-semibold text-purple-700">{formatCurrency(payroll.pensionEmployer)}</span>
            </div>
            {payroll.nssfEmployer > 0 && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-purple-700">Employer NSSF Contribution ({emp.nssfEmployerRate}%)</span>
                <span className="font-semibold text-purple-700">{formatCurrency(payroll.nssfEmployer, payroll.currency)}</span>
              </div>
            )}
          </div>
        )}

        {/* Net Pay */}
        <div className="px-8 py-5 bg-brand-navy text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Net Pay</p>
              <p className="text-3xl font-bold tabular-nums">{formatCurrency(netNative, payroll.currency)}</p>
              {!isMWK && (
                <p className="text-gray-400 text-sm mt-1">
                  ≈ {formatCurrency(payroll.paye + payroll.pension + payroll.nssfEmployee)} MWK deducted
                </p>
              )}
            </div>
            <div className="text-right">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                payroll.status === "PAID" ? "bg-green-500/30 text-green-200" : "bg-yellow-500/30 text-yellow-200"
              }`}>
                {payroll.status}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            This payslip was generated by the Astellic Finance Management System.
            For queries contact the Operations Manager.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-400 text-xs shrink-0">{label}</span>
      <span className="text-gray-700 text-right text-xs">{value}</span>
    </div>
  );
}
