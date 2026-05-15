/**
 * lib/org.ts
 * Phase 15 — Multi-entity organisation helpers.
 *
 * Active organisation resolution order:
 *   1. `astelfin_org` cookie (set when user switches entity)
 *   2. user.defaultOrgId (per-user preference)
 *   3. First active Organisation in the database (system default)
 *   4. null — no organisations exist yet (single-entity legacy mode)
 *
 * Server components: call `getActiveOrgId()` — reads the Next.js `cookies()` store.
 * API routes:        pass `req.cookies.get("astelfin_org")?.value` explicitly.
 */

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export const ORG_COOKIE = "astelfin_org";

// ── Server-component helper ───────────────────────────────────────────────────

/**
 * Resolves the active organisation ID for the current request.
 * Must be called from a Server Component or Route Handler (not Client Component).
 * Returns null when no organisations have been created yet (legacy/single-entity mode).
 */
export async function getActiveOrgId(session?: Session | null): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie  = cookieStore.get(ORG_COOKIE)?.value ?? null;

  if (fromCookie) {
    // Validate that the cookie value still refers to an active org
    const org = await prisma.organisation.findFirst({
      where: { id: fromCookie, active: true },
      select: { id: true },
    });
    if (org) return org.id;
  }

  // Fallback: user's default org
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: { defaultOrgId: true },
    });
    if (user?.defaultOrgId) {
      const org = await prisma.organisation.findFirst({
        where:  { id: user.defaultOrgId, active: true },
        select: { id: true },
      });
      if (org) return org.id;
    }
  }

  // Fallback: first active org in DB
  const first = await prisma.organisation.findFirst({
    where:   { active: true },
    orderBy: { createdAt: "asc" },
    select:  { id: true },
  });

  return first?.id ?? null;
}

/**
 * Builds a Prisma `where` clause fragment for organisation scoping.
 *
 * When `orgId` is non-null:
 *   → returns records belonging to that org OR untagged records (null organisationId).
 *     This ensures legacy records created before multi-entity was introduced are
 *     always visible.
 *
 * When `orgId` is null (no orgs exist):
 *   → returns an empty fragment → no additional filtering applied.
 */
export function orgWhere(orgId: string | null): Record<string, unknown> {
  if (!orgId) return {};
  return {
    OR: [
      { organisationId: orgId },
      { organisationId: null },
    ],
  };
}

/**
 * Builds the `organisationId` field value to write on new records.
 * Pass this directly into a Prisma create/update data object.
 */
export function orgTag(orgId: string | null): { organisationId: string | null } {
  return { organisationId: orgId };
}
