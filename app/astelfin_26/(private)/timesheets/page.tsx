import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Team Timesheets | Astelfin",
  robots: { index: false, follow: false },
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_STYLES: Record<string, string> = {
  DRAFT:     "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  APPROVED:  "bg-green-100 text-green-700",
  REJECTED:  "bg-red-100 text-red-700",
};

export default async function TeamTimesheetsPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER" && role !== "PROJECT_MANAGER") {
    redirect("/astelfin_26/dashboard");
  }

  const currentUser = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { employeeId: true },
  });

  // Supervisor sees their subordinates' timesheets; CEO sees all
  const whereBase =
    role === "CEO"
      ? {}
      : currentUser?.employeeId
      ? { employee: { supervisorId: currentUser.employeeId } }
      : { id: "__never__" };

  const submitted = await prisma.timesheet.findMany({
    where:   { ...whereBase, status: "SUBMITTED" },
    include: {
      employee: { select: { name: true } },
      _count:   { select: { entries: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const recent = await prisma.timesheet.findMany({
    where:   { ...whereBase, status: { in: ["APPROVED", "REJECTED"] } },
    include: {
      employee: { select: { name: true } },
      _count:   { select: { entries: true } },
    },
    orderBy: [{ reviewedAt: "desc" }],
    take:    20,
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Team Timesheets</h1>
        <p className="text-gray-500 text-sm mt-1">
          {submitted.length > 0
            ? `${submitted.length} timesheet${submitted.length > 1 ? "s" : ""} awaiting your review.`
            : "No timesheets pending review."}
        </p>
      </div>

      {/* Pending review */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <h2 className="font-bold text-brand-navy text-sm">Pending Review</h2>
          {submitted.length > 0 && (
            <span className="ml-auto text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
              {submitted.length}
            </span>
          )}
        </div>
        {submitted.length === 0 ? (
          <p className="px-5 py-4 text-sm text-gray-400">No timesheets pending review.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {submitted.map((t) => (
              <TimesheetRow key={t.id} timesheet={t} />
            ))}
          </div>
        )}
      </div>

      {/* Recent reviewed */}
      {recent.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="font-bold text-brand-navy text-sm">Recently Reviewed</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recent.map((t) => (
              <TimesheetRow key={t.id} timesheet={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TimesheetRow({
  timesheet,
}: {
  timesheet: {
    id:       string;
    month:    number;
    year:     number;
    status:   string;
    employee: { name: string };
    _count:   { entries: number };
  };
}) {
  return (
    <Link
      href={`/astelfin_26/timesheets/${timesheet.id}`}
      className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors group"
    >
      <div>
        <p className="text-sm font-semibold text-brand-navy group-hover:text-brand-gold transition-colors">
          {timesheet.employee.name}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {MONTHS[timesheet.month - 1]} {timesheet.year} · {timesheet._count.entries} entries
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[timesheet.status] ?? "bg-gray-100 text-gray-600"}`}>
          {timesheet.status === "SUBMITTED" ? "Pending Review" : timesheet.status.charAt(0) + timesheet.status.slice(1).toLowerCase()}
        </span>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
