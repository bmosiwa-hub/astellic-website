import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/finance-utils";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import { redirect } from "next/navigation";
import Link from "next/link";
import { sendTaxReport } from "@/lib/mail";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CORP_TAX_RATE = 0.30;

export const metadata = {
  title: "Tax & Compliance | Astelfin",
  robots: { index: false, follow: false },
};

async function getRecipientEmails() {
  const users = await prisma.user.findMany({
    where:  { role: { in: ["CEO", "FINANCE_MANAGER"] }, active: true },
    select: { email: true },
  });
  return users.map((u) => u.email);
}

async function emailMonthlyReport(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const org = await prisma.organisation.findFirst({ where: { shortCode: "ASTELFIN", active: true } });
  const month = parseInt(formData.get("month") as string);
  const year  = parseInt(formData.get("year")  as string);
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 0, 23, 59, 59);
  const orgFilter = org ? { organisationId: org.id } : {};
  const [payrollData, incomeData, expenseData] = await Promise.all([
    prisma.payroll.aggregate({ _sum: { paye: true }, where: { createdAt: { gte: start, lte: end }, ...orgFilter } }),
    prisma.income.aggregate({ _sum: { amount: true }, where: { receivedDate: { gte: start, lte: end }, ...orgFilter } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { paidDate: { gte: start, lte: end }, ...orgFilter } }),
  ]);
  const paye = payrollData._sum.paye ?? 0;
  const net  = (incomeData._sum.amount ?? 0) - (expenseData._sum.amount ?? 0);
  const cit  = net > 0 ? net * CORP_TAX_RATE : 0;
  const recipients = await getRecipientEmails();
  if (recipients.length > 0) {
    await sendTaxReport({ to: recipients, period: MONTHS[month - 1] + " " + year, periodType: "monthly", paye, wht: 0, corporateTaxEstimate: cit, netBalance: net });
  }
  redirect("/astelfin_26/astelfin/tax?year=" + year + "&success=monthly_sent");
}

async function emailAnnualReport(formData: FormData) {
  "use server";
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const org = await prisma.organisation.findFirst({ where: { shortCode: "ASTELFIN", active: true } });
  const year  = parseInt(formData.get("year") as string);
  const start = new Date(year, 0, 1);
  const end   = new Date(year, 11, 31, 23, 59, 59);
  const orgFilter = org ? { organisationId: org.id } : {};
  const [payrollData, incomeData, expenseData] = await Promise.all([
    prisma.payroll.aggregate({ _sum: { paye: true }, where: { createdAt: { gte: start, lte: end }, ...orgFilter } }),
    prisma.income.aggregate({ _sum: { amount: true }, where: { receivedDate: { gte: start, lte: end }, ...orgFilter } }),
    prisma.expense.aggregate({ _sum: { amount: true }, where: { paidDate: { gte: start, lte: end }, ...orgFilter } }),
  ]);
  const paye = payrollData._sum.paye ?? 0;
  const net  = (incomeData._sum.amount ?? 0) - (expenseData._sum.amount ?? 0);
  const cit  = net > 0 ? net * CORP_TAX_RATE : 0;
  const recipients = await getRecipientEmails();
  if (recipients.length > 0) {
    await sendTaxReport({ to: recipients, period: String(year), periodType: "annual", paye, wht: 0, corporateTaxEstimate: cit, netBalance: net });
  }
  redirect("/astelfin_26/astelfin/tax?year=" + year + "&success=annual_sent");
}

export default async function AstelfinTaxPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; success?: string }>;
}) {
  const { year: yearParam, success } = await searchParams;
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const org = await getAstelfinOrg();

  const now         = new Date();
  const currentYear = now.getFullYear();
  const year        = yearParam ? parseInt(yearParam) : currentYear;
  const yearStart   = new Date(year, 0, 1);
  const yearEnd     = new Date(year, 11, 31, 23, 59, 59);
  const currentMonth = now.getMonth() + 1;

  const orgFilter = org ? { organisationId: org.id } : { organisationId: "none" };

  const [payrollRecords, ytdIncome, ytdExpenses, pendingRemittances, recentRemittances,
         outstandingPAYE, outstandingPension] = await Promise.all([
    prisma.payroll.findMany({
      where:  { createdAt: { gte: yearStart, lte: yearEnd }, ...orgFilter },
      select: { paye: true, pension: true, createdAt: true },
    }),
    prisma.income.aggregate({
      _sum:  { amount: true },
      where: { receivedDate: { gte: yearStart, lte: yearEnd }, ...orgFilter },
    }),
    prisma.expense.aggregate({
      _sum:  { amount: true },
      where: { paidDate: { gte: yearStart, lte: yearEnd }, ...orgFilter },
    }),
    prisma.taxRemittance.findMany({
      where:   { status: "PENDING_CEO", ...orgFilter },
      include: { submittedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.taxRemittance.findMany({
      where:   { createdAt: { gte: yearStart, lte: yearEnd }, ...orgFilter },
      include: { submittedBy: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take:    20,
    }),
    prisma.payroll.aggregate({
      _sum:  { paye: true },
      where: { payeStatus: "OUTSTANDING", paye: { gt: 0 }, ...orgFilter },
    }),
    prisma.payroll.aggregate({
      _sum:  { pension: true },
      where: { pensionStatus: "OUTSTANDING", pension: { gt: 0 }, ...orgFilter },
    }),
  ]);

  const payeByMonth    = Array.from({ length: 12 }, () => 0);
  const pensionByMonth = Array.from({ length: 12 }, () => 0);
  for (const p of payrollRecords) {
    payeByMonth[p.createdAt.getMonth()]    += p.paye;
    pensionByMonth[p.createdAt.getMonth()] += p.pension;
  }

  const totalPAYE    = payeByMonth.reduce((a, b) => a + b, 0);
  const totalPension = pensionByMonth.reduce((a, b) => a + b, 0);
  const netBalance   = (ytdIncome._sum.amount ?? 0) - (ytdExpenses._sum.amount ?? 0);
  const corpTaxEst   = netBalance > 0 ? netBalance * CORP_TAX_RATE : 0;
  const totalTax     = totalPAYE + totalPension + corpTaxEst;

  const outstandingPAYEAmt    = outstandingPAYE._sum.paye ?? 0;
  const outstandingPensionAmt = outstandingPension._sum.pension ?? 0;
  const totalOutstanding      = outstandingPAYEAmt + outstandingPensionAmt;

  return (
    <div className="max-w-5xl space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">Tax & Compliance</h1>
          <p className="text-gray-500 text-sm mt-1">Statutory tax obligations — {year}</p>
        </div>
        <div className="flex gap-3 items-center">
          <form method="GET" className="flex gap-2">
            <select name="year" defaultValue={year}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gold">
              {[currentYear - 2, currentYear - 1, currentYear].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button type="submit" className="border border-gray-200 rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 font-medium">Go</button>
          </form>
          <Link href="/astelfin_26/astelfin/tax/record"
            className="text-sm bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            + Record Remittance
          </Link>
        </div>
      </div>

      {!org && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Astelfin organisation is not configured — tax data cannot be filtered.
        </div>
      )}

      {success === "remittance_submitted" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-sm">
          Remittance submitted for CEO approval.
        </div>
      )}
      {success === "monthly_sent" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Monthly tax report emailed successfully.
        </div>
      )}
      {success === "annual_sent" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          Annual tax report for {year} emailed successfully.
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total PAYE",            value: totalPAYE,    color: "text-orange-600" },
          { label: "Pension Contributions", value: totalPension, color: "text-orange-600" },
          { label: "Est. Corporate Tax (30%)", value: corpTaxEst, color: "text-orange-600" },
          { label: "Total Tax Obligations", value: totalTax,     color: "text-brand-navy" },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{k.label}</p>
            <p className={"text-xl font-bold tabular-nums " + k.color}>{formatCurrency(k.value)}</p>
          </div>
        ))}
      </div>

      {/* Outstanding alert */}
      {totalOutstanding > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-orange-800">{formatCurrency(totalOutstanding)} in Unremitted Taxes</p>
            <p className="text-xs text-orange-700 mt-0.5">
              {[outstandingPAYEAmt > 0 && ("PAYE: " + formatCurrency(outstandingPAYEAmt)),
                outstandingPensionAmt > 0 && ("Pension: " + formatCurrency(outstandingPensionAmt))
              ].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Link href="/astelfin_26/astelfin/tax/record"
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">
            Record Remittance
          </Link>
        </div>
      )}

      {/* Pending approvals */}
      {pendingRemittances.length > 0 && (
        <div className={"rounded-2xl border p-5 " + (role === "CEO" ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-200")}>
          <p className={"text-sm font-bold mb-3 " + (role === "CEO" ? "text-amber-800" : "text-blue-800")}>
            {role === "CEO"
              ? pendingRemittances.length + " Remittance" + (pendingRemittances.length !== 1 ? "s" : "") + " Awaiting Your Approval"
              : pendingRemittances.length + " Remittance" + (pendingRemittances.length !== 1 ? "s" : "") + " Pending CEO Approval"}
          </p>
          <div className="space-y-2">
            {pendingRemittances.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-white border border-amber-100 rounded-xl px-4 py-2.5 text-sm">
                <div>
                  <span className="font-semibold text-brand-navy">{r.taxType}</span>
                  <span className="ml-2 text-gray-500 text-xs">{r.period}</span>
                  <span className="ml-2 text-xs text-gray-400">· by {r.submittedBy.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-orange-700">{formatCurrency(r.amount)}</span>
                  <Link href={"/astelfin_26/astelfin/tax/remittances/" + r.id}
                    className="text-xs font-semibold text-brand-gold hover:underline">
                    {role === "CEO" ? "Review" : "View"} &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-brand-navy text-sm">Monthly Breakdown — {year}</h2>
            <p className="text-xs text-gray-400 mt-0.5">PAYE & Pension from Astelfin payroll runs</p>
          </div>
          <form action={emailAnnualReport}>
            <input type="hidden" name="year" value={year} />
            <button type="submit" className="text-xs bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors">
              Email Annual Report
            </button>
          </form>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Month</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">PAYE</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Pension</th>
              <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Monthly Total</th>
              <th className="px-5 py-2.5 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MONTHS.map((monthLabel, i) => {
              const monthNum = i + 1;
              const paye    = payeByMonth[i];
              const pension = pensionByMonth[i];
              const total   = paye + pension;
              const isFuture = year === currentYear && monthNum > currentMonth;
              const hasData  = total > 0;
              return (
                <tr key={monthLabel} className={"hover:bg-gray-50/50 " + (isFuture ? "opacity-40" : "")}>
                  <td className="px-5 py-3 text-gray-700 font-medium">{monthLabel} {year}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-orange-600">
                    {paye > 0 ? formatCurrency(paye) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums text-orange-600">
                    {pension > 0 ? formatCurrency(pension) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums font-semibold text-brand-navy">
                    {total > 0 ? formatCurrency(total) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {!isFuture && hasData && (
                      <form action={emailMonthlyReport} className="inline">
                        <input type="hidden" name="month" value={monthNum} />
                        <input type="hidden" name="year"  value={year} />
                        <button type="submit" className="text-xs text-brand-gold hover:underline font-semibold">Email</button>
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
              <td className="px-5 py-3 text-right font-bold tabular-nums text-orange-600">{formatCurrency(totalPAYE)}</td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-orange-600">{formatCurrency(totalPension)}</td>
              <td className="px-5 py-3 text-right font-bold tabular-nums text-brand-navy">{formatCurrency(totalPAYE + totalPension)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Remittance history */}
      {recentRemittances.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-brand-navy text-sm">Tax Remittances — {year}</h2>
            <Link href="/astelfin_26/astelfin/tax/record" className="text-xs text-brand-gold font-semibold hover:underline">
              + New Remittance
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Tax Type</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Period</th>
                <th className="text-right px-5 py-2.5 font-semibold text-gray-600">Amount</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-2.5 font-semibold text-gray-600">Submitted by</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentRemittances.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-2.5 font-semibold text-brand-navy">{r.taxType}</td>
                  <td className="px-5 py-2.5 text-gray-600">{r.period}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums font-semibold text-orange-600">{formatCurrency(r.amount)}</td>
                  <td className="px-5 py-2.5">
                    <span className={"text-xs font-semibold px-2 py-0.5 rounded-full " + (
                      r.status === "CEO_APPROVED" ? "bg-green-100 text-green-700" :
                      r.status === "CEO_REJECTED" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {r.status === "CEO_APPROVED" ? "Approved" : r.status === "CEO_REJECTED" ? "Rejected" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-2.5 text-gray-500 text-xs">{r.submittedBy.name}</td>
                  <td className="px-5 py-2.5">
                    <Link href={"/astelfin_26/astelfin/tax/remittances/" + r.id}
                      className="text-xs text-brand-gold font-semibold hover:underline">View &rarr;</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CIT estimate */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
        <h3 className="font-bold text-amber-800 text-sm">Corporate Income Tax Estimate — {year}</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Income</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(ytdIncome._sum.amount ?? 0)}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">YTD Expenses</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(ytdExpenses._sum.amount ?? 0)}</p>
          </div>
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Net Balance</p>
            <p className={"text-xl font-bold " + (netBalance >= 0 ? "text-brand-navy" : "text-red-600")}>{formatCurrency(netBalance)}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-amber-200">
          <div>
            <p className="text-sm text-amber-800 font-semibold">Estimated CIT at 30% of taxable income</p>
            <p className="text-xs text-amber-600 mt-0.5">Actual CIT depends on allowable deductions and MRA assessment.</p>
          </div>
          <p className={"text-2xl font-bold " + (corpTaxEst > 0 ? "text-orange-600" : "text-gray-400")}>{formatCurrency(corpTaxEst)}</p>
        </div>
      </div>
    </div>
  );
}