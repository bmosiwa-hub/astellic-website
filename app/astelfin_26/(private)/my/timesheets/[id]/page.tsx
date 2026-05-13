import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  addTimesheetEntry,
  deleteTimesheetEntry,
  submitTimesheet,
} from "@/lib/timesheet-actions";

export const metadata = {
  title: "Timesheet | Astelfin",
  robots: { index: false, follow: false },
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT:     { bg: "bg-gray-50 border-gray-200",   text: "text-gray-600",   label: "Draft" },
  SUBMITTED: { bg: "bg-blue-50 border-blue-200",   text: "text-blue-700",   label: "Submitted — Awaiting Review" },
  APPROVED:  { bg: "bg-green-50 border-green-200", text: "text-green-700",  label: "Approved" },
  REJECTED:  { bg: "bg-red-50 border-red-200",     text: "text-red-700",    label: "Returned for Revision" },
};

export default async function MyTimesheetDetailPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { id }              = await params;
  const { success, error }  = await searchParams;
  const session             = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { employeeId: true },
  });

  const timesheet = await prisma.timesheet.findUnique({
    where:   { id },
    include: {
      entries:  { orderBy: [{ date: "asc" }, { createdAt: "asc" }] },
      employee: { select: { name: true } },
    },
  });
  if (!timesheet) notFound();

  const role    = session.user.role;
  const isOwner = user?.employeeId === timesheet.employeeId;
  if (!isOwner && role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  const canEdit   = isOwner && timesheet.status === "DRAFT";
  const canSubmit = canEdit && timesheet.entries.length > 0;
  const st = STATUS_STYLES[timesheet.status] ?? STATUS_STYLES.DRAFT;

  const monthName = MONTHS[timesheet.month - 1];
  const totalHours = timesheet.entries.reduce((sum, e) => sum + e.hours, 0);

  // Group entries by date for display
  const byDate: Record<string, typeof timesheet.entries> = {};
  for (const entry of timesheet.entries) {
    const key = new Date(entry.date).toISOString().split("T")[0];
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(entry);
  }
  const sortedDates = Object.keys(byDate).sort();

  // First day of the month for default date input
  const defaultDate = `${timesheet.year}-${String(timesheet.month).padStart(2, "0")}-01`;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {monthName} {timesheet.year} Timesheet
          </h1>
          <p className="text-gray-500 text-sm mt-1">{timesheet.employee.name}</p>
        </div>
        <Link href="/astelfin_26/my/timesheets"
          className="text-sm text-brand-gold hover:underline font-semibold">
          ← My Timesheets
        </Link>
      </div>

      {/* Toasts */}
      {success === "added" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Entry added.
        </div>
      )}
      {success === "submitted" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Timesheet submitted for supervisor review.
        </div>
      )}
      {error === "empty" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Please add at least one entry before submitting.
        </div>
      )}
      {error === "locked" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          This timesheet is locked and cannot be edited.
        </div>
      )}

      {/* Status + note */}
      <div className={`rounded-2xl border p-4 ${st.bg}`}>
        <div className="flex items-center justify-between">
          <p className={`font-semibold ${st.text}`}>{st.label}</p>
          <p className="text-sm text-gray-600">
            <strong>{totalHours.toFixed(1)}</strong> hours logged
          </p>
        </div>
        {timesheet.supervisorNote && (
          <p className={`text-sm mt-2 ${st.text}`}>
            <strong>Supervisor note:</strong> {timesheet.supervisorNote}
          </p>
        )}
      </div>

      {/* ── Entries list ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Activities</h2>
          <p className="text-xs text-gray-400">{timesheet.entries.length} entries</p>
        </div>

        {sortedDates.length === 0 ? (
          <p className="p-6 text-center text-gray-400 text-sm">No entries yet. Add your first activity below.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {sortedDates.map((dateKey) => {
              const entries    = byDate[dateKey];
              const dayHours   = entries.reduce((sum, e) => sum + e.hours, 0);
              const displayDate = new Date(dateKey + "T00:00:00")
                .toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
              return (
                <div key={dateKey} className="px-5 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500">{displayDate}</p>
                    <p className="text-xs text-gray-400">{dayHours.toFixed(1)} hrs</p>
                  </div>
                  <div className="space-y-1.5">
                    {entries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-3 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-brand-navy">{entry.activity}</span>
                          {entry.project && (
                            <span className="ml-2 text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
                              {entry.project}
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 font-semibold text-brand-navy tabular-nums">
                          {entry.hours.toFixed(1)} h
                        </span>
                        {canEdit && (
                          <form action={deleteTimesheetEntry}>
                            <input type="hidden" name="entryId"     value={entry.id} />
                            <input type="hidden" name="timesheetId" value={id} />
                            <button type="submit"
                              className="text-red-400 hover:text-red-600 transition-colors p-1 rounded">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </form>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add entry form ────────────────────────────────────────────────── */}
      {canEdit && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-brand-navy">Add Activity</h2>
          <form action={addTimesheetEntry} className="space-y-3">
            <input type="hidden" name="timesheetId" value={id} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input type="date" name="date" required defaultValue={defaultDate}
                  min={`${timesheet.year}-${String(timesheet.month).padStart(2, "0")}-01`}
                  max={`${timesheet.year}-${String(timesheet.month).padStart(2, "0")}-31`}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hours</label>
                <input type="number" name="hours" required min="0.5" max="24" step="0.5" placeholder="e.g. 3.5"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Activity *</label>
              <input type="text" name="activity" required placeholder="What did you work on?"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Project / Client (optional)</label>
              <input type="text" name="project" placeholder="e.g. Client ABC, Internal"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
            </div>
            <button type="submit"
              className="w-full bg-brand-gold text-white font-semibold py-2.5 rounded-lg hover:bg-brand-gold/90 transition-colors text-sm">
              + Add Entry
            </button>
          </form>
        </div>
      )}

      {/* ── Submit button ─────────────────────────────────────────────────── */}
      {canSubmit && (
        <form action={submitTimesheet}>
          <input type="hidden" name="timesheetId" value={id} />
          <button type="submit"
            className="w-full bg-brand-navy text-white font-semibold py-3 rounded-xl hover:bg-brand-navy/90 transition-colors text-sm">
            Submit Timesheet for Review →
          </button>
        </form>
      )}
    </div>
  );
}
