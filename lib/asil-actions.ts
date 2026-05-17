"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";

type PilotDomain         = "HEALTH" | "GOVERNANCE" | "EDUCATION" | "CLIMATE";
type PilotPhase          = "DESIGN" | "IMPLEMENTATION" | "EVALUATION" | "PUBLISHED";
type EthicsClearance     = "NOT_REQUIRED" | "PENDING" | "SUBMITTED" | "CLEARED";
type KnowledgeProductType   = "LEARNING_REPORT" | "INTELLIGENCE_BRIEF" | "ANNUAL_REVIEW" | "PRACTICE_NOTE" | "WORKING_PAPER";
type KnowledgeProductStatus = "DRAFT" | "UNDER_REVIEW" | "PUBLISHED" | "ARCHIVED";
type IntelType           = "ADVISORY_IMPLICATION" | "METHODOLOGY_FINDING" | "GOVERNANCE_PATTERN" | "POLITICAL_ECONOMY" | "IMPLEMENTATION_RISK";
type IntelConfidence     = "HIGH" | "MEDIUM" | "PROVISIONAL";
type IntelTransfer       = "INTERNAL" | "TRANSFERRED" | "PUBLISHED";

// Suppress unused import warning — Prisma is used for type-checking nested writes
type _Prisma = Prisma.PilotProfileCreateInput;

// ── Create pilot (Project + PilotProfile) ─────────────────────────────────────
export async function createPilot(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const name              = formData.get("name") as string;
  const pilotCode         = formData.get("pilotCode") as string;
  const domain            = formData.get("domain") as PilotDomain;
  const phase             = (formData.get("phase") as PilotPhase) || "DESIGN";
  const context           = (formData.get("context") as string) || null;
  const theoryOfChange    = (formData.get("theoryOfChange") as string) || null;
  const ethicsClearance   = (formData.get("ethicsClearance") as EthicsClearance) || "NOT_REQUIRED";
  const methodologyNotes  = (formData.get("methodologyNotes") as string) || null;
  const startDateRaw      = formData.get("startDate") as string;
  const endDateRaw        = formData.get("endDate") as string;
  const startDate         = new Date(startDateRaw);
  const endDate           = endDateRaw ? new Date(endDateRaw) : null;
  const budget            = formData.get("budget") ? parseFloat(formData.get("budget") as string) : null;

  const learningRaw       = (formData.get("learningQuestions") as string) || "";
  const learningQuestions = learningRaw.split("\n").map((s) => s.trim()).filter(Boolean);

  const sitesRaw             = (formData.get("implementationSites") as string) || "";
  const implementationSites  = sitesRaw.split(",").map((s) => s.trim()).filter(Boolean);

  const project = await prisma.project.create({
    data: {
      name,
      client: "Astellic Social Impact Lab",
      category: "ASIL_PILOT",
      status: "ACTIVE",
      startDate,
      endDate,
      budget,
      currency: "MWK",
      pilotProfile: {
        create: {
          pilotCode,
          domain,
          phase,
          context,
          theoryOfChange,
          ethicsClearance,
          methodologyNotes,
          learningQuestions,
          implementationSites,
        },
      },
    },
    include: { pilotProfile: true },
  });

  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "PilotProfile",
    detail: `Registered pilot ${pilotCode} — ${name}`,
  });
  revalidatePath("/astelfin_26/asil");
  revalidatePath("/astelfin_26/asil/pilots");
  redirect(`/astelfin_26/asil/pilots/${project.pilotProfile!.id}`);
}

// ── Update pilot phase ─────────────────────────────────────────────────────────
export async function updatePilotPhase(pilotId: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const phase = formData.get("phase") as PilotPhase;
  await prisma.pilotProfile.update({ where: { id: pilotId }, data: { phase } });
  await auditLog({
    userId: session.user.id,
    action: "UPDATE",
    entity: "PilotProfile",
    entityId: pilotId,
    detail: `Phase advanced to ${phase}`,
  });
  revalidatePath(`/astelfin_26/asil/pilots/${pilotId}`);
  revalidatePath("/astelfin_26/asil");
}

// ── Add adaptive management log entry ─────────────────────────────────────────
export async function addAdaptiveLogEntry(pilotId: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const note    = formData.get("note") as string;
  const type    = (formData.get("type") as string) || "OBSERVATION";

  const pilot = await prisma.pilotProfile.findUnique({ where: { id: pilotId } });
  if (!pilot) return;

  const existing = Array.isArray(pilot.adaptiveManagementLog) ? pilot.adaptiveManagementLog as object[] : [];
  const newEntry = {
    id:   crypto.randomUUID(),
    date: new Date().toISOString(),
    type,
    note,
    by:   session.user.name ?? session.user.email ?? "Unknown",
  };

  await prisma.pilotProfile.update({
    where: { id: pilotId },
    data:  { adaptiveManagementLog: [...existing, newEntry] },
  });

  revalidatePath(`/astelfin_26/asil/pilots/${pilotId}`);
}

// ── Create knowledge product ───────────────────────────────────────────────────
export async function createKnowledgeProduct(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const pilotId           = (formData.get("pilotId") as string) || null;
  const title             = formData.get("title") as string;
  const productType       = formData.get("productType") as KnowledgeProductType;
  const domain            = formData.get("domain") as PilotDomain;
  const description       = (formData.get("description") as string) || null;
  const status            = (formData.get("status") as KnowledgeProductStatus) || "DRAFT";
  const isPublicFacing    = formData.get("isPublicFacing") === "true";
  const keyLearningsRaw   = (formData.get("keyLearnings") as string) || "";
  const keyLearnings      = keyLearningsRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  const advisoryRaw       = (formData.get("advisoryImplications") as string) || "";
  const advisoryImplications = advisoryRaw.split("\n").map((s) => s.trim()).filter(Boolean);
  const citationRef       = (formData.get("citationRef") as string) || null;
  const targetAudienceRaw = (formData.get("targetAudience") as string) || "";
  const targetAudience    = targetAudienceRaw.split(",").map((s) => s.trim()).filter(Boolean);

  await prisma.knowledgeProduct.create({
    data: {
      pilotId,
      title,
      productType,
      domain,
      description,
      status,
      isPublicFacing,
      keyLearnings,
      advisoryImplications,
      citationRef,
      targetAudience,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });

  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "KnowledgeProduct",
    detail: `Created: ${title}`,
  });
  revalidatePath("/astelfin_26/asil/library");
  if (pilotId) revalidatePath(`/astelfin_26/asil/pilots/${pilotId}`);
  redirect("/astelfin_26/asil/library");
}

// ── Create intelligence entry ──────────────────────────────────────────────────
export async function createIntelligenceEntry(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const pilotId        = (formData.get("pilotId") as string) || null;
  const type           = formData.get("type") as IntelType;
  const domain         = formData.get("domain") as PilotDomain;
  const content        = formData.get("content") as string;
  const confidence     = (formData.get("confidence") as IntelConfidence) || "PROVISIONAL";
  const transferStatus = (formData.get("transferStatus") as IntelTransfer) || "INTERNAL";
  const geographyRaw   = (formData.get("geography") as string) || "";
  const geography      = geographyRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const tagsRaw        = (formData.get("tags") as string) || "";
  const tags           = tagsRaw.split(",").map((s) => s.trim()).filter(Boolean);

  await prisma.intelligenceEntry.create({
    data: { pilotId, type, domain, content, confidence, transferStatus, geography, tags },
  });

  await auditLog({
    userId: session.user.id,
    action: "CREATE",
    entity: "IntelligenceEntry",
    detail: `New ${type} entry (${confidence})`,
  });
  revalidatePath("/astelfin_26/asil");
  if (pilotId) revalidatePath(`/astelfin_26/asil/pilots/${pilotId}`);
}
