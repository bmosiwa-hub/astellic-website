/**
 * Period-lock helper for Astelfin IMS — Phase 5.
 *
 * A FinancialPeriod record is only present when a month has been CLOSED or
 * LOCKED.  No record = OPEN.  Call `checkPeriodOpen` before any
 * create/edit that modifies a dated financial record; redirect with
 * ?error=period_closed when it returns false.
 */

import { prisma } from "@/lib/prisma";

export function toPeriodKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function checkPeriodOpen(date: Date): Promise<{
  open:      boolean;
  periodKey: string;
  status:    string;
}> {
  const periodKey = toPeriodKey(date);
  const record    = await prisma.financialPeriod.findUnique({ where: { periodKey } });
  if (!record || record.status === "OPEN") {
    return { open: true, periodKey, status: "OPEN" };
  }
  return { open: false, periodKey, status: record.status };
}

/** Human-readable month label, e.g. "January 2025" */
export function periodLabel(periodKey: string): string {
  const [year, month] = periodKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-GB", {
    month: "long",
    year:  "numeric",
  });
}
