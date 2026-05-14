/**
 * POST /api/reconciliation
 * Upload a bank statement CSV, auto-match transactions, return statement ID.
 * FM and CEO only.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseBankCSV, findBestMatch, type MatchCandidate } from "@/lib/reconciliation";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const form = await req.formData();
  const file         = form.get("file")        as File   | null;
  const accountName  = form.get("accountName") as string | null;
  const bankName     = form.get("bankName")    as string | null;
  const currency     = (form.get("currency")   as string) || "MWK";
  const fromDate     = form.get("fromDate")    as string | null;
  const toDate       = form.get("toDate")      as string | null;

  if (!file || !accountName || !bankName || !fromDate || !toDate) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // ── Parse CSV ───────────────────────────────────────────────────────────────
  let csvText: string;
  try {
    csvText = await file.text();
  } catch {
    return NextResponse.json({ error: "Could not read file." }, { status: 400 });
  }

  let rows;
  try {
    rows = parseBankCSV(csvText);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "CSV parse error";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  // ── Fetch match candidates ──────────────────────────────────────────────────
  const from  = new Date(fromDate);
  const to    = new Date(toDate);
  const bufferMs = 3 * 24 * 60 * 60 * 1000;
  const bufferedFrom = new Date(from.getTime() - bufferMs);
  const bufferedTo   = new Date(to.getTime()   + bufferMs);

  const [incomes, expenses, payrolls, payables] = await Promise.all([
    prisma.income.findMany({
      where:  { receivedDate: { gte: bufferedFrom, lte: bufferedTo }, deletedAt: null },
      select: { id: true, receivedDate: true, amount: true, currency: true, description: true },
    }),
    prisma.expense.findMany({
      where:  { paidDate: { gte: bufferedFrom, lte: bufferedTo }, deletedAt: null },
      select: { id: true, paidDate: true, amount: true, currency: true, description: true },
    }),
    prisma.payroll.findMany({
      where:   { paidDate: { gte: bufferedFrom, lte: bufferedTo }, deletedAt: null },
      include: { employee: { select: { name: true } } },
    }),
    prisma.accountPayable.findMany({
      where:  { paidDate: { gte: bufferedFrom, lte: bufferedTo }, deletedAt: null, status: "PAID" },
      select: { id: true, paidDate: true, amount: true, currency: true, description: true },
    }),
  ]);

  // Only match same-currency records
  const candidates: MatchCandidate[] = [
    ...incomes
      .filter((r) => r.currency === currency)
      .map((r) => ({ entityType: "Income" as const, entityId: r.id, date: r.receivedDate, amount: r.amount, description: r.description, currency: r.currency })),
    ...expenses
      .filter((r) => r.currency === currency)
      .map((r) => ({ entityType: "Expense" as const, entityId: r.id, date: r.paidDate, amount: r.amount, description: r.description, currency: r.currency })),
    ...payrolls
      .filter((r) => r.currency === currency)
      .map((r) => ({ entityType: "Payroll" as const, entityId: r.id, date: r.paidDate!, amount: r.netPay, description: `Payroll — ${r.employee.name}`, currency: r.currency })),
    ...payables
      .filter((r) => r.currency === currency)
      .map((r) => ({ entityType: "AccountPayable" as const, entityId: r.id, date: r.paidDate!, amount: r.amount, description: r.description, currency: r.currency })),
  ].filter((c) => c.date != null);

  // ── Create statement + transactions in one transaction ──────────────────────
  const statement = await prisma.$transaction(async (tx) => {
    const stmt = await tx.bankStatement.create({
      data: {
        accountName,
        bankName,
        currency,
        fromDate: from,
        toDate:   to,
        status:   "IN_REVIEW",
        uploadedById: session.user.id!,
      },
    });

    for (const row of rows) {
      const match = findBestMatch(row, candidates);

      await tx.bankTransaction.create({
        data: {
          statementId:     stmt.id,
          transactionDate: row.transactionDate,
          description:     row.description,
          debit:           row.debit,
          credit:          row.credit,
          balance:         row.balance,
          matchStatus:     match ? "AUTO_MATCHED" : "UNMATCHED",
          matchEntityType: match?.entityType ?? null,
          matchEntityId:   match?.entityId   ?? null,
          matchedAt:       match ? new Date() : null,
          matchedById:     match ? session.user.id! : null,
        },
      });
    }

    return stmt;
  });

  return NextResponse.json({ statementId: statement.id });
}
