/**
 * Access helpers — the single, permission-driven way to gate pages and actions.
 *
 * Principle: the CEO always has full access; everyone else is governed entirely
 * by CEO-granted permissions. Critical approvals stay CEO-only (use `access.isCEO`).
 *
 * Usage in a Server Component / action:
 *   const access = await resolveAccess();
 *   if (!access) redirect("/astelfin_26/login");
 *   if (!access.can("canManagePayables")) redirect("/astelfin_26/my");
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEffectivePermissions } from "@/lib/permissions";
import type { EffectivePermissions, FunctionPermissions, TabPermissions } from "@/lib/permissions";
import type { Session } from "next-auth";

export interface Access {
  session: Session;
  userId:  string;
  role:    string;
  isCEO:   boolean;
  perms:   EffectivePermissions;
  /** Holds a specific function permission (CEO always true). */
  can:  (fn: keyof FunctionPermissions) => boolean;
  /** Has a section/tab granted (CEO always true). */
  tab:  (t: keyof TabPermissions) => boolean;
}

/**
 * Resolve the current user's access context. Returns null when unauthenticated.
 * Fetches stored permissions once so callers don't each hit the DB.
 */
export async function resolveAccess(session?: Session | null): Promise<Access | null> {
  const s = session ?? (await auth());
  if (!s?.user?.id) return null;

  const role = s.user.role ?? "";
  const isCEO = role === "CEO";

  let perms: EffectivePermissions;
  if (isCEO) {
    perms = getEffectivePermissions("CEO", null);
  } else {
    const dbUser = await prisma.user.findUnique({
      where:  { id: s.user.id },
      select: { permissions: true },
    });
    perms = getEffectivePermissions(role, dbUser?.permissions ?? null);
  }

  return {
    session: s,
    userId:  s.user.id,
    role,
    isCEO,
    perms,
    can: (fn) => isCEO || !!perms.functions[fn],
    tab: (t) => isCEO || !!perms.tabs[t],
  };
}
