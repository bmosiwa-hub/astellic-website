import { prisma } from "@/lib/prisma";
import { notifyFMOfUpcomingPayable } from "@/lib/mail";
import { NextResponse } from "next/server";

// Called daily by Vercel Cron — protected by CRON_SECRET
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Window: reminders for payables whose dueDate falls in [7 days from now, 8 days from now)
    // i.e. exactly 7 days out, checked daily
    const windowStart = new Date(now);
    windowStart.setDate(windowStart.getDate() + 7);
    windowStart.setHours(0, 0, 0, 0);

    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + 1);

    const upcoming = await prisma.accountPayable.findMany({
      where: {
        dueDate: { gte: windowStart, lt: windowEnd },
        status: { in: ["UPCOMING", "DUE"] },
        reminderSent: false,
        recurringExpenseId: { not: null }, // only remind for recurring ones
      },
      include: {
        recurringExpense: { select: { name: true } },
      },
    });

    if (upcoming.length === 0) {
      return NextResponse.json({ sent: 0, message: "No reminders due today" });
    }

    // Get all active Finance Managers
    const fms = await prisma.user.findMany({
      where: { role: "FINANCE_MANAGER", active: true },
      select: { email: true },
    });

    if (fms.length === 0) {
      return NextResponse.json({ sent: 0, message: "No active Finance Managers found" });
    }

    const fmEmails = fms.map((u) => u.email);
    let sent = 0;
    const errors: string[] = [];

    for (const payable of upcoming) {
      try {
        await notifyFMOfUpcomingPayable({
          to: fmEmails,
          payableName: payable.description,
          amount: payable.amount,
          currency: payable.currency,
          dueDate: payable.dueDate,
          vendor: payable.vendor,
        });

        // Mark reminder as sent
        await prisma.accountPayable.update({
          where: { id: payable.id },
          data: { reminderSent: true },
        });

        sent++;
      } catch (err) {
        errors.push(`${payable.id}: ${String(err)}`);
      }
    }

    return NextResponse.json({
      sent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("[ap-reminders cron]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
