// ── Self-approval prevention ──────────────────────────────────────────────────
//
// Donor governance standards (USAID ADS, Global Fund LFA, ISO internal controls)
// prohibit the same person from both initiating and approving a transaction.
//
// Call assertNotSelfApproval() at the top of every approval server action.
// It throws a structured error that the UI can catch and display.
//
// Usage:
//   assertNotSelfApproval(session.user.id, remittance.submittedById, "tax remittance");

export class SelfApprovalError extends Error {
  constructor(entityLabel: string) {
    super(
      `You submitted this ${entityLabel} and cannot approve it. ` +
      `A different authorised user must review it. This restriction is required for donor compliance.`
    );
    this.name = "SelfApprovalError";
  }
}

/**
 * Throws SelfApprovalError if the approver is the same person who initiated
 * the transaction. Call this before writing any approval to the database.
 *
 * @param approverId   - session.user.id of the person clicking Approve/Reject
 * @param initiatorId  - userId of whoever created/submitted the entity
 * @param entityLabel  - human label for error messages, e.g. "tax remittance"
 */
export function assertNotSelfApproval(
  approverId:  string,
  initiatorId: string,
  entityLabel: string,
): void {
  if (approverId === initiatorId) {
    throw new SelfApprovalError(entityLabel);
  }
}

/**
 * Returns true if the approver IS the initiator (use for UI disabling).
 * Prefer assertNotSelfApproval() in server actions for hard enforcement.
 */
export function isSelfApproval(approverId: string, initiatorId: string): boolean {
  return approverId === initiatorId;
}
