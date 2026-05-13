import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createOrGetTimesheet } from "@/lib/timesheet-actions";

export const metadata = {
  title: "My Timesheets | Astelfin",
  robots: { index: false, follow: false },
};

const STATUS_STYLES: Record<string, string> = {
  DRAFT:     "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED:  "bg-green-100 text-green-700",
  REJECTED:  "bg-red-100 text-red-700",
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default async function MyTimesheetsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { employeeId: true },
  });
  if (!user?.employeeId) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold text-brand-navy">My Timesheets</h1>
        <p className="text-gray-500 text-sm">Your account is not linked to an employee record. Please contact HR.</p>
      </div>
    );
  }

  const timesheets = await prisma.timesheet.findMany({
    where:   { employeeId: user.employeeId },
    include: { _count: { select: { entries: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear  = now.getFullYear();

  // Check if current month timesheet exists already
  const currentExists = timesheets.some(
    (t) => t.month === currentMonth && t.year === currentYear,
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">My Timesheets</h1>
          <p className="text-gray-500 text-sm mt-1">Track your monthly activities and hours.</p>
        </div>
        {!currentExists && (
          <form action={createOrGetTimesheet}>
            <input type="hidden" name="employeeId" value={user.employeeId} />
            <input type="hidden" name="month"      value={currentMonth} />
            <input type="hidden" name="year"       value={currentYear} />
            <button type="submit"
              className="bg-brand-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-navy/90 transition-colors">
              + {MONTHS[currentMonth - 1]} {currentYear}
            </button>
          </form>
        )}
      </div>

      {/* Quick-create past month */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Open a specific month</p>
        <form action={createOrGetTimesheet} className="flex gap-3 items-end">
          <input type="hidden" name="employeeId" value={user.employeeId} />
          <div>
            <label className="block text-xs text-gray-500 mb-1">Month</label>
            <select name="month" defaultValue={currentMonth}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
              {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Year</label>
            <select name="year" defaultValue={currentYear}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button type="submit"
            className="bg-brand-gold text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-gold/90 transition-colors">
            Open →
          </button>
        </form>
      </div>

      {timesheets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🗓️</p>
          <p className="text-gray-600 font-medium">No timesheets yet.</p>
          <p className="text-gray-400 text-sm mt-1">Click the button above to create your first timesheet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Period</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Entries</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Note</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {timesheets.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 font-medium text-brand-navy">
                    {MONTHS[t.month - 1]} {t.year}
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {t._count.entries} {t._count.entries === 1 ? "entry" : "entries"}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[t.status] ?? "bg-gray-100 text-gray-600"}`}>
                      {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 max-w-[200px] truncate">
                    {t.supervisorNote ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/astelfin_26/my/timesheets/${t.id}`}
                      className="text-brand-gold hover:underline text-xs font-semibold">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
