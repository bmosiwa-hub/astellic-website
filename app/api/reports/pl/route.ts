/**
 * GET /api/reports/pl?year=YYYY
 * Returns a CSV file with the P&L breakdown for the given year.
 * CEO and Finance Manager only.
 */

import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { buildRateMap, toMWK } from "@/lib/fx";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmtNum(n: number): string {
  return n.toFixed(2);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const access = await resolveAccess(session);
  if (!access || !access.tab("finance")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const yearParam = req.nextUrl.searchParams.get("year");
  const year      = parseInt(yearParam ?? String(new Date().getFullYear()));
  if (isNaN(year)) return new NextResponse("Bad Request", { status: 400 });

  const yearStart = new Date(year, 0, 1);
  const yearEnd   = new Date(year + 1, 0, 1);

  const exchangeRates = await prisma.exchangeRate.findMany({
    select: { currency: true, middleRate: true, updatedAt: true },
  });
  const rates = buildRateMap(exchangeRates);

  const [incomeRaw, expenseRaw, payrollRaw] = await Promise.all([
    prisma.income.findMany({
      where:  { receivedDate: { gte: yearStart, lt: yearEnd }, deletedAt: null },
      select: { receivedDate: true, amount: true, currency: true },
    }),
    prisma.expense.findMany({
      where:  { paidDate: { gte: yearStart, lt: yearEnd }, deletedAt: null },
      select: { paidDate: true, amount: true, currency: true },
    }),
    prisma.payroll.findMany({
      where:  { period: { startsWith: String(year) + "-" }, deletedAt: null, status: { not: "PENDING" } },
      select: { period: true, netPay: true, currency: true },
    }),
  ]);

  interface MonthRow { income: number; expenses: number; payroll: number; }
  const months: MonthRow[] = Array.from({ length: 12 }, () => ({ income: 0, expenses: 0, payroll: 0 }));

  for (const r of incomeRaw) {
    months[new Date(r.receivedDate).getMonth()].income += toMWK(r.amount, r.currency, rates);
  }
  for (const r of expenseRaw) {
    months[new Date(r.paidDate).getMonth()].expenses += toMWK(r.amount, r.currency, rates);
  }
  for (const r of payrollRaw) {
    const m = parseInt(r.period.split("-")[1], 10) - 1;
    if (m >= 0 && m < 12) months[m].payroll += toMWK(r.netPay, r.currency, rates);
  }

  const rows: string[] = [
    `Astellic Finance — Profit & Loss ${year}`,
    `All values in MWK equivalent (RBM middle rates)`,
    `Generated: ${new Date().toISOString()}`,
    ``,
    `Month,Income (MWK),Payroll (MWK),Other Expenses (MWK),Total Outflow (MWK),Net (MWK)`,
    ...months.map((m, i) => {
      const out = m.expenses + m.payroll;
      const net = m.income - out;
      return `${MONTH_NAMES[i]},${fmtNum(m.income)},${fmtNum(m.payroll)},${fmtNum(m.expenses)},${fmtNum(out)},${fmtNum(net)}`;
    }),
    ``,
    // Totals row
    (() => {
      const ti = months.reduce((s, m) => s + m.income, 0);
      const tp = months.reduce((s, m) => s + m.payroll, 0);
      const te = months.reduce((s, m) => s + m.expenses, 0);
      const to = tp + te;
      return `TOTAL,${fmtNum(ti)},${fmtNum(tp)},${fmtNum(te)},${fmtNum(to)},${fmtNum(ti - to)}`;
    })(),
  ];

  const csv = rows.join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pl-${year}.csv"`,
    },
  });
}
