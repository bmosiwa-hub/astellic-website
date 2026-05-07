"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ThematicArea, ProjectType } from "@prisma/client";

type MemberInput    = { name: string; email?: string; role: string; budgetedFee?: string };
type MilestoneInput = { title: string; description?: string; deliveryDate: string; paymentExpected?: string; currency: string; feePercentage?: string };

/* ── Create project ──────────────────────────────────────────────── */
export async function createProject(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "PROJECT_MANAGER") redirect("/astelfin_26/dashboard");

  const name           = formData.get("name") as string;
  const client         = formData.get("client") as string;
  const description    = (formData.get("description") as string) || null;
  const status         = (formData.get("status") as "ACTIVE") || "ACTIVE";
  const category       = (formData.get("category") as string) || "REGULAR";
  const thematicArea   = (formData.get("thematicArea") as ThematicArea) || null;
  const projectType    = (formData.get("projectType") as ProjectType) || null;
  const projectLead    = (formData.get("projectLead") as string) || null;
  const startDate      = new Date(formData.get("startDate") as string);
  const endDate        = (formData.get("endDate") as string) ? new Date(formData.get("endDate") as string) : null;
  const budget         = formData.get("budget")         ? parseFloat(formData.get("budget") as string)         : null;
  const currency       = (formData.get("currency") as string) || "MWK";
  const projectLeadFee = formData.get("projectLeadFee") ? parseFloat(formData.get("projectLeadFee") as string) : null;
  const managementFee  = formData.get("managementFee")  ? parseFloat(formData.get("managementFee")  as string) : null;
  const personnelCosts = formData.get("personnelCosts")  ? parseFloat(formData.get("personnelCosts")  as string) : null;
  const fieldworkCosts = formData.get("fieldworkCosts")  ? parseFloat(formData.get("fieldworkCosts")  as string) : null;

  const oppId         = (formData.get("oppId") as string) || null;
  const membersRaw    = (formData.get("members") as string) || "[]";
  const milestonesRaw = (formData.get("milestones") as string) || "[]";
  const members:    MemberInput[]    = JSON.parse(membersRaw);
  const milestones: MilestoneInput[] = JSON.parse(milestonesRaw);

  // For consultancy milestones, derive paymentExpected from feePercentage × personnelCosts
  const resolvedPersonnelCosts = personnelCosts ?? 0;

  const project = await prisma.project.create({
    data: {
      name, client, description, status, category, thematicArea, projectType, projectLead,
      startDate, endDate, budget, currency,
      projectLeadFee, managementFee, personnelCosts, fieldworkCosts,
      members: members.length > 0 ? {
        create: members.map((m) => ({
          name:        m.name,
          email:       m.email || null,
          role:        m.role,
          budgetedFee: m.budgetedFee ? parseFloat(m.budgetedFee) : null,
        })),
      } : undefined,
      milestones: milestones.length > 0 ? {
        create: milestones.map((m, i) => {
          const feePct = m.feePercentage ? parseFloat(m.feePercentage) : null;
          // For consultancy: auto-calculate paymentExpected from fee percentage
          const paymentExpected = feePct && category === "CONSULTANCY"
            ? resolvedPersonnelCosts * (feePct / 100)
            : (m.paymentExpected ? parseFloat(m.paymentExpected) : null);
          return {
            title:           m.title,
            description:     m.description || null,
            deliveryDate:    new Date(m.deliveryDate),
            paymentExpected,
            currency:        m.currency || currency,
            order:           i,
            feePercentage:   feePct,
          };
        }),
      } : undefined,
    },
  });

  // Link to source opportunity if coming from a Won bid
  if (oppId) {
    await prisma.opportunity.update({
      where: { id: oppId },
      data:  { linkedProjectId: project.id },
    });
  }

  await auditLog({ userId: session.user.id!, action: "CREATE", entity: "Project", entityId: project.id, detail: name });
  revalidatePath("/astelfin_26/projects");
  redirect("/astelfin_26/projects");
}

/* ── Request milestone completion (staff / consultant) ───────────── */
export async function requestMilestoneCompletion(milestoneId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status:      "COMPLETION_REQUESTED",
      completedBy: session.user.id!,
      completedAt: new Date(),
    },
  });

  await auditLog({ userId: session.user.id!, action: "COMPLETION_REQUESTED", entity: "Milestone", entityId: milestoneId });
  revalidatePath("/astelfin_26/deliverables");
  revalidatePath("/astelfin_26/projects");
}

/* ── Approve milestone (Project Manager / CEO) ───────────────────── */
export async function approveMilestone(milestoneId: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "PROJECT_MANAGER") redirect("/astelfin_26/dashboard");

  const milestone = await prisma.milestone.findUniqueOrThrow({
    where: { id: milestoneId },
    include: { project: { select: { name: true, client: true, currency: true } } },
  });

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: "APPROVED", approvedBy: session.user.id!, approvedAt: new Date() },
  });

  // Create AccountReceivable entry if payment is expected
  if (milestone.paymentExpected && milestone.paymentExpected > 0) {
    const ar = await prisma.accountReceivable.create({
      data: {
        description:  `${milestone.project.name} — ${milestone.title}`,
        payer:        milestone.project.client,
        amount:       milestone.paymentExpected,
        currency:     milestone.currency,
        expectedDate: milestone.deliveryDate,
        status:       "EXPECTED",
        projectId:    milestone.projectId,
        milestoneId:  milestone.id,
        createdBy:    session.user.id!,
      },
    });
    await auditLog({ userId: session.user.id!, action: "CREATE", entity: "AccountReceivable", entityId: ar.id, detail: `From milestone: ${milestone.title}` });
  }

  await auditLog({ userId: session.user.id!, action: "APPROVED", entity: "Milestone", entityId: milestoneId });
  revalidatePath("/astelfin_26/deliverables");
  revalidatePath("/astelfin_26/receivables");
  revalidatePath("/astelfin_26/projects");
}

/* ── Reject milestone (Project Manager / CEO) ────────────────────── */
export async function rejectMilestone(milestoneId: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "PROJECT_MANAGER") redirect("/astelfin_26/dashboard");

  const note = (formData.get("note") as string) || null;

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      status:        "REJECTED",
      rejectionNote: note,
      approvedBy:    session.user.id!,
      approvedAt:    new Date(),
    },
  });

  await auditLog({ userId: session.user.id!, action: "REJECTED", entity: "Milestone", entityId: milestoneId, detail: note || undefined });
  revalidatePath("/astelfin_26/deliverables");
  revalidatePath("/astelfin_26/projects");
}
