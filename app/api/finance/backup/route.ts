import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { formatDate } from "@/lib/finance-utils";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  // Fetch all data
  const [income, expenses, projects, consultants, consultantPayments,
         employees, payrolls, debts, debtRepayments] = await Promise.all([
    prisma.income.findMany({
      orderBy: { receivedDate: "desc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.expense.findMany({
      orderBy: { paidDate: "desc" },
      include: { project: { select: { name: true } } },
    }),
    prisma.project.findMany({ orderBy: { startDate: "desc" } }),
    prisma.consultant.findMany({ orderBy: { name: "asc" } }),
    prisma.consultantPayment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        consultant: { select: { name: true } },
        project: { select: { name: true } },
      },
    }),
    prisma.employee.findMany({ orderBy: { name: "asc" } }),
    prisma.payroll.findMany({
      orderBy: [{ period: "desc" }, { createdAt: "desc" }],
      include: { employee: { select: { name: true } } },
    }),
    prisma.debt.findMany({
      orderBy: { disbursedDate: "desc" },
      include: { repayments: true },
    }),
    prisma.debtRepayment.findMany({
      orderBy: { paidDate: "desc" },
      include: { debt: { select: { lender: true } } },
    }),
  ]);

  const wb = XLSX.utils.book_new();

  // ── Income sheet ─────────────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    income.map((r) => ({
      Date: formatDate(r.receivedDate),
      Description: r.description,
      Project: r.project?.name ?? "",
      Source: r.source ?? "",
      "Invoice No.": r.invoiceNumber ?? "",
      Currency: r.currency,
      Amount: r.amount,
      Notes: r.notes ?? "",
    }))
  ), "Income");

  // ── Expenses sheet ───────────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    expenses.map((r) => ({
      Date: formatDate(r.paidDate),
      Description: r.description,
      Category: r.category,
      Project: r.project?.name ?? "",
      Vendor: r.vendor ?? "",
      "Receipt Ref": r.receiptRef ?? "",
      Currency: r.currency,
      Amount: r.amount,
      Notes: r.notes ?? "",
    }))
  ), "Expenses");

  // ── Projects sheet ───────────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    projects.map((p) => ({
      Name: p.name,
      Client: p.client,
      Status: p.status,
      "Start Date": formatDate(p.startDate),
      "End Date": p.endDate ? formatDate(p.endDate) : "",
      Currency: p.currency,
      Budget: p.budget ?? "",
      Description: p.description ?? "",
    }))
  ), "Projects");

  // ── Consultants sheet ────────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    consultants.map((c) => ({
      Name: c.name,
      Email: c.email ?? "",
      Phone: c.phone ?? "",
      Specialisation: c.specialisation ?? "",
      Currency: c.currency,
      "Daily Rate": c.dailyRate ?? "",
      "Tax PIN": c.taxPin ?? "",
      Active: c.active ? "Yes" : "No",
    }))
  ), "Consultants");

  // ── Consultant Payments sheet ────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    consultantPayments.map((p) => ({
      Consultant: p.consultant.name,
      Project: p.project?.name ?? "",
      Description: p.description,
      "Days Worked": p.daysWorked ?? "",
      "Rate Used": p.rateUsed ?? "",
      Currency: p.currency,
      "Gross Amount": p.grossAmount,
      "Withholding Tax": p.withholdingTax,
      "Net Amount": p.netAmount,
      Status: p.status,
      "Date Paid": p.paidDate ? formatDate(p.paidDate) : "",
    }))
  ), "Consultant Payments");

  // ── Employees sheet ──────────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    employees.map((e) => ({
      Name: e.name,
      Email: e.email ?? "",
      Position: e.position,
      Department: e.department ?? "",
      Currency: e.currency,
      "Gross Salary": e.grossSalary,
      "Tax PIN": e.taxPin ?? "",
      "NSSF No.": e.nssf ?? "",
      "Start Date": formatDate(e.startDate),
      Active: e.active ? "Yes" : "No",
    }))
  ), "Employees");

  // ── Payroll sheet ────────────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    payrolls.map((p) => ({
      Employee: p.employee.name,
      Period: p.period,
      Currency: p.currency,
      "Gross Salary": p.grossSalary,
      PAYE: p.paye,
      "NSSF (Employee)": p.nssfEmployee,
      "NSSF (Employer)": p.nssfEmployer,
      "Other Deductions": p.otherDeductions,
      "Net Pay": p.netPay,
      Status: p.status,
      "Date Paid": p.paidDate ? formatDate(p.paidDate) : "",
    }))
  ), "Payroll");

  // ── Debt sheet ───────────────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    debts.map((d) => {
      const repaid = d.repayments.reduce((s: number, r) => s + r.amount, 0);
      return {
        Lender: d.lender,
        Description: d.description,
        Currency: d.currency,
        Principal: d.principal,
        "Interest Rate (%)": d.interestRate ?? "",
        "Date Disbursed": formatDate(d.disbursedDate),
        "Due Date": d.dueDate ? formatDate(d.dueDate) : "",
        Status: d.status,
        "Total Repaid": repaid,
        "Outstanding": Math.max(0, d.principal - repaid),
      };
    })
  ), "Debt");

  // ── Debt Repayments sheet ────────────────────────────────────────────────────
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
    debtRepayments.map((r) => ({
      Lender: r.debt.lender,
      "Date Paid": formatDate(r.paidDate),
      Currency: r.currency,
      Amount: r.amount,
      Notes: r.notes ?? "",
    }))
  ), "Debt Repayments");

  // Write workbook to buffer
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  const date = new Date().toISOString().slice(0, 10);
  const filename = `Astellic_Finance_Backup_${date}.xlsx`;

  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
