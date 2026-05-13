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

function emailLayout(body: string) {
  return `<!DOCTYPE html><html><head><style>body{margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif}.wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb}.header{background:#0a1628;padding:24px 32px}.header-title{color:#fff;font-size:18px;font-weight:bold;margin:0}.header-sub{color:#c9a227;font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:2px 0 0}.content{padding:32px;color:#374151;font-size:14px;line-height:1.6}.btn{display:inline-block;background:#c9a227;color:#fff!important;text-decoration:none;padding:10px 24px;border-radius:8px;font-weight:bold;font-size:14px;margin-top:20px}.footer{background:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb}</style></head><body><div class="wrapper"><div class="header"><p class="header-title">Astellic</p><p class="header-sub">Finance</p></div><div class="content">${body}</div><div class="footer">Automated notification from the Astellic Finance system.</div></div></body></html>`;
}

// ── Create or get timesheet for a given month/year ────────────────────────────

export async function createOrGetTimesheet(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const employeeId = formData.get("employeeId") as string;
  const month      = parseInt(formData.get("month") as string);
  const year       = parseInt(formData.get("year")  as string);

  // Staff can only create for themselves
  const role = session.user.role;
  if (role === "STAFF") {
    const user = await prisma.user.findUnique({ where: { id: session.user.id! }, select: { employeeId: true } });
    if (user?.employeeId !== employeeId) redirect("/astelfin_26/my/timesheets");
  }

  const existing = await prisma.timesheet.findUnique({
    where: { employeeId_month_year: { employeeId, month, year } },
  });

  if (existing) {
    redirect(`/astelfin_26/my/timesheets/${existing.id}`);
  }

  const timesheet = await prisma.timesheet.create({
    data: { employeeId, month, year },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "CREATE",
    entity:   "Timesheet",
    entityId: timesheet.id,
    detail:   `Month ${month}/${year}`,
  });

  redirect(`/astelfin_26/my/timesheets/${timesheet.id}`);
}

// ── Add an entry to a timesheet ───────────────────────────────────────────────

export async function addTimesheetEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const timesheetId = formData.get("timesheetId") as string;
  const dateStr     = formData.get("date")        as string;
  const activity    = (formData.get("activity")   as string).trim();
  const project     = (formData.get("project")    as string)?.trim() || null;
  const hours       = parseFloat(formData.get("hours") as string);

  if (!activity || isNaN(hours) || hours <= 0) {
    redirect(`/astelfin_26/my/timesheets/${timesheetId}?error=invalid`);
  }

  // Verify timesheet is DRAFT
  const timesheet = await prisma.timesheet.findUnique({ where: { id: timesheetId } });
  if (!timesheet || timesheet.status !== "DRAFT") {
    redirect(`/astelfin_26/my/timesheets/${timesheetId}?error=locked`);
  }

  await prisma.timesheetEntry.create({
    data: {
      timesheetId,
      date:     new Date(dateStr),
      activity,
      project,
      hours,
    },
  });

  revalidatePath(`/astelfin_26/my/timesheets/${timesheetId}`);
  redirect(`/astelfin_26/my/timesheets/${timesheetId}?success=added`);
}

// ── Delete a timesheet entry ──────────────────────────────────────────────────

export async function deleteTimesheetEntry(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const entryId     = formData.get("entryId")     as string;
  const timesheetId = formData.get("timesheetId") as string;

  // Verify the parent timesheet is still DRAFT
  const entry = await prisma.timesheetEntry.findUnique({
    where:   { id: entryId },
    include: { timesheet: { select: { status: true } } },
  });
  if (!entry || entry.timesheet.status !== "DRAFT") {
    redirect(`/astelfin_26/my/timesheets/${timesheetId}?error=locked`);
  }

  await prisma.timesheetEntry.delete({ where: { id: entryId } });

  revalidatePath(`/astelfin_26/my/timesheets/${timesheetId}`);
  redirect(`/astelfin_26/my/timesheets/${timesheetId}`);
}

// ── Submit timesheet for supervisor review ────────────────────────────────────

export async function submitTimesheet(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const timesheetId = formData.get("timesheetId") as string;

  const timesheet = await prisma.timesheet.findUnique({
    where:   { id: timesheetId },
    include: { employee: { select: { name: true, supervisorId: true } } },
  });
  if (!timesheet || timesheet.status !== "DRAFT") {
    redirect(`/astelfin_26/my/timesheets/${timesheetId}?error=locked`);
  }

  // Must have at least one entry
  const entryCount = await prisma.timesheetEntry.count({ where: { timesheetId } });
  if (entryCount === 0) {
    redirect(`/astelfin_26/my/timesheets/${timesheetId}?error=empty`);
  }

  await prisma.timesheet.update({
    where: { id: timesheetId },
    data:  { status: "SUBMITTED" },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   "UPDATE",
    entity:   "Timesheet",
    entityId: timesheetId,
    detail:   `Submitted for month ${timesheet.month}/${timesheet.year}`,
  });

  // Notify supervisor
  const supEmail = await getSupervisorEmail(timesheet.employeeId);
  const monthName = new Date(timesheet.year, timesheet.month - 1, 1)
    .toLocaleString("en-GB", { month: "long" });
  if (supEmail) {
    await sendMail({
      to:      supEmail,
      subject: `Timesheet Submitted for Review — ${timesheet.employee.name} (${monthName} ${timesheet.year})`,
      html: emailLayout(`
        <h2 style="color:#0a1628">Timesheet Pending Your Review</h2>
        <p><strong>${timesheet.employee.name}</strong> has submitted their timesheet for
           <strong>${monthName} ${timesheet.year}</strong> for your review.</p>
        <a href="${BASE_URL}/astelfin_26/timesheets/${timesheetId}" class="btn">Review Timesheet →</a>
      `),
    });
  }

  redirect(`/astelfin_26/my/timesheets/${timesheetId}?success=submitted`);
}

// ── Supervisor: approve / reject timesheet ────────────────────────────────────

export async function reviewTimesheet(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  const timesheetId = formData.get("timesheetId") as string;
  const decision    = formData.get("decision")    as string; // APPROVE | REJECT
  const note        = (formData.get("note")       as string) || null;

  const newStatus = decision === "APPROVE" ? "APPROVED" : "REJECTED";

  const timesheet = await prisma.timesheet.update({
    where: { id: timesheetId },
    data: {
      status:         newStatus,
      supervisorNote: note,
      reviewedAt:     new Date(),
    },
    include: { employee: { select: { name: true, email: true } } },
  });

  await auditLog({
    userId:   session.user.id!,
    action:   decision === "APPROVE" ? "APPROVE" : "REJECT",
    entity:   "Timesheet",
    entityId: timesheetId,
    detail:   `${newStatus}: ${note ?? ""}`,
  });

  // Notify employee
  if (timesheet.employee.email) {
    const monthName = new Date(timesheet.year, timesheet.month - 1, 1)
      .toLocaleString("en-GB", { month: "long" });
    const approved = decision === "APPROVE";
    await sendMail({
      to:      timesheet.employee.email,
      subject: `Your Timesheet Has Been ${approved ? "Approved" : "Returned"} — ${monthName} ${timesheet.year}`,
      html: emailLayout(`
        <h2 style="color:${approved ? "#16a34a" : "#dc2626"}">
          Timesheet ${approved ? "Approved" : "Returned for Revision"}
        </h2>
        <p>Your timesheet for <strong>${monthName} ${timesheet.year}</strong> has been
           <strong>${approved ? "approved" : "returned for revision"}</strong>.</p>
        ${note ? `<div style="background:#fef9ee;border-left:4px solid #c9a227;padding:12px 16px;border-radius:4px;margin:16px 0"><strong>Supervisor note:</strong> ${note}</div>` : ""}
        <a href="${BASE_URL}/astelfin_26/my/timesheets/${timesheetId}" class="btn">View Timesheet →</a>
      `),
    });
  }

  // If rejected → revert to DRAFT so employee can edit
  if (decision === "REJECT") {
    await prisma.timesheet.update({
      where: { id: timesheetId },
      data:  { status: "DRAFT" },
    });
  }

  redirect(`/astelfin_26/timesheets/${timesheetId}?success=${decision === "APPROVE" ? "approved" : "rejected"}`);
}
