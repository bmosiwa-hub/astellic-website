import { prisma } from "@/lib/prisma";
import { sendComplianceDigest } from "@/lib/mail";
import { NextResponse } from "next/server";

/**
 * Daily compliance digest cron — runs at 08:00 UTC.
 * Sends a single email to all active CEO + FM users if:
 *   - any PAID advances are overdue for liquidation, OR
 *   - any active grants are ≥ 80% utilised.
 * Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const now = new Date();

    // ── 1. Overdue liquidations ──────────────────────────────────────────────
    const paidSubmissions = await prisma.submission.findMany({
      where: {
        status:              "PAID",
        liquidationDeadline: { lt: now },
        deletedAt:           null,
      },
      include: {
        liquidations: {
          where:  { status: "FM_APPROVED", deletedAt: null },
          select: { id: true },
        },
      },
      orderBy: { liquidationDeadline: "asc" },
    });

    const overdueSubmissions = paidSubmissions.filter((s) => s.liquidations.length === 0);

    const overdueItems = overdueSubmissions.map((s) => ({
      label:      s.purpose ?? s.milestone ?? `Request #${s.id.slice(-6).toUpperCase()}`,
      daysOverdue: Math.floor((now.getTime() - (s.liquidationDeadline?.getTime() ?? 0)) / 86_400_000),
      amount:     s.totalAmount,
      currency:   s.currency,
    }));

    // ── 2. Grant over-utilisation ────────────────────────────────────────────
    const liquidGroups = await prisma.liquidation.groupBy({
      by:    ["budgetLine"],
      where: { status: "FM_APPROVED", deletedAt: null },
      _sum:  { fundsAccountedFor: true },
    });

    const payableGroups = await prisma.accountPayable.groupBy({
      by:    ["budgetLine"],
      where: { status: "PAID", budgetLine: { not: null } },
      _sum:  { amount: true },
    });

    const spendMap: Record<string, number> = {};
    for (const g of liquidGroups)
      spendMap[g.budgetLine] = (spendMap[g.budgetLine] ?? 0) + (g._sum.fundsAccountedFor ?? 0);
    for (const g of payableGroups)
      if (g.budgetLine) spendMap[g.budgetLine] = (spendMap[g.budgetLine] ?? 0) + (g._sum.amount ?? 0);

    const activeGrants = await prisma.donorGrant.findMany({
      where:   { status: "ACTIVE" },
      include: { budgetLines: { select: { name: true } } },
    });

    const grantAlerts = activeGrants
      .map((g) => {
        const spent = g.budgetLines.reduce((s, bl) => s + (spendMap[bl.name] ?? 0), 0);
        const pct   = g.totalAmount > 0 ? (spent / g.totalAmount) * 100 : 0;
        return { name: g.name, donorName: g.donorName, pct, currency: g.currency, totalAmount: g.totalAmount };
      })
      .filter((g) => g.pct >= 80)
      .sort((a, b) => b.pct - a.pct);

    // ── 3. Skip if nothing to report ────────────────────────────────────────
    if (overdueItems.length === 0 && grantAlerts.length === 0) {
      return NextResponse.json({ sent: false, message: "No compliance issues — digest skipped" });
    }

    // ── 4. Send digest to CEO + FM ───────────────────────────────────────────
    const recipients = await prisma.user.findMany({
      where:  { role: { in: ["CEO", "FINANCE_MANAGER"] }, active: true },
      select: { email: true },
    });

    if (recipients.length === 0) {
      return NextResponse.json({ sent: false, message: "No active CEO/FM recipients found" });
    }

    await sendComplianceDigest({
      to:          recipients.map((u) => u.email),
      overdueItems,
      grantAlerts,
    });

    return NextResponse.json({
      sent: true,
      overdueCount: overdueItems.length,
      grantAlertCount: grantAlerts.length,
    });
  } catch (err) {
    console.error("[compliance-alerts cron]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
