import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// ── Immutable approval chain writer ──────────────────────────────────────────
//
// Every status transition on an approvable entity (TaxRemittance, Submission,
// Liquidation, Procurement, Payroll, PerformanceCycle …) writes one row here.
//
// This table has NO updatedAt — rows are never modified after insert.
// The checksum covers all immutable fields so any DB-level tampering is detectable.
//
// Usage in a server action:
//   await writeApprovalRecord({
//     entityType:     "TaxRemittance",
//     entityId:       remittance.id,
//     decidedById:    session.user.id,
//     decidedByEmail: session.user.email,
//     decidedByName:  session.user.name,
//     decidedByRole:  session.user.role,
//     previousStatus: "PENDING_CEO",
//     newStatus:      "CEO_APPROVED",
//     decision:       "APPROVED",
//     comments:       formData.get("note") as string | null,
//     ipAddress,
//   });

export interface ApprovalRecordInput {
  entityType:     string;
  entityId:       string;
  decidedById:    string;
  decidedByEmail: string;
  decidedByName:  string;
  decidedByRole:  string;
  previousStatus: string;
  newStatus:      string;
  // SUBMITTED | APPROVED | REJECTED | CHANGES_REQUESTED | LOCKED | REINSTATED
  decision:       string;
  comments?:      string | null;
  ipAddress?:     string;
}

export async function writeApprovalRecord(input: ApprovalRecordInput): Promise<void> {
  const checksum = createHash("sha256")
    .update(
      JSON.stringify({
        entityType:     input.entityType,
        entityId:       input.entityId,
        decidedById:    input.decidedById,
        decidedByEmail: input.decidedByEmail,
        previousStatus: input.previousStatus,
        newStatus:      input.newStatus,
        decision:       input.decision,
        createdAt:      new Date().toISOString(),
      })
    )
    .digest("hex");

  await prisma.approvalRecord.create({
    data: {
      entityType:     input.entityType,
      entityId:       input.entityId,
      decidedById:    input.decidedById,
      decidedByEmail: input.decidedByEmail,
      decidedByName:  input.decidedByName,
      decidedByRole:  input.decidedByRole,
      previousStatus: input.previousStatus,
      newStatus:      input.newStatus,
      decision:       input.decision,
      comments:       input.comments,
      ipAddress:      input.ipAddress ?? "unknown",
      checksum,
    },
  });
}

// ── Query helpers for the audit UI ────────────────────────────────────────────

export async function getApprovalHistory(entityType: string, entityId: string) {
  return prisma.approvalRecord.findMany({
    where:   { entityType, entityId },
    orderBy: { createdAt: "asc" },
  });
}
