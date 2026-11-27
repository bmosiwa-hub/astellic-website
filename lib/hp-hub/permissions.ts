/**
 * HP-Hub role-based permissions. Pure functions — no I/O — so they can be unit
 * tested and used on both server and client. The server is the only place
 * they are *enforced* (lib/hp-hub/auth.ts); the client uses them only to hide
 * controls the user can't use.
 */

export type HpRoleName = "SUPER_ADMIN" | "REPO_ADMIN" | "EDITOR" | "CONTRIBUTOR";

export type HpCapability =
  | "document.create"
  | "document.editAny" // edit records created by others / after review
  | "document.verify"
  | "document.publish" // publish, unpublish, archive, feature
  | "document.delete"
  | "taxonomy.manage" // countries, themes, types, publishers
  | "import.csv"
  | "submission.review"
  | "feedback.review"
  | "acquisition.edit"
  | "outreach.manage"
  | "analytics.view"
  | "members.manage";

const RANK: Record<HpRoleName, number> = {
  CONTRIBUTOR: 1,
  EDITOR: 2,
  REPO_ADMIN: 3,
  SUPER_ADMIN: 4,
};

const MIN_ROLE: Record<HpCapability, HpRoleName> = {
  "document.create": "CONTRIBUTOR",
  "acquisition.edit": "CONTRIBUTOR",
  "analytics.view": "CONTRIBUTOR",
  "document.editAny": "EDITOR",
  "document.verify": "EDITOR",
  "submission.review": "EDITOR",
  "feedback.review": "EDITOR",
  "outreach.manage": "EDITOR",
  "document.publish": "REPO_ADMIN",
  "document.delete": "REPO_ADMIN",
  "taxonomy.manage": "REPO_ADMIN",
  "import.csv": "REPO_ADMIN",
  "members.manage": "SUPER_ADMIN",
};

export function isHpRole(value: unknown): value is HpRoleName {
  return typeof value === "string" && value in RANK;
}

export function can(role: HpRoleName | null | undefined, capability: HpCapability): boolean {
  if (!role || !isHpRole(role)) return false;
  return RANK[role] >= RANK[MIN_ROLE[capability]];
}

/**
 * Whether a member may edit a specific document. Contributors may only edit
 * their own records, and only while they are still drafts.
 */
export function canEditDocument(
  role: HpRoleName | null | undefined,
  memberId: string,
  doc: { createdById: string | null; status: string },
): boolean {
  if (can(role, "document.editAny")) return true;
  if (!can(role, "document.create")) return false;
  return doc.createdById === memberId && doc.status === "DRAFT";
}

/** Status transitions each role may make. Publishing-related moves need REPO_ADMIN. */
export function canTransition(
  role: HpRoleName | null | undefined,
  from: string,
  to: string,
): boolean {
  if (from === to) return true;
  if (to === "PUBLISHED" || to === "ARCHIVED" || from === "PUBLISHED" || from === "ARCHIVED") {
    return can(role, "document.publish");
  }
  // DRAFT <-> PENDING_REVIEW
  if (to === "PENDING_REVIEW") return can(role, "document.create");
  if (to === "DRAFT") return can(role, "document.editAny") || from === "PENDING_REVIEW";
  return false;
}

/** Roles a member may assign: Super Admins may assign any role. */
export function assignableRoles(role: HpRoleName | null | undefined): HpRoleName[] {
  return can(role, "members.manage") ? ["SUPER_ADMIN", "REPO_ADMIN", "EDITOR", "CONTRIBUTOR"] : [];
}
