import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { reviewTimesheet } from "@/lib/timesheet-actions";

export const metadata = {
  title: "Review Timesheet | Astelfin",
  robots: { index: false, follow: false },
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT:     { bg: "bg-gray-50 border-gray-200",   text: "text-gray-600",  label: "Draft" },
  SUBMITTED: { bg: "bg-blue-50 border-blue-200",   text: "text-blue-700",  label: "Submitted — Awaiting Review" },
  APPROVED:  { bg: "bg-green-50 border-green-200", text: "text-green-700", label: "Approved" },
  REJECTED:  { bg: "bg-red-50 border-red-200",     text: "text-red-700",   label: "Returned for Revision" },
};

export default async function TimesheetReviewPage({
  params,
  searchParams,
}: {
  params:       Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id }      = await params;
  const { success } = await searchParams;
  const session     = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  const timesheet = await prisma.timesheet.findUnique({
    where:   { id },
    include: {
      entries:  { orderBy: [{ date: "asc" }, { createdAt: "asc" }] },
      employee: { select: { name: true, position: true } },
    },
  });
  if (!timesheet) notFound();

  const st         = STATUS_STYLES[timesheet.status] ?? STATUS_STYLES.DRAFT;
  const canReview  = timesheet.status === "SUBMITTED";
  const totalHours = timesheet.entries.reduce((sum, e) => sum + e.hours, 0);
  const monthName  = MONTHS[timesheet.month - 1];

  // Group by date
  const byDate: Record<string, typeof timesheet.entries> = {};
  for (const entry of timesheet.entries) {
    const key = new Date(entry.date).toISOString().split("T")[0];
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(entry);
  }
  const sortedDates = Object.keys(byDate).sort();

  // Group by project for summary
  const byProject: Record<string, number> = {};
  for (const entry of timesheet.entries) {
    const proj = entry.project ?? "General";
    byProject[proj] = (byProject[proj] ?? 0) + entry.hours;
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">
            {timesheet.employee.name} — {monthName} {timesheet.year}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {timesheet.employee.position ?? "Employee"} · Timesheet Review
          </p>
        </div>
        <Link href="/astelfin_26/timesheets"
          className="text-sm text-brand-gold hover:underline font-semibold">
          ← Team Timesheets
        </Link>
      </div>

      {/* Toasts */}
      {success === "approved" && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
          ✓ Timesheet approved. Employee has been notified.
        </div>
      )}
      {success === "rejected" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          Timesheet returned for revision. Employee has been notified.
        </div>
      )}

      {/* Status */}
      <div className={`rounded-2xl border p-4 ${st.bg}`}>
        <div className="flex items-center justify-between">
          <p className={`font-semibold ${st.text}`}>{st.label}</p>
          <p className="text-sm text-gray-600 font-semibold tabular-nums">
            {totalHours.toFixed(1)} total hours
          </p>
        </div>
        {timesheet.supervisorNote && (
          <p className={`text-sm mt-2 ${st.text}`}>
            <strong>Note:</strong> {timesheet.supervisorNote}
          </p>
        )}
      </div>

      {/* Summary by project */}
      {Object.keys(byProject).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-brand-navy mb-3 text-sm">Hours by Project</h2>
          <div className="space-y-2">
            {Object.entries(byProject)
              .sort(([, a], [, b]) => b - a)
              .map(([proj, hrs]) => (
                <div key={proj} className="flex items-center gap-3 text-sm">
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-brand-gold h-2 rounded-full"
                      style={{ width: `${(hrs / totalHours) * 100}%` }}
                    />
                  </div>
                  <span className="text-gray-600 w-28 text-xs truncate">{proj}</span>
                  <span className="font-semibold text-brand-navy tabular-nums w-14 text-right">
                    {hrs.toFixed(1)} h
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Entries */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-brand-navy">Activity Log</h2>
          <p className="text-xs text-gray-400">{timesheet.entries.length} entries</p>
        </div>
        {sortedDates.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-400">No entries.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {sortedDates.map((dateKey) => {
              const entries  = byDate[dateKey];
              const dayHours = entries.reduce((sum, e) => sum + e.hours, 0);
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
                      <div key={entry.id} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="flex-1 font-medium text-brand-navy">{entry.activity}</span>
                        {entry.project && (
                          <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded-full">
                            {entry.project}
                          </span>
                        )}
                        <span className="font-semibold text-brand-navy tabular-nums">{entry.hours.toFixed(1)} h</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Panel */}
      {canReview && (
        <div className="bg-amber-50 rounded-2xl border border-amber-300 p-6 space-y-5">
          <div>
            <h2 className="font-bold text-amber-800">Review Timesheet</h2>
            <p className="text-xs text-amber-700 mt-1">
              Review the activity log above, then approve or return for revision.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <form action={reviewTimesheet} className="space-y-2">
              <input type="hidden" name="timesheetId" value={id} />
              <input type="hidden" name="decision"    value="APPROVE" />
              <textarea name="note" rows={2} placeholder="Approval note (optional)…"
                className="w-full border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-white resize-none" />
              <button type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                ✓ Approve Timesheet
              </button>
            </form>
            <form action={reviewTimesheet} className="space-y-2">
              <input type="hidden" name="timesheetId" value={id} />
              <input type="hidden" name="decision"    value="REJECT" />
              <textarea name="note" required rows={2} placeholder="Reason for returning (required)…"
                className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 bg-white resize-none" />
              <button type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                ✗ Return for Revision
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
