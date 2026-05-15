/**
 * Excel export API — GET /api/reports/export?type=payroll|employees|pl|budget&...
 * Uses SheetJS (xlsx ^0.18) which is already installed.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getActiveOrgId, orgWhere } from "@/lib/org";
import * as XLSX from "xlsx";

function toWb(sheets: Record<string, unknown[][]>): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  for (const [name, data] of Object.entries(sheets)) {
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  }
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function fmt(n: number) { return Number(n.toFixed(2)); }

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sp   = req.nextUrl.searchParams;
  const type = sp.get("type") ?? "pl";
  const year = parseInt(sp.get("year") ?? new Date().getFullYear().toString());
  const orgId = await getActiveOrgId(session);

  let buf: ArrayBuffer;
  let filename: string;

  if (type === "employees") {
    const employees = await prisma.employee.findMany({
      where: { ...orgWhere(orgId) },
      orderBy: { name: "asc" },
      include: { organisation: { select: { name: true } } },
    });
    const data: unknown[][] = [
      ["#", "Name", "Position", "Level", "Contract Type", "Gross Salary", "Currency", "Start Date", "Active", "Entity"],
      ...employees.map((e, i) => [
        i + 1, e.name, e.position, e.level ?? "", e.contractType,
        fmt(e.grossSalary), e.currency,
        e.startDate.toISOString().split("T")[0],
        e.active ? "Yes" : "No",
        e.organisation?.name ?? "—",
      ]),
    ];
    buf = toWb({ Employees: data });
    filename = `employees-${new Date().toISOString().split("T")[0]}.xlsx`;
  }

  else if (type === "payroll") {
    const period = sp.get("period"); // optional YYYY-MM filter
    const where = {
      ...orgWhere(orgId),
      ...(period ? { period } : { period: { startsWith: year.toString() } }),
    };
    const payrolls = await prisma.payroll.findMany({
      where,
      orderBy: [{ period: "asc" }, { createdAt: "asc" }],
      include: { employee: { select: { name: true, position: true } } },
    });
    const data: unknown[][] = [
      ["Period", "Employee", "Position", "Gross (MWK)", "PAYE", "Pension (Emp)", "Pension (Employer)", "NSSF (Emp)", "NSSF (Emp)", "Other Add.", "Other Ded.", "Net Pay", "Status"],
      ...payrolls.map(p => [
        p.period, p.employee.name, p.employee.position,
        fmt(p.grossSalary), fmt(p.paye), fmt(p.pension), fmt(p.pensionEmployer),
        fmt(p.nssfEmployee), fmt(p.nssfEmployer), fmt(p.otherAdditions), fmt(p.otherDeductions),
        fmt(p.netPay), p.status,
      ]),
    ];
    buf = toWb({ Payroll: data });
    filename = `payroll-${period ?? year}-${new Date().toISOString().split("T")[0]}.xlsx`;
  }

  else if (type === "budget") {
    const budgetLines = await prisma.budgetLine.findMany({
      where: { fiscalYear: year },
      orderBy: { name: "asc" },
      include: { project: { select: { name: true } }, grant: { select: { name: true } } },
    });
    const data: unknown[][] = [
      ["Budget Line", "Category", "Project", "Grant", "Fiscal Year", "Ceiling", "Currency", "Active"],
      ...budgetLines.map(bl => [
        bl.name, bl.category, bl.project?.name ?? "—", bl.grant?.name ?? "—",
        bl.fiscalYear, bl.ceiling ?? "No cap", bl.currency, bl.active ? "Yes" : "No",
      ]),
    ];
    buf = toWb({ "Budget Lines": data });
    filename = `budget-${year}-${new Date().toISOString().split("T")[0]}.xlsx`;
  }

  else { // pl (default)
    const startDate = new Date(year, 0, 1);
    const endDate   = new Date(year, 11, 31, 23, 59, 59);

    const [incomes, expenses, payrolls] = await Promise.all([
      prisma.income.findMany({
        where: { ...orgWhere(orgId), receivedDate: { gte: startDate, lte: endDate }, deletedAt: null },
        orderBy: { receivedDate: "asc" },
        include: { project: { select: { name: true } } },
      }),
      prisma.expense.findMany({
        where: { ...orgWhere(orgId), paidDate: { gte: startDate, lte: endDate }, deletedAt: null },
        orderBy: { paidDate: "asc" },
        include: { project: { select: { name: true } } },
      }),
      prisma.payroll.findMany({
        where: { ...orgWhere(orgId), period: { startsWith: year.toString() }, deletedAt: null },
        orderBy: { period: "asc" },
        include: { employee: { select: { name: true } } },
      }),
    ]);

    const incomeData: unknown[][] = [
      ["Date", "Description", "Type", "Source", "Project", "Amount", "Currency"],
      ...incomes.map(i => [
        i.receivedDate.toISOString().split("T")[0], i.description, i.incomeType, i.source ?? "",
        i.project?.name ?? "—", fmt(i.amount), i.currency,
      ]),
    ];
    const expenseData: unknown[][] = [
      ["Date", "Description", "Category", "Vendor", "Project", "Amount", "Currency"],
      ...expenses.map(e => [
        e.paidDate.toISOString().split("T")[0], e.description, e.category, e.vendor ?? "",
        e.project?.name ?? "—", fmt(e.amount), e.currency,
      ]),
    ];
    const payrollData: unknown[][] = [
      ["Period", "Employee", "Gross", "PAYE", "Net Pay", "Currency"],
      ...payrolls.map(p => [
        p.period, p.employee.name, fmt(p.grossSalary), fmt(p.paye), fmt(p.netPay), p.currency,
      ]),
    ];

    const totalIncome   = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalPayroll  = payrolls.reduce((s, p) => s + p.netPay, 0);
    const summary: unknown[][] = [
      ["P&L Summary", year],
      [],
      ["Total Income", fmt(totalIncome)],
      ["Total Operational Expenses", fmt(totalExpenses)],
      ["Total Payroll", fmt(totalPayroll)],
      ["Net Surplus / (Deficit)", fmt(totalIncome - totalExpenses - totalPayroll)],
    ];

    buf = toWb({ Summary: summary, Income: incomeData, Expenses: expenseData, Payroll: payrollData });
    filename = `pl-${year}-${new Date().toISOString().split("T")[0]}.xlsx`;
  }

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
