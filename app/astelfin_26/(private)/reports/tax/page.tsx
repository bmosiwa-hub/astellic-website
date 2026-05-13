import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { redirect } from "next/navigation";
import Link from "next/link";
import { sendTaxReport } from "@/lib/mail";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CORP_TAX_RATE = 0.30;

export const metadata = {
  title: "Tax Dashboard | Astelfin IMS",
  robots: { index: false, follow: false },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getRecipientEmails() {
  const users = await prisma.user.findMany({
    where:  { role: { in: ["CEO", "FINANCE_MANAGER"] }, active: true },
    select: { email: true },
  });
  return users.map((u) => u.email);
}

// ── Server actions ────────────────────────────────────────────────────────────

async function emailMonthlyReport(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const month = parseInt(formData.get("month") as string);
  const year  = parseInt(formData.get("year")  as string);

  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);

  const [payrollData, whtData, incomeData, expenseData] = await Promise.all([
    prisma.payroll.aggregate({ _sum: { paye: true }, where: { createdAt: { gte: start, lte: end } } }),
    prisma.consultantPayment.aggregate({ _sum: { withholdingTax: true }, where: { createdAt: { gte: start, lte: end } } }),
    prisma.income.aggregate({ _sum: { amount: true }, where: { receivedDate: { gte: start, lte: end } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { paidDate: { gte: start, lte: end } } }),
  ]);

  const paye = payrollData._sum.paye ?? 0;
  const wht  = whtData._sum.withholdingTax ?? 0;
  const net  = (incomeData._sum.amount ?? 0) - (expenseData._sum.amount ?? 0);
  const cit  = net > 0 ? net * CORP_TAX_RATE : 0;

  const recipients = await getRecipientEmails();
  if (recipients.length > 0) {
    await sendTaxReport({
      to:                   recipients,
      period:               `${MONTHS[month - 1]} ${year}`,
      periodType:           "monthly",
      paye,
      wht,
      corporateTaxEstimate: cit,
      netBalance:           net,
    });
  }

  redirect(`/astelfin_26/reports/tax?year=${year}&success=monthly_sent`);
}

async function emailAnnualReport(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const year = parseInt(formData.get("year") as string);

  const start = new Date(year, 0, 1);
  const end   = new Date(year, 11, 31, 23, 59, 59);

  const [payrollData, whtData, incomeData, expenseData] = await Promise.all([
    prisma.payroll.aggregate({ _sum: { paye: true }, where: { createdAt: { gte: start, lte: end } } }),
    prisma.consultantPayment.aggregate({ _sum: { withholdingTax: true }, where: { createdAt: { gte: start, lte: end } } }),
    prisma.income.aggregate({ _sum: { amount: true }, where: { receivedDate: { gte: start, lte: end } } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { paidDate: { gte: start, lte: end } } }),
  ]);

  const paye = payrollData._sum.paye ?? 0;
  const wht  = whtData._sum.withholdingTax ?? 0;
  const net  = (incomeData._sum.amount ?? 0) - (expenseData._sum.amount ?? 0);
  const cit  = net > 0 ? net * CORP_TAX_RATE : 0;

  const recipients = await getRecipientEmails();
  if (recipients.length > 0) {
    await sendTaxReport({
      to:                   recipients,
      period:               String(year),
      periodType:           "annual",
      paye,
      wht,
      corporateTaxEstimate: cit,
      netBalance:           net,
    });
  }

  redirect(`/astelfin_26/reports/tax?year=${year}&success=annual_sent`);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function TaxDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; success?: string }>;
}) {
  const { year: yearParam, success } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/dashboard");

  const now         = new Date();
  const currentYear = now.getFullYear();
  const year        = yearParam ? parseInt(yearParam) : currentYear;
  const yearStart   = new Date(year, 0, 1);
  const yearEnd     = new Date(year, 11, 31, 23, 59, 59);

  const [payrollRecords, whtRecords, ytdIncome, ytdExpenses] = await Promise.all([
    prisma.payroll.findMany({
      where:  { createdAt: { gte: yearStart, lte: yearEnd } },
      select: { paye: true, createdAt: true },
    }),
    prisma.consultantPayment.findMany({
      where:  { createdAt: { gte: yearStart, lte: yearEnd } },
      select: { withholdingTax: true, createdAt: true },
    }),
    prisma.income.aggregate({
      _sum:  { amount: true },
      where: { receivedDate: { gte: yearStart, lte: yearEnd } },
    }),
    prisma.expense.aggregate({
      _sum:  { amount: true },
      where: { paidDate: { gte: yearStart, lte: yearEnd } },
    }),
  ]);

  // Group by calendar month
  const payeByMonth = Array.from({ length: 12 }, () => 0);
  const whtByMonth  = Array.from({ length: 12 }, () => 0);

  for (const p of payrollRecords) payeByMonth[p.createdAt.getMonth()] += p.paye;
  for (const w of whtRecords)     whtByMonth[w.createdAt.getMonth()]  += w.withholdingTax;

  const totalPAYE   = payeByMonth.reduce((a, b) => a + b, 0);
  const totalWHT    = whtByMonth.reduce((a, b)  => a + b, 0);
  const netBalance  = (ytdIncome._sum.amount ?? 0) - (ytdExpenses._sum.amount ?? 0);
  const corpTaxEst  = netBalance > 0 ? netBalance * CORP_TAX_RATE : 0;
  const totalTax    = totalPAYE + totalWHT + corpTaxEst;
  const currentMonth = now.getMonth() + 1; // 1-indexed

  return (
    <div className="max-w-5xl space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Tax Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Statutory tax obligations aggregated by month — {year}
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <form method="GET" className="flex gap-2">
            <select name="year" defaultValue={year}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gold">
              {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button type="submit"
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 font-medium">
              Go
            </button>
          </form>
          <Link href="/astelfin_26/financial-health"
            className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
            Financial Health
          </Link>
          <Link href="/astelfin_26/reports"
            className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
            Reports
          </Link>
        </div>
      </div>

      {success === "monthly_sent" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Monthly tax report emailed to all CEO and Operations Manager accounts.
        </div>
      )}
      {success === "annual_sent" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Annual tax report for {year} emailed to all CEO and Operations Manager accounts.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <TaxCard label="Total PAYE" value={totalPAYE} color="orange" />
        <TaxCard label="Withholding Tax (WHT)" value={totalWHT} color="orange" />
        <TaxCard label="Est. Corporate Tax (30%)" value={corpTaxEst} color="orange"
          subtitle={`on net ${formatCurrency(netBalance)}`} />
        <TaxCard label="Total Tax Obligations" value={totalTax} color="navy" />
      </div>

      {/* Monthly breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-brand-navy text-sm">Monthly Breakdown — {year}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              PAYE from payroll runs · WHT from consultant payments
            </p>
          </div>
          <form action={emailAnnualReport}>
            <input type="hidden" name="year" value={year} />
            <button type="submit"
              className="text-xs bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors">
              📧 Email Annual Report
            </button>
          </form>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Month</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">PAYE</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">WHT</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Monthly Total</th>
              <th className="px-5 py-2.5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MONTHS.map((monthLabel, i) => {
              const monthNum = i + 1;
              const paye  = payeByMonth[i];
              const wht   = whtByMonth[i];
              const total = paye + wht;
              const isFuture = year === currentYear && monthNum > currentMonth;
              const hasData  = paye > 0 || wht > 0;
              return (
                <tr key={monthLabel}
                  className={`hover:bg-gray-50/50 ${isFuture ? "opacity-40" : ""}`}>
                  <td className="px-5 py-3 text-gray-700 font-medium">
                    {monthLabel} {year}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-orange-600">
                    {paye > 0 ? formatCurrency(paye) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-orange-600">
                    {wht > 0 ? formatCurrency(wht) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-brand-navy">
                    {total > 0 ? formatCurrency(total) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!isFuture && hasData && (
                      <form action={emailMonthlyReport} className="inline">
                        <input type="hidden" name="month" value={monthNum} />
                        <input type="hidden" name="year"  value={year} />
                        <button type="submit"
                          className="text-xs text-brand-gold hover:underline font-semibold whitespace-nowrap">
                          📧 Email
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-gray-200 bg-gray-50">
            <tr>
              <td className="px-5 py-3 font-bold text-brand-navy">Annual Total</td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-orange-600">
                {formatCurrency(totalPAYE)}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-orange-600">
                {formatCurrency(totalWHT)}
              </td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-brand-navy">
                {formatCurrency(totalPAYE + totalWHT)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Corporate income tax estimate */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-amber-800 text-sm">
          Corporate Income Tax Estimate — {year}
        </h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Income</p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(ytdIncome._sum.amount ?? 0)}
            </p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Expenses</p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(ytdExpenses._sum.amount ?? 0)}
            </p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Net Balance</p>
            <p className={`text-xl font-bold ${netBalance >= 0 ? "text-brand-navy" : "text-red-600"}`}>
              {formatCurrency(netBalance)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-amber-200">
          <div>
            <p className="text-sm text-amber-800 font-semibold">
              Estimated CIT at 30% of taxable income
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Actual CIT depends on allowable deductions, tax credits, and MRA assessment.
            </p>
          </div>
          <p className={`text-2xl font-bold ${corpTaxEst > 0 ? "text-orange-600" : "text-gray-400"}`}>
            {formatCurrency(corpTaxEst)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function TaxCard({
  label, value, color, subtitle,
}: {
  label: string; value: number; color: "orange" | "navy"; subtitle?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-xl font-bold tabular-nums ${
        color === "navy" ? "text-brand-navy" : "text-orange-600"
      }`}>
        {formatCurrency(value)}
      </p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}
