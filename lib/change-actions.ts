"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type Entity = "Income" | "Expense";

/** Build a human-readable summary from a record snapshot for audit logs. */
function snapshotSummary(snapshot: object): string {
  const s = snapshot as Record<string, unknown>;
  // description covers Income & Expense; lender covers Debt
  const desc     = (s.description as string) || (s.lender as string) || "record";
  const amount   = s.amount ?? s.principal;         // Income/Expense use amount; Debt uses principal
  const currency = (s.currency as string) || "MWK";
  if (amount !== undefined && amount !== null) {
    const formatted = Number(amount).toLocaleString("en-MW", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `${desc} — ${currency} ${formatted}`;
  }
  return desc;
}

/**
 * Delete a transaction.
 * - CEO: deletes immediately and writes an audit log.
 * - Finance Manager: creates a PendingChange for CEO approval.
 */
export async function requestDeleteChange(entity: Entity, entityId: string) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  // Always capture a snapshot first
  let snapshot: object;
  if (entity === "Income") {
    snapshot = (await prisma.income.findUniqueOrThrow({ where: { id: entityId } })) as object;
  } else {
    snapshot = (await prisma.expense.findUniqueOrThrow({ where: { id: entityId } })) as object;
  }

  if (session.user.role === "CEO") {
    // Apply immediately
    if (entity === "Income") {
      await prisma.income.delete({ where: { id: entityId } });
    } else {
      await prisma.expense.delete({ where: { id: entityId } });
    }
    await auditLog({
      userId: session.user.id!,
      action: "DELETE",
      entity,
      entityId,
      detail: `Deleted by CEO — ${snapshotSummary(snapshot)}`,
    });
  } else {
    // Guard: don't duplicate pending changes
    const existing = await prisma.pendingChange.findFirst({
      where: { entityId, entity, status: "PENDING" },
    });
    if (!existing) {
      await prisma.pendingChange.create({
        data: {
          entity,
          entityId,
          changeType: "DELETE",
          requestedBy: session.user.id!,
          snapshot,
        },
      });
    }
    await auditLog({
      userId: session.user.id!,
      action: "REQUEST_DELETE",
      entity,
      entityId,
      detail: `Delete requested — ${snapshotSummary(snapshot)}`,
    });
  }

  revalidatePath(`/astelfin_26/${entity === "Income" ? "income" : "expenses"}`);
}

/**
 * CEO approves a pending change.
 * FormData may contain an optional `reviewNote` field.
 */
export async function approveChange(changeId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/login");

  const reviewNote = (formData.get("reviewNote") as string) || null;
  const change = await prisma.pendingChange.findUniqueOrThrow({ where: { id: changeId } });

  if (change.status !== "PENDING") {
    revalidatePath("/astelfin_26/approvals");
    return;
  }

  try {
    if (change.changeType === "DELETE") {
      if (change.entity === "Income") {
        await prisma.income.delete({ where: { id: change.entityId } });
      } else if (change.entity === "Expense") {
        await prisma.expense.delete({ where: { id: change.entityId } });
      }
    } else {
      // EDIT — apply proposed values
      const p = change.proposed as Record<string, unknown>;
      if (change.entity === "Income") {
        await prisma.income.update({
          where: { id: change.entityId },
          data: {
            incomeType: p.incomeType as "GRANT" | "PRIVATE_SERVICE" | "DONATION",
            description: p.description as string,
            amount: Number(p.amount),
            currency: p.currency as string,
            receivedDate: new Date(p.receivedDate as string),
            source: (p.source as string) || null,
            invoiceNumber: (p.invoiceNumber as string) || null,
            projectId: (p.projectId as string) || null,
            notes: (p.notes as string) || null,
          },
        });
      } else if (change.entity === "Expense") {
        await prisma.expense.update({
          where: { id: change.entityId },
          data: {
            description: p.description as string,
            amount: Number(p.amount),
            currency: p.currency as string,
            category: p.category as string,
            paidDate: new Date(p.paidDate as string),
            vendor: (p.vendor as string) || null,
            receiptRef: (p.receiptRef as string) || null,
            projectId: (p.projectId as string) || null,
            notes: (p.notes as string) || null,
          },
        });
      }
    }
  } catch {
    // Record may have been deleted by another action — still mark approved
  }

  await prisma.pendingChange.update({
    where: { id: changeId },
    data: {
      status: "APPROVED",
      approvedBy: session.user.id,
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  const approvedSummary = snapshotSummary(change.snapshot as object);
  await auditLog({
    userId: session.user.id!,
    action: "APPROVED",
    entity: change.entity,
    entityId: change.entityId,
    detail: `${change.changeType} approved — ${approvedSummary}${reviewNote ? ` · ${reviewNote}` : ""}`,
  });

  revalidatePath("/astelfin_26/approvals");
  revalidatePath(`/astelfin_26/${change.entity === "Income" ? "income" : "expenses"}`);
}

/** CEO rejects a pending change. */
export async function rejectChange(changeId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/login");

  const reviewNote = (formData.get("reviewNote") as string) || null;
  const change = await prisma.pendingChange.findUniqueOrThrow({ where: { id: changeId } });

  await prisma.pendingChange.update({
    where: { id: changeId },
    data: {
      status: "REJECTED",
      approvedBy: session.user.id,
      reviewedAt: new Date(),
      reviewNote,
    },
  });

  await auditLog({
    userId: session.user.id!,
    action: "REJECTED",
    entity: change.entity,
    entityId: change.entityId,
    detail: `${change.changeType} request rejected${reviewNote ? ` — ${reviewNote}` : ""}`,
  });

  revalidatePath("/astelfin_26/approvals");
}
