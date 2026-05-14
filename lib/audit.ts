import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// ── Helpers ───────────────────────────────────────────────────────────────────

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

function computeEventChecksum(fields: {
  createdAt:    string;
  userId:       string | null;
  userEmail:    string;
  action:       string;
  entityType:   string;
  entityId:     string | null;
  previousValue?: unknown;
  newValue?:    unknown;
}): string {
  return sha256(JSON.stringify(fields));
}

// ── Context type — passed from server actions ─────────────────────────────────
// Server actions call `await auditEvent(ctx, {...})` after every write.
// The ctx comes from the session + request headers.

export interface AuditContext {
  userId:    string;
  userEmail: string;
  userName:  string;
  userRole:  string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
}

// ── Build context from a session object ───────────────────────────────────────
// Usage in server actions:
//   const ctx = auditCtx(session, headersList);

export function auditCtx(
  session: { user: { id: string; name?: string | null; email?: string | null; role?: string } },
  headers?: Headers | null,
): AuditContext {
  return {
    userId:    session.user.id,
    userEmail: session.user.email  ?? "unknown",
    userName:  session.user.name   ?? "unknown",
    userRole:  session.user.role   ?? "unknown",
    ipAddress: headers?.get("x-forwarded-for")?.split(",")[0]?.trim()
              ?? headers?.get("x-real-ip")
              ?? "unknown",
    userAgent: headers?.get("user-agent") ?? "unknown",
  };
}

// ── Core event writer ─────────────────────────────────────────────────────────
// This replaces the old auditLog() call. All server actions should call this.

export async function auditEvent(
  ctx: AuditContext,
  event: {
    action:        string;       // CREATE | UPDATE | DELETE | APPROVE | REJECT | SUBMIT | EXPORT | LOCK
    entityType:    string;       // Prisma model name, e.g. "TaxRemittance"
    entityId?:     string;
    previousValue?: unknown;     // full record snapshot BEFORE change
    newValue?:     unknown;      // full record snapshot AFTER change
    changedFields?: string[];    // list of field names that changed
    detail?:       string;
  },
): Promise<void> {
  const now = new Date().toISOString();

  const checksum = computeEventChecksum({
    createdAt:     now,
    userId:        ctx.userId,
    userEmail:     ctx.userEmail,
    action:        event.action,
    entityType:    event.entityType,
    entityId:      event.entityId ?? null,
    previousValue: event.previousValue,
    newValue:      event.newValue,
  });

  await prisma.auditEvent.create({
    data: {
      userId:        ctx.userId,
      userEmail:     ctx.userEmail,
      userName:      ctx.userName,
      userRole:      ctx.userRole,
      ipAddress:     ctx.ipAddress,
      userAgent:     ctx.userAgent,
      sessionId:     ctx.sessionId,
      action:        event.action,
      entityType:    event.entityType,
      entityId:      event.entityId,
      previousValue: event.previousValue ? (event.previousValue as object) : undefined,
      newValue:      event.newValue      ? (event.newValue      as object) : undefined,
      changedFields: event.changedFields ?? [],
      detail:        event.detail,
      checksum,
    },
  });
}

// ── Diff helper — call before+after a prisma.update() ────────────────────────
// Returns the list of field names that changed between two snapshots.

export function diffFields(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  const changed: string[] = [];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changed.push(key);
    }
  }
  return changed;
}

// ── Legacy wrapper (backward-compat with existing auditLog() calls) ───────────
// Gradually migrate callers to auditEvent(). This keeps old calls working.

export async function auditLog({
  userId,
  action,
  entity,
  entityId,
  detail,
}: {
  userId:    string;
  action:    string;
  entity:    string;
  entityId?: string;
  detail?:   string;
}): Promise<void> {
  // Write to the legacy AuditLog table (backward compat)
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, detail },
  });

  // Also write to the new AuditEvent table — look up user details first
  try {
    const user = await prisma.user.findUnique({
      where:  { id: userId },
      select: { name: true, email: true, role: true },
    });

    const checksum = computeEventChecksum({
      createdAt:  new Date().toISOString(),
      userId,
      userEmail:  user?.email ?? "unknown",
      action,
      entityType: entity,
      entityId:   entityId ?? null,
    });

    await prisma.auditEvent.create({
      data: {
        userId,
        userEmail:    user?.email ?? "unknown",
        userName:     user?.name  ?? "unknown",
        userRole:     user?.role  ?? "unknown",
        action,
        entityType:   entity,
        entityId,
        detail,
        checksum,
      },
    });
  } catch {
    // Don't let audit failures break the main operation — log to stderr
    console.error("[audit] Failed to write AuditEvent for legacy auditLog call");
  }
}

// ── Soft-delete helper ────────────────────────────────────────────────────────
// Call instead of prisma.<model>.delete(). Requires ctx so the deletion is
// attributed to a named user with a reason.

export async function softDelete<T extends object>(
  ctx:    AuditContext,
  model:  {
    update: (args: {
      where: { id: string };
      data:  { deletedAt: Date; deletedBy: string; deletionReason: string | null };
    }) => Promise<T>;
  },
  id:     string,
  entityType: string,
  reason?: string,
): Promise<T> {
  const record = await model.update({
    where: { id },
    data: {
      deletedAt:      new Date(),
      deletedBy:      ctx.userId,
      deletionReason: reason ?? null,
    },
  });

  await auditEvent(ctx, {
    action:     "DELETE",
    entityType,
    entityId:   id,
    detail:     reason ? `Soft-deleted: ${reason}` : "Soft-deleted",
  });

  return record;
}
