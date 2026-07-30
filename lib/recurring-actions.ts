"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { generateDueDates } from "@/lib/recurring-utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resolveAccess } from "@/lib/access";
import type { RecurringFrequency } from "@prisma/client";

/* ── Server actions ───────────────────────────────────────────────── */

/** CEO creates a new recurring expense and pre-generates AccountPayable entries */
export async function createRecurringExpense(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageRecurring")) redirect("/astelfin_26/my");

  const name        = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const amount      = parseFloat(formData.get("amount") as string);
  const currency    = (formData.get("currency") as string) || "MWK";
  const category    = (formData.get("category") as string) || null;
  const budgetLine  = (formData.get("budgetLine") as string) || null;
  const vendor      = (formData.get("vendor") as string) || null;
  const frequency   = formData.get("frequency") as RecurringFrequency;
  const startDate   = new Date(formData.get("startDate") as string);
  const endDateRaw  = formData.get("endDate") as string;
  const endDate     = endDateRaw ? new Date(endDateRaw) : null;

  const rec = await prisma.recurringExpense.create({
    data: {
      name, description, amount, currency, category, budgetLine, vendor,
      frequency, startDate, endDate, createdBy: session.user.id!,
    },
  });

  // Generate AccountPayable entries
  const dueDates = generateDueDates(startDate, frequency, endDate);
  const now = new Date();

  await prisma.accountPayable.createMany({
    data: dueDates.map((dueDate) => ({
      description: name,
      vendor: vendor ?? null,
      amount,
      currency,
      budgetLine: budgetLine ?? null,
      dueDate,
      status: dueDate < now ? "OVERDUE" : "UPCOMING",
      recurringExpenseId: rec.id,
      createdBy: session.user.id!,
    })),
  });

  await auditLog({
    userId: session.user.id!,
    action: "CREATE",
    entity: "RecurringExpense",
    entityId: rec.id,
    detail: `${name} — ${currency} ${amount} ${frequency}`,
  });

  revalidatePath("/astelfin_26/recurring");
  revalidatePath("/astelfin_26/payables");
  redirect("/astelfin_26/recurring");
}

/** Deactivate / reactivate a recurring expense */
export async function toggleRecurringExpense(id: string, active: boolean): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageRecurring")) redirect("/astelfin_26/my");

  await prisma.recurringExpense.update({ where: { id }, data: { active } });

  // Cancel upcoming payables if deactivating
  if (!active) {
    await prisma.accountPayable.updateMany({
      where: { recurringExpenseId: id, status: "UPCOMING" },
      data: { status: "CANCELLED" },
    });
  }

  revalidatePath("/astelfin_26/recurring");
  revalidatePath("/astelfin_26/payables");
}

/* ── Account Payable actions ──────────────────────────────────────── */

/** FM / CEO creates a one-off manual payable */
export async function createAccountPayable(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const access = await resolveAccess(session);
  if (!access || !access.can("canManagePayables")) redirect("/astelfin_26/my");

  const description = formData.get("description") as string;
  const vendor      = (formData.get("vendor") as string) || null;
  const amount      = parseFloat(formData.get("amount") as string);
  const currency    = (formData.get("currency") as string) || "MWK";
  const dueDate     = new Date(formData.get("dueDate") as string);
  const budgetLine  = ((formData.get("budgetLine") as string) || "").trim() || null;
  const note        = (formData.get("note") as string) || null;

  const ap = await prisma.accountPayable.create({
    data: {
      description, vendor, amount, currency, dueDate, budgetLine, note,
      status: dueDate < new Date() ? "OVERDUE" : "UPCOMING",
      createdBy: session.user.id!,
    },
  });

  await auditLog({
    userId: session.user.id!,
    action: "CREATE",
    entity: "AccountPayable",
    entityId: ap.id,
    detail: `${description} — due ${dueDate.toISOString().slice(0, 10)}`,
  });

  revalidatePath("/astelfin_26/payables");
  redirect("/astelfin_26/payables");
}

/** FM / CEO marks a payable as paid */
export async function markPayablePaid(id: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const access = await resolveAccess(session);
  if (!access || !access.can("canManagePayables")) redirect("/astelfin_26/my");

  const note     = (formData.get("note") as string) || null;
  const paidDate = new Date();

  const ap = await prisma.accountPayable.update({
    where: { id },
    data: { status: "PAID", paidDate, note: note ?? undefined },
  });

  // Some payables are *mirrors* of obligations that are actually paid (and booked
  // as an Expense) in the Payroll / Tax modules — the monthly cron's "Unpaid
  // Salary/PAYE" entries and the per-period "Pension Contributions" payable. For
  // those, marking paid here must NOT create a second Expense (it would double-
  // count the cash outflow). Only real, standalone payables get an Expense.
  const isStatutoryMirror =
    (ap.note?.includes("Auto-converted") ?? false) ||
    (ap.budgetLine === "Pension" && ap.description.startsWith("Pension Contributions"));

  if (!isStatutoryMirror) {
    // Record the cash outflow so the dashboard balance reflects this payment
    await prisma.expense.create({
      data: {
        description: ap.description,
        amount:      ap.amount,
        currency:    ap.currency,
        category:    ap.budgetLine || "Payables",
        paidDate,
        vendor:      ap.vendor ?? undefined,
        notes:       `Auto-generated from accounts payable payment (AccountPayable ID: ${id})`,
      },
    });
  }

  await auditLog({
    userId: session.user.id!,
    action: "PAID",
    entity: "AccountPayable",
    entityId: id,
    detail: note || "Marked as paid",
  });

  revalidatePath("/astelfin_26/payables");
}

/* ── Account Receivable actions ───────────────────────────────────── */

/** FM / CEO creates a receivable */
export async function createAccountReceivable(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageReceivables")) redirect("/astelfin_26/my");

  const description  = formData.get("description") as string;
  const payer        = (formData.get("payer") as string) || null;
  const amount       = parseFloat(formData.get("amount") as string);
  const currency     = (formData.get("currency") as string) || "MWK";
  const expectedDate = new Date(formData.get("expectedDate") as string);
  const projectId    = (formData.get("projectId") as string) || null;
  const note         = (formData.get("note") as string) || null;

  const ar = await prisma.accountReceivable.create({
    data: {
      description, payer, amount, currency, expectedDate, projectId, note,
      status: expectedDate < new Date() ? "OVERDUE" : "EXPECTED",
      createdBy: session.user.id!,
    },
  });

  await auditLog({
    userId: session.user.id!,
    action: "CREATE",
    entity: "AccountReceivable",
    entityId: ar.id,
    detail: `${description} — ${currency} ${amount}`,
  });

  revalidatePath("/astelfin_26/receivables");
  redirect("/astelfin_26/receivables");
}

/** FM / CEO marks a receivable as received (full or partial) */
export async function markReceivableReceived(id: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const access = await resolveAccess(session);
  if (!access || !access.can("canManageReceivables")) redirect("/astelfin_26/my");

  const partial = formData.get("partial") === "true";
  const note    = (formData.get("note") as string) || null;

  await prisma.accountReceivable.update({
    where: { id },
    data: {
      status: partial ? "PARTIAL" : "RECEIVED",
      receivedDate: new Date(),
      note: note ?? undefined,
    },
  });

  await auditLog({
    userId: session.user.id!,
    action: partial ? "PARTIAL_RECEIVED" : "RECEIVED",
    entity: "AccountReceivable",
    entityId: id,
    detail: note || undefined,
  });

  revalidatePath("/astelfin_26/receivables");
}
