import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { formatDate } from "@/lib/finance-utils";
import nodemailer from "nodemailer";

// Called by Vercel Cron — protected by CRON_SECRET
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const [income, expenses, projects, debts, payrolls] = await Promise.all([
      prisma.income.findMany({
        orderBy: { receivedDate: "desc" },
        include: { project: { select: { name: true } } },
      }),
      prisma.expense.findMany({
        orderBy: { paidDate: "desc" },
        include: { project: { select: { name: true } } },
      }),
      prisma.project.findMany({ orderBy: { startDate: "desc" } }),
      prisma.debt.findMany({
        orderBy: { disbursedDate: "desc" },
        include: { repayments: true },
      }),
      prisma.payroll.findMany({
        orderBy: [{ period: "desc" }],
        include: { employee: { select: { name: true } } },
      }),
    ]);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      income.map((r) => ({
        Date: formatDate(r.receivedDate),
        Description: r.description,
        Project: r.project?.name ?? "",
        Source: r.source ?? "",
        Currency: r.currency,
        Amount: r.amount,
      }))
    ), "Income");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      expenses.map((r) => ({
        Date: formatDate(r.paidDate),
        Description: r.description,
        Category: r.category,
        Project: r.project?.name ?? "",
        Currency: r.currency,
        Amount: r.amount,
      }))
    ), "Expenses");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      projects.map((p) => ({
        Name: p.name,
        Client: p.client,
        Status: p.status,
        "Start Date": formatDate(p.startDate),
        Currency: p.currency,
        Budget: p.budget ?? "",
      }))
    ), "Projects");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      debts.map((d) => {
        const repaid = d.repayments.reduce((s: number, r) => s + r.amount, 0);
        return {
          Lender: d.lender,
          Currency: d.currency,
          Principal: d.principal,
          Repaid: repaid,
          Outstanding: Math.max(0, d.principal - repaid),
          Status: d.status,
        };
      })
    ), "Debt");

    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(
      payrolls.map((p) => ({
        Employee: p.employee.name,
        Period: p.period,
        "Gross Salary": p.grossSalary,
        "Net Pay": p.netPay,
        Status: p.status,
      }))
    ), "Payroll");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const date = new Date().toISOString().slice(0, 10);
    const filename = `Astellic_Finance_Backup_${date}.xlsx`;

    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Astellic Finance" <${process.env.SMTP_USER}>`,
      to: process.env.BACKUP_EMAIL ?? process.env.SMTP_USER,
      subject: `Weekly Finance Backup — ${date}`,
      text: `Please find attached the weekly automated backup of Astellic's financial records as at ${date}.`,
      attachments: [
        {
          filename,
          content: buf,
          contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    });

    return NextResponse.json({ ok: true, date });
  } catch (err) {
    console.error("Backup cron failed:", err);
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}
