import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * Monthly payables conversion cron — runs on the 27th of every month.
 * Any salary (Payroll.status === PENDING) or PAYE (Payroll.payeStatus === OUTSTANDING)
 * for the current period or earlier that hasn't been paid/remitted yet is converted
 * into an overdue AccountPayable, so it shows up on the Payables dashboard and is
 * tracked through to actual payment.
 *
 * Idempotent: skips any Payroll record that already has a payable referencing it
 * (matched via the `note` field). Protected by CRON_SECRET.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const now = new Date();
    const currentPeriod = now.toISOString().slice(0, 7); // "YYYY-MM"

    // System creator: first active CEO (cron has no session user)
    const systemUser = await prisma.user.findFirst({
      where: { role: "CEO", active: true },
      select: { id: true },
    });
    if (!systemUser) {
      return NextResponse.json({ error: "No active CEO found to attribute payables to" }, { status: 500 });
    }

    const unpaidSalaries = await prisma.payroll.findMany({
      where: { status: "PENDING", period: { lte: currentPeriod }, deletedAt: null },
      include: { employee: { select: { name: true } } },
    });

    const outstandingPaye = await prisma.payroll.findMany({
      where: { payeStatus: "OUTSTANDING", period: { lte: currentPeriod }, deletedAt: null, paye: { gt: 0 } },
      include: { employee: { select: { name: true } } },
    });

    let salariesConverted = 0;
    let payeConverted = 0;

    for (const p of unpaidSalaries) {
      const already = await prisma.accountPayable.findFirst({
        where: { note: { contains: `Payroll ID: ${p.id} (salary)` } },
      });
      if (already) continue;

      await prisma.accountPayable.create({
        data: {
          description: `Unpaid Salary — ${p.employee.name} — ${p.period}`,
          vendor:      p.employee.name,
          amount:      p.netPay,
          currency:    p.currency,
          dueDate:     now,
          status:      "OVERDUE",
          budgetLine:  "Payroll",
          note:        `Auto-converted from unpaid payroll on the 27th (Payroll ID: ${p.id} (salary))`,
          createdBy:   systemUser.id,
        },
      });
      salariesConverted++;
    }

    for (const p of outstandingPaye) {
      const already = await prisma.accountPayable.findFirst({
        where: { note: { contains: `Payroll ID: ${p.id} (paye)` } },
      });
      if (already) continue;

      await prisma.accountPayable.create({
        data: {
          description: `Unpaid PAYE — ${p.employee.name} — ${p.period}`,
          vendor:      "Malawi Revenue Authority",
          amount:      p.paye,
          currency:    "MWK",
          dueDate:     now,
          status:      "OVERDUE",
          budgetLine:  "Tax",
          note:        `Auto-converted from outstanding PAYE on the 27th (Payroll ID: ${p.id} (paye))`,
          createdBy:   systemUser.id,
        },
      });
      payeConverted++;
    }

    return NextResponse.json({
      ok: true,
      period: currentPeriod,
      salariesConverted,
      payeConverted,
    });
  } catch (err) {
    console.error("[monthly-payables cron]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
