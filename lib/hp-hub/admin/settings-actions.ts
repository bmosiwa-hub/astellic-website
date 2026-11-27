"use server";

/** Taxonomy and member management. */
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hpAudit, requireHp } from "../auth";
import { refreshSearchIndex } from "../documents";
import { isHpRole } from "../permissions";
import { isHttpUrl, slugify } from "../text";

const enc = encodeURIComponent;
function toTaxonomy(q: string): never {
  redirect(`/hp-hub/admin/taxonomy?${q}`);
}
function toMembers(q: string): never {
  redirect(`/hp-hub/admin/members?${q}`);
}

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);

async function reindex(where: { themes?: { some: { themeId: string } }; documentTypeId?: string; publisherId?: string }) {
  const docs = await prisma.hpDocument.findMany({ where, select: { id: true } });
  for (const d of docs) await refreshSearchIndex(prisma, d.id);
}

// ── Countries ────────────────────────────────────────────────────────────────

export async function saveCountry(formData: FormData): Promise<void> {
  const actor = await requireHp("taxonomy.manage");
  const id = str(formData, "id", 60) || null;
  const name = str(formData, "name", 100);
  const isoCode = str(formData, "isoCode", 2).toUpperCase();
  const slug = slugify(str(formData, "slug", 60) || name);
  const intro = str(formData, "intro", 2000) || null;
  const isActive = formData.get("isActive") === "on";
  if (!name || !/^[A-Z]{2}$/.test(isoCode) || !slug) toTaxonomy(`err=${enc("Country needs a name and a 2-letter ISO code.")}`);
  try {
    const c = id
      ? await prisma.hpCountry.update({ where: { id }, data: { name, isoCode, slug, intro, isActive } })
      : await prisma.hpCountry.create({ data: { name, isoCode, slug, intro, isActive, sortOrder: (await prisma.hpCountry.count()) + 1 } });
    await hpAudit(actor, { action: id ? "UPDATE" : "CREATE", entityType: "HpCountry", entityId: c.id, newValue: c });
  } catch {
    toTaxonomy(`err=${enc("That name, slug or ISO code is already used.")}`);
  }
  revalidatePath("/hp-hub", "layout");
  toTaxonomy(`ok=${enc("Country saved.")}#countries`);
}

// ── Themes ───────────────────────────────────────────────────────────────────

export async function saveTheme(formData: FormData): Promise<void> {
  const actor = await requireHp("taxonomy.manage");
  const id = str(formData, "id", 60) || null;
  const name = str(formData, "name", 120);
  const description = str(formData, "description", 1000) || null;
  const isActive = formData.get("isActive") === "on" || !id;
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  if (!name) toTaxonomy(`err=${enc("Theme needs a name.")}`);
  try {
    if (id) {
      // Slugs stay stable once created so public URLs don't break.
      const t = await prisma.hpTheme.update({ where: { id }, data: { name, description, isActive, sortOrder } });
      await hpAudit(actor, { action: "UPDATE", entityType: "HpTheme", entityId: id, newValue: t });
      await reindex({ themes: { some: { themeId: id } } });
    } else {
      const t = await prisma.hpTheme.create({ data: { name, slug: slugify(name), description, sortOrder: sortOrder || (await prisma.hpTheme.count()) + 1 } });
      await hpAudit(actor, { action: "CREATE", entityType: "HpTheme", entityId: t.id, newValue: t });
    }
  } catch {
    toTaxonomy(`err=${enc("A theme with that name already exists.")}`);
  }
  revalidatePath("/hp-hub", "layout");
  toTaxonomy(`ok=${enc("Theme saved.")}#themes`);
}

// ── Document types ───────────────────────────────────────────────────────────

export async function saveDocumentType(formData: FormData): Promise<void> {
  const actor = await requireHp("taxonomy.manage");
  const id = str(formData, "id", 60) || null;
  const name = str(formData, "name", 120);
  const description = str(formData, "description", 1000) || null;
  const sortOrder = Number(formData.get("sortOrder")) || 0;
  if (!name) toTaxonomy(`err=${enc("Type needs a name.")}`);
  try {
    if (id) {
      const t = await prisma.hpDocumentType.update({ where: { id }, data: { name, description, sortOrder } });
      await hpAudit(actor, { action: "UPDATE", entityType: "HpDocumentType", entityId: id, newValue: t });
      await reindex({ documentTypeId: id });
    } else {
      const t = await prisma.hpDocumentType.create({ data: { name, slug: slugify(name), description, sortOrder: sortOrder || (await prisma.hpDocumentType.count()) + 1 } });
      await hpAudit(actor, { action: "CREATE", entityType: "HpDocumentType", entityId: t.id, newValue: t });
    }
  } catch {
    toTaxonomy(`err=${enc("A document type with that name already exists.")}`);
  }
  revalidatePath("/hp-hub", "layout");
  toTaxonomy(`ok=${enc("Document type saved.")}#types`);
}

// ── Publishers ───────────────────────────────────────────────────────────────

export async function savePublisher(formData: FormData): Promise<void> {
  const actor = await requireHp("taxonomy.manage");
  const id = str(formData, "id", 60);
  const name = str(formData, "name", 300);
  const acronym = str(formData, "acronym", 30) || null;
  const website = str(formData, "website", 500) || null;
  if (!id || !name) toTaxonomy(`err=${enc("Publisher needs a name.")}`);
  if (website && !isHttpUrl(website)) toTaxonomy(`err=${enc("Website must start with http:// or https://")}`);
  try {
    const p = await prisma.hpPublisher.update({ where: { id }, data: { name, acronym, website } });
    await hpAudit(actor, { action: "UPDATE", entityType: "HpPublisher", entityId: id, newValue: p });
    await reindex({ publisherId: id });
  } catch {
    toTaxonomy(`err=${enc("Another publisher already has that name.")}`);
  }
  revalidatePath("/hp-hub", "layout");
  toTaxonomy(`ok=${enc("Publisher saved.")}#publishers`);
}

/** Merges a duplicate publisher into another, moving all its records. */
export async function mergePublisher(formData: FormData): Promise<void> {
  const actor = await requireHp("taxonomy.manage");
  const fromId = str(formData, "id", 60);
  const intoId = str(formData, "into", 60);
  if (!fromId || !intoId || fromId === intoId) toTaxonomy(`err=${enc("Choose a different publisher to merge into.")}`);
  await prisma.$transaction([
    prisma.hpDocument.updateMany({ where: { publisherId: fromId }, data: { publisherId: intoId } }),
    prisma.hpAcquisitionItem.updateMany({ where: { publisherId: fromId }, data: { publisherId: intoId } }),
    prisma.hpPublisher.delete({ where: { id: fromId } }),
  ]);
  await reindex({ publisherId: intoId });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpPublisher", entityId: intoId, detail: `Merged publisher ${fromId} into ${intoId}` });
  revalidatePath("/hp-hub", "layout");
  toTaxonomy(`ok=${enc("Publishers merged.")}#publishers`);
}

// ── Members & access ─────────────────────────────────────────────────────────

/** Grants (or changes) HP-Hub access for an existing account, by email. */
export async function grantMember(formData: FormData): Promise<void> {
  const actor = await requireHp("members.manage");
  const email = str(formData, "email", 254).toLowerCase();
  const role = str(formData, "role", 20);
  if (!isHpRole(role)) toMembers(`err=${enc("Choose a role.")}`);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) toMembers(`err=${enc("No account with that email. Create an HP-Hub-only account below.")}`);
  const m = await prisma.hpMember.upsert({
    where: { userId: user.id },
    update: { role, active: true },
    create: { userId: user.id, role, grantedById: actor.memberId },
  });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpMember", entityId: m.id, newValue: { email, role, active: true }, detail: "HP-Hub access granted" });
  toMembers(`ok=${enc(`${email} now has HP-Hub access.`)}`);
}

/**
 * Creates an account that can use HP-Hub only (no Astelfin access). Returns a
 * one-time temporary password the admin passes on securely; the user must
 * change it at first sign-in.
 */
export interface CreateAccountState {
  error?: string;
  created?: { email: string; tempPassword: string };
}

export async function createHpOnlyAccount(_prev: CreateAccountState, formData: FormData): Promise<CreateAccountState> {
  let actor;
  try {
    actor = await requireHp("members.manage");
  } catch (e) {
    return { error: (e as Error).message };
  }
  const name = str(formData, "name", 200);
  const email = str(formData, "email", 254).toLowerCase();
  const role = str(formData, "role", 20);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a name and a valid email." };
  if (!isHpRole(role)) return { error: "Choose a role." };
  if (await prisma.user.findUnique({ where: { email } })) return { error: "An account with that email exists; grant it access instead." };

  const temp = randomBytes(12).toString("base64url");
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(temp, 12),
      role: "STAFF",
      astelfinAccess: false,
      mustChangePassword: true,
      permissions: {}, // no Astelfin tabs even if Astelfin access is granted later
      hpMember: { create: { role, grantedById: actor.memberId } },
    },
  });
  await hpAudit(actor, { action: "CREATE", entityType: "User", entityId: user.id, newValue: { name, email, role, astelfinAccess: false }, detail: "HP-Hub-only account created" });
  revalidatePath("/hp-hub/admin/members");
  // Returned to the form once (never put in a URL or stored in plain text).
  return { created: { email, tempPassword: temp } };
}

export async function updateMember(formData: FormData): Promise<void> {
  const actor = await requireHp("members.manage");
  const id = str(formData, "id", 60);
  const role = str(formData, "role", 20);
  const active = formData.get("active") === "on";
  const m = await prisma.hpMember.findUnique({ where: { id } });
  if (!m) toMembers("");
  if (!isHpRole(role)) toMembers(`err=${enc("Choose a role.")}`);
  if (m.id === actor.memberId && (!active || role !== "SUPER_ADMIN")) toMembers(`err=${enc("You can't remove your own Super Admin access.")}`);
  if (m.role === "SUPER_ADMIN" && (role !== "SUPER_ADMIN" || !active)) {
    const others = await prisma.hpMember.count({ where: { role: "SUPER_ADMIN", active: true, id: { not: id } } });
    if (!others) toMembers(`err=${enc("Keep at least one active Super Admin.")}`);
  }
  await prisma.hpMember.update({ where: { id }, data: { role, active } });
  await hpAudit(actor, { action: "UPDATE", entityType: "HpMember", entityId: id, previousValue: { role: m.role, active: m.active }, newValue: { role, active } });
  toMembers(`ok=${enc("Member updated.")}`);
}
