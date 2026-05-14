"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { auditLog } from "@/lib/audit";
import { sendMail } from "@/lib/mail";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const BASE_URL = process.env.NEXTAUTH_URL ?? "https://astellic.com";

// ── Helpers ───────────────────────────────────────────────────────────────────

async function getSupervisorEmail(employeeId: string): Promise<string | null> {
  const emp = await prisma.employee.findUnique({
    where:   { id: employeeId },
    include: { supervisor: { select: { id: true } } },
  });
  if (!emp?.supervisorId) return null;
  const supUser = await prisma.user.findFirst({
    where:  { employeeId: emp.supervisorId, active: true },
    select: { email: true },
  });
  return supUser?.email ?? null;
}

async function getCEOEmails(): Promise<string[]> {
  const ceos = await prisma.user.findMany({
    where:  { role: "CEO", active: true },
    select: { email: true },
  });
  return ceos.map((u) => u.email);
}

// ── Create performance cycle ──────────────────────────────────────────────────

export async function createPerformanceCycle(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const employeeId = formData.get("employeeId") as string;
  const cycleType  = formData.get("cycleType")  as string;
  const year       = parseInt(formData.get("year") as string);
  const startDate  = new Date(formData.get("startDate") as string);
  const endDate    = new Date(formData.get("endDate")   as string);

  // Only FM, CEO, or the employee themselves (via STAFF role) can create
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER" && role !== "STAFF") {
    redirect("/astelfin_26/dashboard");
  }

  // STAFF can only create for themselves
  if (role === "STAFF") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { employeeId: true } });
    if (user?.employeeId !== employeeId) redirect("/astelfin_26/my/performance");
  }

  const cycle = await prisma.performanceCycle.create({
    data: { employeeId, cycleType, year, startDate, endDate },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "PerformanceCycle",
    entityId: cycle.id,
    detail:   `${cycleType} ${year}`,
  });

  redirect(`/astelfin_26/my/performance/${cycle.id}`);
}

// ── Save / update objectives ──────────────────────────────────────────────────

export async function saveObjectives(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const cycleId = formData.get("cycleId") as string;
  const titles       = formData.getAll("title")       as string[];
  const descriptions = formData.getAll("description") as string[];
  const weights      = formData.getAll("weight")      as string[];
  const targets      = formData.getAll("target")      as string[];

  // Delete existing and recreate
  await prisma.performanceObjective.deleteMany({ where: { cycleId } });

  for (let i = 0; i < titles.length; i++) {
    if (!titles[i]?.trim()) continue;
    await prisma.performanceObjective.create({
      data: {
        cycleId,
        title:       titles[i].trim(),
        description: descriptions[i]?.trim() || null,
        weight:      weights[i] ? parseFloat(weights[i]) : null,
        target:      targets[i]?.trim() || null,
      },
    });
  }

  revalidatePath(`/astelfin_26/my/performance/${cycleId}`);
  redirect(`/astelfin_26/my/performance/${cycleId}`);
}

// ── Submit objectives for supervisor approval ─────────────────────────────────

export async function submitObjectives(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const cycleId = formData.get("cycleId") as string;

  const cycle = await prisma.performanceCycle.findUnique({
    where:   { id: cycleId },
    include: { employee: { select: { name: true, supervisorId: true } } },
  });
  if (!cycle) redirect("/astelfin_26/my/performance");
  if (!["OBJECTIVES_DRAFT", "OBJECTIVES_SUBMITTED"].includes(cycle.status))
    redirect(`/astelfin_26/my/performance/${cycleId}?error=wrong_state`);

  await prisma.performanceCycle.update({
    where: { id: cycleId },
    data:  { status: "OBJECTIVES_SUBMITTED" },
  });

  await auditLog({
    userId: session.user.id!,
    action: "UPDATE",
    entity: "PerformanceCycle",
    entityId: cycleId,
    detail: "Objectives submitted for approval",
  });

  // Notify supervisor
  const supEmail = await getSupervisorEmail(cycle.employeeId);
  if (supEmail) {
    await sendMail({
      to:      supEmail,
      subject: `Performance Objectives Pending Approval — ${cycle.employee.name}`,
      html: emailLayout(`
        <h2 style="color:#0a1628">Performance Objectives Submitted</h2>
        <p><strong>${cycle.employee.name}</strong> has submitted their performance objectives for your approval.</p>
        <p><strong>Cycle:</strong> ${cycle.cycleType} ${cycle.year}</p>
        <a href="${BASE_URL}/astelfin_26/performance/${cycleId}" class="btn">Review Objectives →</a>
      `),
    });
  }

  redirect(`/astelfin_26/my/performance/${cycleId}?success=submitted`);
}

// ── Supervisor: approve / reject objectives ───────────────────────────────────

export async function reviewObjectives(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  const cycleId  = formData.get("cycleId")  as string;
  const decision = formData.get("decision") as string; // APPROVE | REJECT
  const note     = (formData.get("note") as string) || null;

  const existing = await prisma.performanceCycle.findUnique({ where: { id: cycleId }, select: { status: true } });
  if (existing?.status !== "OBJECTIVES_SUBMITTED")
    redirect(`/astelfin_26/performance/${cycleId}?error=wrong_state`);

  const newStatus = decision === "APPROVE" ? "OBJECTIVES_APPROVED" : "OBJECTIVES_DRAFT";

  const cycle = await prisma.performanceCycle.update({
    where: { id: cycleId },
    data:  { status: newStatus, supervisorNote: note },
    include: { employee: { select: { name: true, email: true } } },
  });

  await auditLog({
    userId: session.user.id!,
    action: decision === "APPROVE" ? "APPROVE" : "REJECT",
    entity: "PerformanceCycle",
    entityId: cycleId,
    detail: `Objectives ${decision === "APPROVE" ? "approved" : "sent back"}: ${note ?? ""}`,
  });

  // Notify employee
  if (cycle.employee.email) {
    const verb = decision === "APPROVE" ? "approved" : "sent back for revision";
    await sendMail({
      to:      cycle.employee.email,
      subject: `Your Performance Objectives Have Been ${decision === "APPROVE" ? "Approved" : "Returned"}`,
      html: emailLayout(`
        <h2 style="color:${decision === "APPROVE" ? "#16a34a" : "#dc2626"}">Objectives ${verb}</h2>
        <p>Your performance objectives for <strong>${cycle.cycleType} ${cycle.year}</strong> have been <strong>${verb}</strong>.</p>
        ${note ? `<div style="background:#fef9ee;border-left:4px solid #c9a227;padding:12px 16px;border-radius:4px;margin:16px 0"><strong>Supervisor note:</strong> ${note}</div>` : ""}
        <a href="${BASE_URL}/astelfin_26/my/performance/${cycleId}" class="btn">View Cycle →</a>
      `),
    });
  }

  redirect(`/astelfin_26/performance/${cycleId}?success=reviewed`);
}

// ── Submit self-review ────────────────────────────────────────────────────────

export async function submitSelfReview(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const cycleId       = formData.get("cycleId")      as string;
  const overallRating = formData.get("overallRating") as string;
  const strengths     = (formData.get("strengths")    as string) || null;
  const improvements  = (formData.get("improvements") as string) || null;
  const comments      = (formData.get("comments")     as string) || null;

  // Upsert self-review
  const existing = await prisma.performanceReview.findFirst({
    where: { cycleId, reviewType: "SELF" },
  });

  const reviewData = {
    cycleId,
    reviewType:    "SELF",
    submittedById: session.user.id!,
    overallRating: overallRating ? parseFloat(overallRating) : null,
    strengths,
    improvements,
    comments,
    status:        "SUBMITTED",
    submittedAt:   new Date(),
  };

  const review = existing
    ? await prisma.performanceReview.update({ where: { id: existing.id }, data: reviewData })
    : await prisma.performanceReview.create({ data: reviewData });

  // Save per-objective ratings
  const objectiveIds = formData.getAll("objectiveId") as string[];
  const ratings      = formData.getAll("rating")      as string[];
  const ratingComments = formData.getAll("ratingComment") as string[];

  await prisma.objectiveRating.deleteMany({ where: { reviewId: review.id } });
  for (let i = 0; i < objectiveIds.length; i++) {
    if (!ratings[i]) continue;
    await prisma.objectiveRating.create({
      data: {
        reviewId:   review.id,
        objectiveId: objectiveIds[i],
        rating:     parseFloat(ratings[i]),
        comment:    ratingComments[i]?.trim() || null,
      },
    });
  }

  // Advance cycle status — only from OBJECTIVES_APPROVED state
  const preSelf = await prisma.performanceCycle.findUnique({ where: { id: cycleId }, select: { status: true } });
  if (preSelf?.status !== "OBJECTIVES_APPROVED")
    redirect(`/astelfin_26/my/performance/${cycleId}?error=wrong_state`);

  await prisma.performanceCycle.update({
    where: { id: cycleId },
    data:  { status: "REVIEWING" },
  });

  // Notify supervisor
  const cycle = await prisma.performanceCycle.findUnique({
    where:   { id: cycleId },
    include: { employee: { select: { name: true, supervisorId: true } } },
  });
  const supEmail = cycle ? await getSupervisorEmail(cycle.employeeId) : null;
  if (supEmail && cycle) {
    await sendMail({
      to:      supEmail,
      subject: `Self-Review Submitted — ${cycle.employee.name} (${cycle.cycleType} ${cycle.year})`,
      html: emailLayout(`
        <h2 style="color:#0a1628">Self-Review Ready for Your Assessment</h2>
        <p><strong>${cycle.employee.name}</strong> has completed their self-review for <strong>${cycle.cycleType} ${cycle.year}</strong>.</p>
        <p>Please complete your supervisor assessment to proceed to CEO review.</p>
        <a href="${BASE_URL}/astelfin_26/performance/${cycleId}" class="btn">Complete Supervisor Review →</a>
      `),
    });
  }

  redirect(`/astelfin_26/my/performance/${cycleId}?success=review_submitted`);
}

// ── Submit supervisor review ──────────────────────────────────────────────────

export async function submitSupervisorReview(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  const cycleId       = formData.get("cycleId")      as string;
  const overallRating = formData.get("overallRating") as string;
  const strengths     = (formData.get("strengths")    as string) || null;
  const improvements  = (formData.get("improvements") as string) || null;
  const comments      = (formData.get("comments")     as string) || null;

  const existing = await prisma.performanceReview.findFirst({
    where: { cycleId, reviewType: "SUPERVISOR" },
  });

  const reviewData = {
    cycleId,
    reviewType:    "SUPERVISOR",
    submittedById: session.user.id!,
    overallRating: overallRating ? parseFloat(overallRating) : null,
    strengths,
    improvements,
    comments,
    status:        "SUBMITTED",
    submittedAt:   new Date(),
  };

  const review = existing
    ? await prisma.performanceReview.update({ where: { id: existing.id }, data: reviewData })
    : await prisma.performanceReview.create({ data: reviewData });

  // Save per-objective ratings
  const objectiveIds   = formData.getAll("objectiveId")   as string[];
  const ratings        = formData.getAll("rating")        as string[];
  const ratingComments = formData.getAll("ratingComment") as string[];

  await prisma.objectiveRating.deleteMany({ where: { reviewId: review.id } });
  for (let i = 0; i < objectiveIds.length; i++) {
    if (!ratings[i]) continue;
    await prisma.objectiveRating.create({
      data: {
        reviewId:    review.id,
        objectiveId: objectiveIds[i],
        rating:      parseFloat(ratings[i]),
        comment:     ratingComments[i]?.trim() || null,
      },
    });
  }

  // Advance to CEO_PENDING — only from REVIEWING
  const preSup = await prisma.performanceCycle.findUnique({ where: { id: cycleId }, select: { status: true } });
  if (preSup?.status !== "REVIEWING")
    redirect(`/astelfin_26/performance/${cycleId}?error=wrong_state`);

  await prisma.performanceCycle.update({
    where: { id: cycleId },
    data:  { status: "CEO_PENDING" },
  });

  // Create placeholder CEO decision record
  await prisma.cEODecision.upsert({
    where:  { cycleId },
    create: { cycleId },
    update: {},
  });

  // Notify CEO
  const cycle = await prisma.performanceCycle.findUnique({
    where:   { id: cycleId },
    include: { employee: { select: { name: true } } },
  });
  const ceoEmails = await getCEOEmails();
  if (ceoEmails.length > 0 && cycle) {
    await sendMail({
      to:      ceoEmails,
      subject: `Performance Review Awaiting Decision — ${cycle.employee.name}`,
      html: emailLayout(`
        <h2 style="color:#0a1628">Performance Review — Decision Required</h2>
        <p>Both self-review and supervisor review have been completed for <strong>${cycle.employee.name}</strong> (${cycle.cycleType} ${cycle.year}).</p>
        <p>Your decision is required to complete this review cycle.</p>
        <a href="${BASE_URL}/astelfin_26/performance/${cycleId}" class="btn">View Reviews &amp; Decide →</a>
      `),
    });
  }

  redirect(`/astelfin_26/performance/${cycleId}?success=supervisor_done`);
}

// ── CEO Decision ──────────────────────────────────────────────────────────────

export async function saveCEODecision(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CEO") redirect("/astelfin_26/dashboard");

  const cycleId      = formData.get("cycleId")      as string;
  const overallScore = formData.get("overallScore") as string;
  const outcome      = (formData.get("outcome")     as string) || null;
  const comments     = (formData.get("comments")    as string) || null;

  await prisma.cEODecision.upsert({
    where:  { cycleId },
    create: {
      cycleId,
      overallScore: overallScore ? parseFloat(overallScore) : null,
      outcome,
      comments,
      decidedById: session.user.id!,
      decidedAt:   new Date(),
    },
    update: {
      overallScore: overallScore ? parseFloat(overallScore) : null,
      outcome,
      comments,
      decidedById: session.user.id!,
      decidedAt:   new Date(),
    },
  });

  // Advance to COMPLETED — only from CEO_PENDING
  const preDecision = await prisma.performanceCycle.findUnique({ where: { id: cycleId }, select: { status: true } });
  if (preDecision?.status !== "CEO_PENDING")
    redirect(`/astelfin_26/performance/${cycleId}?error=wrong_state`);

  await prisma.performanceCycle.update({
    where: { id: cycleId },
    data:  { status: "COMPLETED" },
  });

  const cycle = await prisma.performanceCycle.findUnique({
    where:   { id: cycleId },
    include: { employee: { select: { name: true, email: true } } },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "CEODecision",
    entityId: cycleId,
    detail:   `Outcome: ${outcome ?? "recorded"}`,
  });

  // Notify employee
  if (cycle?.employee.email) {
    await sendMail({
      to:      cycle.employee.email,
      subject: `Your Performance Review Is Complete — ${cycle.cycleType} ${cycle.year}`,
      html: emailLayout(`
        <h2 style="color:#0a1628">Performance Review Completed</h2>
        <p>Your <strong>${cycle.cycleType} ${cycle.year}</strong> performance review has been completed by the CEO.</p>
        <a href="${BASE_URL}/astelfin_26/my/performance/${cycleId}" class="btn">View Results →</a>
      `),
    });
  }

  redirect(`/astelfin_26/performance/${cycleId}?success=decision_saved`);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function emailLayout(body: string) {
  return `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif}.wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0a1628;padding:24px 32px}.header-title{color:#fff;font-size:18px;font-weight:bold;margin:0}.header-sub{color:#c9a227;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:2px 0 0}.content{padding:32px;color:#374151;font-size:14px;line-height:1.6}.btn{display:inline-block;background:#c9a227;color:#fff!important;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:bold;font-size:14px;margin-top:20px}.footer{background:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb}</style></head><body><div class="wrapper"><div class="header"><p class="header-title">Astellic</p><p class="header-sub">Finance</p></div><div class="content">${body}</div><div class="footer">Automated notification from the Astellic Finance system.</div></div></body></html>`;
}
