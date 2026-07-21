import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import { excludeAstelfinWhere } from "@/lib/astelfin-org";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Financial Health | Astelfin IMS",
  robots: { index: false, follow: false },
};

const CORP_TAX_RATE = 0.30;

export default async function FinancialHealthPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;

  const now       = new Date();
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd   = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

  const activeOrgId = await getActiveOrgId(session);
  const orgFilter   = orgWhere(activeOrgId);
  const astelfinExclude = await excludeAstelfinWhere();

  const [
    activeEmployees,
    debts,
    monthlyRecurring,
    ytdIncome,
    ytdExpenses,
    outstandingReceivables,
    outstandingPayables,
    ytdPayroll,
    ytdWHT,
  ] = await Promise.all([
    // Active employees for salary obligations (org-scoped)
    prisma.employee.findMany({
      where:  { active: true, ...orgFilter, ...astelfinExclude },
      select: { grossSalary: true, currency: true, salaryExchangeRate: true, pensionRate: true },
    }),

    // Active debts (org-scoped)
    prisma.debt.findMany({
      where:  { status: "ACTIVE", ...orgFilter },
      select: { principal: true, currency: true },
    }),

    // Monthly recurring expenses (global — RecurringExpense has no organisationId)
    prisma.recurringExpense.findMany({
      where:  { active: true, frequency: "MONTHLY" },
      select: { amount: true, currency: true },
    }),

    // YTD income (org-scoped)
    prisma.income.aggregate({
      _sum:  { amount: true },
      where: { receivedDate: { gte: yearStart, lte: yearEnd }, ...orgFilter },
    }),

    // YTD expenses (non-payroll, org-scoped)
    prisma.expense.aggregate({
      _sum:  { amount: true },
      where: { paidDate: { gte: yearStart, lte: yearEnd }, ...orgFilter },
    }),

    // Outstanding receivables (global — AccountReceivable has no organisationId)
    prisma.accountReceivable.findMany({
      where:  { status: { in: ["EXPECTED", "PARTIAL"] } },
      select: { amount: true, currency: true },
    }),

    // Outstanding payables (global — AccountPayable has no organisationId)
    prisma.accountPayable.findMany({
      where:  { status: { notIn: ["PAID", "CANCELLED"] } },
      select: { amount: true, currency: true, dueDate: true },
    }),

    // YTD payroll (org-scoped)
    prisma.payroll.aggregate({
      _sum:  { paye: true, grossSalary: true, netPay: true, pensionEmployer: true },
      where: { createdAt: { gte: yearStart, lte: yearEnd }, ...orgFilter },
    }),

    // YTD withholding tax (global — ConsultantPayment has no organisationId)
    prisma.consultantPayment.aggregate({
      _sum:  { withholdingTax: true },
      where: { createdAt: { gte: yearStart, lte: yearEnd } },
    }),
  ]);

  // ── Salary obligations (annual, in MWK) ─────────────────────────
  let annualGrossMWK    = 0;
  let annualEmployerPensionMWK = 0;
  for (const emp of activeEmployees) {
    const rate       = emp.currency === "MWK" ? 1 : (emp.salaryExchangeRate ?? 1);
    const grossMWK   = emp.grossSalary * rate;
    annualGrossMWK  += grossMWK * 12;
    if (emp.pensionRate > 0) {
      annualEmployerPensionMWK += grossMWK * 0.10 * 12; // employer 10%
    }
  }

  // ── Debts (MWK equivalent) ───────────────────────────────────────
  const totalDebtMWK = debts.reduce((s, d) => {
    // Simple: assume MWK for now (most debts are in MWK)
    return s + d.principal;
  }, 0);

  // ── Monthly recurring bills (MWK) ──────────────────────────────
  const monthlyBillsMWK = monthlyRecurring.reduce((s, r) => s + r.amount, 0);
  const annualBillsMWK  = monthlyBillsMWK * 12;

  // ── Net balance ──────────────────────────────────────────────────
  const ytdIncomeAmt   = ytdIncome._sum.amount   ?? 0;
  const ytdExpensesAmt = ytdExpenses._sum.amount  ?? 0;
  const ytdPayrollNet  = ytdPayroll._sum.grossSalary ?? 0; // gross already in native currency
  const netBalance     = ytdIncomeAmt - ytdExpensesAmt;
  const corpTaxEst     = netBalance > 0 ? netBalance * CORP_TAX_RATE : 0;
  const netAfterTax    = netBalance - corpTaxEst;

  // ── Outstanding receivables / payables ──────────────────────────
  const totalReceivablesMWK = outstandingReceivables.reduce((s, r) => s + r.amount, 0);
  const totalPayablesMWK    = outstandingPayables.reduce((s, p) => s + p.amount, 0);
  const overduePayablesMWK  = outstandingPayables
    .filter((p) => p.dueDate < now)
    .reduce((s, p) => s + p.amount, 0);

  // ── Total annual obligations ─────────────────────────────────────
  const totalAnnualObligations = annualGrossMWK + annualEmployerPensionMWK + annualBillsMWK + totalDebtMWK;

  // ── Liquidity ratio ─────────────────────────────────────────────
  const liquidAssets = ytdIncomeAmt + totalReceivablesMWK;
  const healthScore  =
    totalAnnualObligations > 0
      ? Math.min(100, Math.round((liquidAssets / totalAnnualObligations) * 100))
      : 100;

  const healthColor =
    healthScore >= 80 ? "text-green-600" :
    healthScore >= 50 ? "text-amber-600" : "text-red-600";

  const healthBg =
    healthScore >= 80 ? "bg-green-50 border-green-200" :
    healthScore >= 50 ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";

  return (
    <div className="max-w-5xl space-y-7">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Financial Health</h1>
          <p className="text-gray-500 text-sm mt-1">
            Annual obligations vs. current liquidity — as at {now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/astelfin_26/reports/tax"
            className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
            Tax Dashboard
          </Link>
          <Link href="/astelfin_26/reports"
            className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
            Reports
          </Link>
        </div>
      </div>

      {/* Health score */}
      <div className={`rounded-2xl border p-6 ${healthBg}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Liquidity Coverage</p>
            <p className={`text-5xl font-bold tabular-nums ${healthColor}`}>{healthScore}%</p>
            <p className="text-xs text-gray-500 mt-2">
              Liquid assets ({formatCurrency(liquidAssets)}) vs annual obligations ({formatCurrency(totalAnnualObligations)})
            </p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-xs text-gray-500">YTD Net Balance</p>
            <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(netBalance)}
            </p>
            <p className="text-xs text-gray-400">after est. 30% corp. tax: {formatCurrency(netAfterTax)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Annual obligations */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy text-sm">Annual Obligations</h2>
            <p className="text-xs text-gray-400 mt-0.5">Total annual financial commitments</p>
          </div>
          <div className="divide-y divide-gray-50 text-sm">
            <ObRow label={`Gross Salaries (${activeEmployees.length} employees × 12)`}
              value={annualGrossMWK} highlight />
            <ObRow label="Employer Pension Contributions (10% × 12)"
              value={annualEmployerPensionMWK} />
            <ObRow label="Recurring Monthly Bills × 12"
              value={annualBillsMWK} />
            <ObRow label="Outstanding Debt Principal"
              value={totalDebtMWK} />
            <div className="flex items-center justify-between px-5 py-3 bg-brand-navy/5 font-bold text-brand-navy">
              <span>Total Annual Obligations</span>
              <span className="tabular-nums">{formatCurrency(totalAnnualObligations)}</span>
            </div>
          </div>
        </div>

        {/* Current position */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy text-sm">Current Position ({now.getFullYear()} YTD)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Actual income, expenses, and outstanding items</p>
          </div>
          <div className="divide-y divide-gray-50 text-sm">
            <ObRow label="YTD Income" value={ytdIncomeAmt} positive />
            <ObRow label="YTD Non-Payroll Expenses" value={ytdExpensesAmt} negative />
            <ObRow label="Outstanding Receivables" value={totalReceivablesMWK} positive />
            <ObRow label="Outstanding Payables (unpaid)" value={totalPayablesMWK} negative />
            {overduePayablesMWK > 0 && (
              <div className="flex items-center justify-between px-5 py-2 bg-red-50 text-xs text-red-700">
                <span>⚠ Overdue Payables</span>
                <span className="font-bold tabular-nums">{formatCurrency(overduePayablesMWK)}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-5 py-3 bg-brand-navy/5 font-bold text-brand-navy">
              <span>Net Balance (YTD)</span>
              <span className={`tabular-nums ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(netBalance)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-brand-navy text-sm">Tax Obligations (YTD {now.getFullYear()})</h2>
            <p className="text-xs text-gray-400 mt-0.5">Statutory taxes accrued year-to-date</p>
          </div>
          <Link href="/astelfin_26/reports/tax"
            className="text-xs text-brand-gold font-semibold hover:underline">
            Full Tax Dashboard →
          </Link>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100 text-sm">
          <div className="px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">PAYE Deducted</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(ytdPayroll._sum.paye ?? 0)}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">Withholding Tax</p>
            <p className="text-xl font-bold text-orange-600">{formatCurrency(ytdWHT._sum.withholdingTax ?? 0)}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs text-gray-400 mb-1">Est. Corporate Income Tax (30%)</p>
            <p className={`text-xl font-bold ${corpTaxEst > 0 ? "text-orange-600" : "text-gray-400"}`}>
              {formatCurrency(corpTaxEst)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">on net {formatCurrency(netBalance)}</p>
          </div>
        </div>
      </div>

      {/* Employee detail */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100">
          <h2 className="font-bold text-brand-navy text-sm">Payroll Obligations — Active Employees</h2>
        </div>
        <table className="w-full text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-2.5 font-semibold text-gray-500">Employee</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-500">Gross / Month</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-500">Gross MWK / Month</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-500">Employer Pension / Month</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-500">Annual Commitment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activeEmployees.map((emp, i) => {
              const rate    = emp.currency === "MWK" ? 1 : (emp.salaryExchangeRate ?? 1);
              const grossMWK = emp.grossSalary * rate;
              const ePension = emp.pensionRate > 0 ? grossMWK * 0.10 : 0;
              return (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-2">—</td>
                  <td className="px-5 py-2 text-right tabular-nums">{formatCurrency(emp.grossSalary, emp.currency)}</td>
                  <td className="px-5 py-2 text-right tabular-nums">{formatCurrency(grossMWK)}</td>
                  <td className="px-5 py-2 text-right tabular-nums text-purple-600">{formatCurrency(ePension)}</td>
                  <td className="px-5 py-2 text-right tabular-nums font-semibold">{formatCurrency((grossMWK + ePension) * 12)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 bg-gray-50">
            <tr>
              <td className="px-5 py-2.5 font-bold text-brand-navy">{activeEmployees.length} active employees</td>
              <td />
              <td className="px-5 py-2.5 text-right font-bold tabular-nums">{formatCurrency(annualGrossMWK / 12)} / mo</td>
              <td className="px-5 py-2.5 text-right font-bold tabular-nums text-purple-600">{formatCurrency(annualEmployerPensionMWK / 12)} / mo</td>
              <td className="px-5 py-2.5 text-right font-bold tabular-nums">{formatCurrency(annualGrossMWK + annualEmployerPensionMWK)} / yr</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function ObRow({ label, value, positive, negative, highlight }: {
  label: string; value: number; positive?: boolean; negative?: boolean; highlight?: boolean;
}) {
  const color = positive ? "text-green-600" : negative ? "text-red-600" : "text-gray-700";
  return (
    <div className={`flex items-center justify-between px-5 py-3 ${highlight ? "bg-brand-navy/3" : ""}`}>
      <span className="text-gray-600">{label}</span>
      <span className={`font-semibold tabular-nums ${color}`}>
        {positive ? "" : negative ? "− " : ""}{formatCurrency(Math.abs(value))}
      </span>
    </div>
  );
}
