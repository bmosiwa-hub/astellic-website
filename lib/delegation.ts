/**
 * Phase 12 — Approval Delegation
 *
 * CEO can grant another user temporary authority to act on CEO-only approval
 * flows. `checkCEOAuth` is the single choke-point for all CEO-gated server
 * actions; call it instead of a raw `session.user.role !== "CEO"` check.
 *
 * Usage in a server action:
 *   const { authorized, isDelegate, delegatorName } = await checkCEOAuth(session);
 *   if (!authorized) redirect("/astelfin_26/dashboard");
 *
 * In audit log detail, append:
 *   isDelegate ? ` (delegated by ${delegatorName})` : ""
 */

import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export interface CEOAuthResult {
  /** True when the acting user is the CEO or an active delegate. */
  authorized:    boolean;
  /** True when acting via delegation rather than the real CEO role. */
  isDelegate:    boolean;
  /** ID of the CEO who granted the delegation, or null. */
  delegatorId:   string | null;
  /** Display name of the delegating CEO for audit entries. */
  delegatorName: string | null;
}

/**
 * Check whether the session user is authorised to take CEO-gated actions.
 * Returns `authorized: true` when the user is the CEO, or has an active
 * delegation whose date range covers today.
 */
export async function checkCEOAuth(session: Session | null): Promise<CEOAuthResult> {
  const NONE: CEOAuthResult = {
    authorized: false, isDelegate: false, delegatorId: null, delegatorName: null,
  };

  if (!session?.user?.id) return NONE;

  // CEO always passes.
  if (session.user.role === "CEO") {
    return { authorized: true, isDelegate: false, delegatorId: null, delegatorName: null };
  }

  // Look for an active delegation covering today.
  const now = new Date();
  const delegation = await prisma.approvalDelegation.findFirst({
    where: {
      delegateeId: session.user.id,
      isActive:    true,
      startDate:   { lte: now },
      endDate:     { gte: now },
    },
    include: {
      delegator: { select: { id: true, name: true } },
    },
    orderBy: { startDate: "desc" }, // newest wins if multiple
  });

  if (delegation) {
    return {
      authorized:    true,
      isDelegate:    true,
      delegatorId:   delegation.delegatorId,
      delegatorName: delegation.delegator.name,
    };
  }

  return NONE;
}

/**
 * Build the suffix appended to audit log detail lines when an action is
 * performed by a delegate rather than the CEO directly.
 *
 * Returns "" when acting as the real CEO; returns " (delegated by <name>)"
 * when acting under delegation.
 */
export function delegateNote(result: CEOAuthResult): string {
  return result.isDelegate && result.delegatorName
    ? ` (delegated by ${result.delegatorName})`
    : "";
}
