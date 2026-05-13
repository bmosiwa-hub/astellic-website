import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createPerformanceCycle } from "@/lib/performance-actions";

export const metadata = {
  title: "New Performance Cycle | Astelfin",
  robots: { index: false, follow: false },
};

const CYCLE_TYPES = [
  { value: "PROBATION",  label: "Probation Review",       desc: "For employees in their probation period" },
  { value: "Q1",         label: "Q1 — Jan to Mar",        desc: "First quarter review" },
  { value: "Q2",         label: "Q2 — Apr to Jun",        desc: "Second quarter review" },
  { value: "Q3",         label: "Q3 — Jul to Sep",        desc: "Third quarter review" },
  { value: "Q4",         label: "Q4 — Oct to Dec",        desc: "Fourth quarter / annual review" },
  { value: "ANNUAL",     label: "Annual Review",           desc: "Full-year performance review" },
];

export default async function NewPerformanceCyclePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id! },
    select: { employeeId: true },
  });
  if (!user?.employeeId) redirect("/astelfin_26/my/performance");

  const currentYear = new Date().getFullYear();

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">New Performance Cycle</h1>
          <p className="text-gray-500 text-sm mt-1">Set up a new review cycle.</p>
        </div>
        <Link href="/astelfin_26/my/performance"
          className="text-sm text-brand-gold hover:underline font-semibold">
          ← Back
        </Link>
      </div>

      <form action={createPerformanceCycle} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <input type="hidden" name="employeeId" value={user.employeeId} />

        {/* Cycle Type */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-brand-navy">Cycle Type</label>
          {CYCLE_TYPES.map((ct) => (
            <label key={ct.value} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-gold/40 cursor-pointer has-[:checked]:border-brand-gold has-[:checked]:bg-amber-50 transition-colors">
              <input type="radio" name="cycleType" value={ct.value} required className="mt-0.5 accent-brand-gold" />
              <div>
                <p className="text-sm font-medium text-brand-navy">{ct.label}</p>
                <p className="text-xs text-gray-400">{ct.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-semibold text-brand-navy mb-1">Year</label>
          <select name="year" defaultValue={currentYear}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold">
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">Start Date</label>
            <input type="date" name="startDate" required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-navy mb-1">End Date</label>
            <input type="date" name="endDate" required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold" />
          </div>
        </div>

        <button type="submit"
          className="w-full bg-brand-navy text-white font-semibold py-2.5 rounded-lg hover:bg-brand-navy/90 transition-colors text-sm">
          Create Cycle →
        </button>
      </form>
    </div>
  );
}
