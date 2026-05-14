/**
 * GET /api/reports/budget?year=YYYY&project=<projectId>
 * Returns a CSV of budget vs actual for the given fiscal year.
 * CEO and Finance Manager only.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { buildRateMap, toMWK } from "@/lib/fx";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const yearParam  = req.nextUrl.searchParams.get("year");
  const projectFilter = req.nextUrl.searchParams.get("project") ?? undefined;
  const year = parseInt(yearParam ?? String(new Date().getFullYear()));
  if (isNaN(year)) return new NextResponse("Bad Request", { status: 400 });

  const yearStart = new Date(year, 0, 1);
  const yearEnd   = new Date(year + 1, 0, 1);

  const exchangeRates = await prisma.exchangeRate.findMany({
    select: { currency: true, middleRate: true, updatedAt: true },
  });
  const rates = buildRateMap(exchangeRates);

  const budgetLines = await prisma.budgetLine.findMany({
    where:   { fiscalYear: year, active: true, ...(projectFilter ? { projectId: projectFilter } : {}) },
    include: { project: { select: { name: true } } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const [liquidations, payables, paidSubs] = await Promise.all([
    prisma.liquidation.findMany({
      where:  { status: "FM_APPROVED", deletedAt: null, liquidationDate: { gte: yearStart, lt: yearEnd } },
      select: { budgetLine: true, fundsAccountedFor: true, currency: true },
    }),
    prisma.accountPayable.findMany({
      where:  { status: "PAID", deletedAt: null, paidDate: { gte: yearStart, lt: yearEnd } },
      select: { budgetLine: true, amount: true, currency: true },
    }),
    prisma.submission.findMany({
      where:  { status: "PAID", type: "REQUEST", deletedAt: null, updatedAt: { gte: yearStart, lt: yearEnd } },
      select: { budgetLine: true, totalAmount: true, currency: true },
    }),
  ]);

  const spendMap: Record<string, number> = {};
  for (const l of liquidations) {
    if (l.budgetLine) spendMap[l.budgetLine] = (spendMap[l.budgetLine] ?? 0) + toMWK(l.fundsAccountedFor, l.currency, rates);
  }
  for (const p of payables) {
    if (p.budgetLine) spendMap[p.budgetLine] = (spendMap[p.budgetLine] ?? 0) + toMWK(p.amount, p.currency, rates);
  }
  for (const s of paidSubs) {
    if (s.budgetLine) spendMap[s.budgetLine] = (spendMap[s.budgetLine] ?? 0) + toMWK(s.totalAmount, s.currency, rates);
  }

  const rows: string[] = [
    `Astellic Finance — Budget vs Actual FY${year}`,
    `All values in MWK equivalent (RBM middle rates)`,
    `Generated: ${new Date().toISOString()}`,
    ``,
    `Budget Line,Category,Project,Ceiling (MWK),Actual Spend (MWK),Variance (MWK),% Utilised`,
    ...budgetLines.map((b) => {
      const ceilingMWK = b.ceiling != null ? toMWK(b.ceiling, b.currency, rates) : null;
      const actual     = spendMap[b.name] ?? 0;
      const variance   = ceilingMWK != null ? (ceilingMWK - actual).toFixed(2) : "";
      const pct        = ceilingMWK && ceilingMWK > 0 ? ((actual / ceilingMWK) * 100).toFixed(1) : "";
      return [
        `"${b.name.replace(/"/g, '""')}"`,
        b.category,
        b.project ? `"${b.project.name.replace(/"/g, '""')}"` : "",
        ceilingMWK != null ? ceilingMWK.toFixed(2) : "",
        actual.toFixed(2),
        variance,
        pct,
      ].join(",");
    }),
  ];

  return new NextResponse(rows.join("\r\n"), {
    headers: {
      "Content-Type":        "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="budget-vs-actual-${year}.csv"`,
    },
  });
}
