"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ConsultantQualification } from "@prisma/client";

/* ── Create roster profile ───────────────────────────────────────────────── */
export async function createRosterProfile(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const name                 = (formData.get("name") as string).trim();
  const email                = (formData.get("email") as string)?.trim() || null;
  const phone                = (formData.get("phone") as string)?.trim() || null;
  const profileSummary       = (formData.get("profileSummary") as string).trim();
  const highestQualification = (formData.get("highestQualification") as ConsultantQualification) || "MASTERS";
  const expertiseRaw         = (formData.get("areasOfExpertise") as string) || "";
  const areasOfExpertise     = expertiseRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const specialisation       = (formData.get("specialisation") as string)?.trim() || null;
  const nationality          = (formData.get("nationality") as string)?.trim() || null;
  const notes                = (formData.get("notes") as string)?.trim() || null;
  const isAvailable          = formData.get("isAvailable") !== "false";

  const profile = await prisma.consultantRoster.create({
    data: {
      name,
      email,
      phone,
      profileSummary,
      highestQualification,
      areasOfExpertise,
      specialisation,
      nationality,
      notes,
      isAvailable,
    },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "CREATE",
    entity:   "ConsultantRoster",
    entityId: profile.id,
    detail:   `Created roster profile: ${profile.name}`,
  });

  revalidatePath("/astelfin_26/consultants/roster");
  redirect("/astelfin_26/consultants/roster");
}

/* ── Update roster profile ───────────────────────────────────────────────── */
export async function updateRosterProfile(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const id                   = formData.get("id") as string;
  const name                 = (formData.get("name") as string).trim();
  const email                = (formData.get("email") as string)?.trim() || null;
  const phone                = (formData.get("phone") as string)?.trim() || null;
  const profileSummary       = (formData.get("profileSummary") as string).trim();
  const highestQualification = (formData.get("highestQualification") as ConsultantQualification) || "MASTERS";
  const expertiseRaw         = (formData.get("areasOfExpertise") as string) || "";
  const areasOfExpertise     = expertiseRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const specialisation       = (formData.get("specialisation") as string)?.trim() || null;
  const nationality          = (formData.get("nationality") as string)?.trim() || null;
  const notes                = (formData.get("notes") as string)?.trim() || null;
  const isAvailable          = formData.get("isAvailable") !== "false";

  await prisma.consultantRoster.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      profileSummary,
      highestQualification,
      areasOfExpertise,
      specialisation,
      nationality,
      notes,
      isAvailable,
    },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "UPDATE",
    entity:   "ConsultantRoster",
    entityId: id,
    detail:   `Updated roster profile: ${name}`,
  });

  revalidatePath("/astelfin_26/consultants/roster");
  revalidatePath(`/astelfin_26/consultants/roster/${id}`);
  redirect(`/astelfin_26/consultants/roster/${id}`);
}

/* ── Soft-delete roster profile (CEO only) ───────────────────────────────── */
export async function deleteRosterProfile(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const id = formData.get("id") as string;

  const profile = await prisma.consultantRoster.findUnique({ where: { id } });

  await prisma.consultantRoster.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await auditLog({
    userId:   session.user.id,
    action:   "DELETE",
    entity:   "ConsultantRoster",
    entityId: id,
    detail:   `Soft-deleted roster profile: ${profile?.name ?? id}`,
  });

  revalidatePath("/astelfin_26/consultants/roster");
  redirect("/astelfin_26/consultants/roster");
}
