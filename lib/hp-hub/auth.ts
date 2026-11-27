/**
 * Server-side authorisation for HP-Hub. Every admin page and server action
 * calls one of these; middleware is only a first, coarse filter.
 *
 * The member's role is read from the database on every call, so revoking or
 * changing a role takes effect immediately, not when the session expires.
 */
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditEvent, type AuditContext } from "@/lib/audit";
import { can, type HpCapability, type HpRoleName } from "./permissions";

export interface HpActor {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  role: HpRoleName;
}

export class HpAuthError extends Error {
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "HpAuthError";
  }
}

/** Returns the signed-in HP-Hub member, or null. */
export async function getHpActor(): Promise<HpActor | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  const member = await prisma.hpMember.findUnique({
    where: { userId },
    select: { id: true, role: true, active: true, user: { select: { name: true, email: true, active: true } } },
  });
  if (!member || !member.active || !member.user.active) return null;
  return { memberId: member.id, userId, name: member.user.name, email: member.user.email, role: member.role };
}

/** For admin pages: redirects to the HP-Hub login when not allowed. */
export async function requireHpPage(capability?: HpCapability): Promise<HpActor> {
  const actor = await getHpActor();
  if (!actor) redirect("/hp-hub/admin/login?error=no_access");
  if (capability && !can(actor.role, capability)) redirect("/hp-hub/admin?error=forbidden");
  return actor;
}

/** For server actions and route handlers: throws when not allowed. */
export async function requireHp(capability?: HpCapability): Promise<HpActor> {
  const actor = await getHpActor();
  if (!actor) throw new HpAuthError("Your session has ended. Please sign in again.");
  if (capability && !can(actor.role, capability)) throw new HpAuthError();
  return actor;
}

export async function hpAuditCtx(actor: HpActor): Promise<AuditContext> {
  const h = await headers();
  return {
    userId: actor.userId,
    userEmail: actor.email,
    userName: actor.name,
    userRole: `HP_${actor.role}`,
    ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown",
    userAgent: h.get("user-agent") ?? "unknown",
  };
}

/** Writes an HP-Hub audit event. Never blocks the action if logging fails. */
export async function hpAudit(
  actor: HpActor,
  event: Parameters<typeof auditEvent>[1],
): Promise<void> {
  try {
    await auditEvent(await hpAuditCtx(actor), event);
  } catch (err) {
    console.error("[hp-hub/audit] failed to write audit event", err);
  }
}
