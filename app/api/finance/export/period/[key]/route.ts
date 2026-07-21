/**
 * Period export API — Phase 5
 *
 * GET /api/finance/export/period/[key]
 *
 * Downloads a structured JSON export of all financial records in a locked
 * financial period.  The export includes the stored SHA-256 checksum so the
 * recipient can verify the data has not been tampered with.
 *
 * Restricted to CEO and FINANCE_MANAGER roles.
 * Only LOCKED periods may be exported (ensures checksum is present).
 */

import { auth } from "@/auth";
import { resolveAccess } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createHash } from "crypto";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const access = await resolveAccess(session);
  if (!access || !access.tab("finance")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { key: periodKey } = await params;
  if (!/^\d{4}-\d{2}$/.test(periodKey)) {
    return new NextResponse("Invalid period key", { status: 400 });
  }

  const periodRecord = await prisma.financialPeriod.findUnique({
    where:   { periodKey },
    include: { lockedBy: { select: { name: true, email: true } } },
  });

  if (!periodRecord) {
    return new NextResponse("Period not found", { status: 404 });
  }
  if (periodRecord.status !== "LOCKED") {
    return new NextResponse("Only LOCKED periods may be exported", { status: 409 });
  }

  const [yearStr, monthStr] = periodKey.split("-");
  const year  = parseInt(yearStr);
  const month = parseInt(monthStr);
  const start = new Date(year, month - 1, 1);
  const end   = new Date(year, month, 1);

  // Fetch all records for the period
  const [income, expenses, liquidations, payrollItems] = await Promise.all([
    prisma.income.findMany({
      where:   { receivedDate: { gte: start, lt: end }, deletedAt: null },
      orderBy: { receivedDate: "asc" },
    }),
    prisma.expense.findMany({
      where:   { paidDate: { gte: start, lt: end }, deletedAt: null },
      orderBy: { paidDate: "asc" },
    }),
    prisma.liquidation.findMany({
      where:   { liquidationDate: { gte: start, lt: end }, status: "FM_APPROVED", deletedAt: null },
      include: { submitter: { select: { name: true } } },
      orderBy: { liquidationDate: "asc" },
    }),
    prisma.payroll.findMany({
      where:   { period: periodKey },
      include: { employee: { select: { name: true } } },
      orderBy: { id: "asc" },
    }),
  ]);

  // Verify checksum matches stored value
  const payload  = JSON.stringify({ periodKey, income, expenses, liquidations, payroll: payrollItems });
  const computed = createHash("sha256").update(payload).digest("hex");
  const verified = computed === periodRecord.checksum;

  const exportData = {
    _meta: {
      system:       "Astelfin IMS — Astellic",
      exportedAt:   new Date().toISOString(),
      exportedBy:   session.user.name ?? session.user.email,
      period:       periodKey,
      label:        new Date(year, month - 1, 1).toLocaleString("en-GB", { month: "long", year: "numeric" }),
      lockedAt:     periodRecord.lockedAt?.toISOString(),
      lockedBy:     periodRecord.lockedBy?.name,
      checksum:     periodRecord.checksum,
      checksumAlgo: "SHA-256",
      verified,
      notes:        periodRecord.notes,
    },
    summary: {
      incomeCount:         income.length,
      incomeTotalMWK:      income.filter((r) => r.currency === "MWK").reduce((s, r) => s + r.amount, 0),
      expenseCount:        expenses.length,
      expenseTotalMWK:     expenses.filter((r) => r.currency === "MWK").reduce((s, r) => s + r.amount, 0),
      liquidationCount:    liquidations.length,
      payrollCount:        payrollItems.length,
      payrollTotalMWK:     payrollItems.reduce((s, r) => s + r.netPay, 0),
    },
    income,
    expenses,
    liquidations,
    payroll: payrollItems,
  };

  const json     = JSON.stringify(exportData, null, 2);
  const filename = `astelfin-period-${periodKey}.json`;

  return new NextResponse(json, {
    status:  200,
    headers: {
      "Content-Type":        "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Period-Checksum":   periodRecord.checksum ?? "",
      "X-Checksum-Verified": String(verified),
    },
  });
}
