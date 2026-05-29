import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAstelfinOrg, getDeptStaff, groupByTier } from "@/lib/astelfin-org";
import Link from "next/link";

export const metadata = { title: "HR | Astelfin", robots: { index: false, follow: false } };

const DEPT_ALIASES = ["Human Resources", "HR", "People"];

const QUICK_ACTIONS = [
  { label: "Staff Directory",    desc: "View and manage all staff",          href: "/astelfin_26/employees",   icon: "👥" },
  { label: "Recruitment",        desc: "Open roles and applications",         href: "/astelfin_26/recruitment", icon: "📋" },
  { label: "Payroll",            desc: "Monthly payroll runs",                href: "/astelfin_26/payroll",     icon: "💰" },
  { label: "Leave Management",   desc: "Staff leave and balances",            href: "/astelfin_26/leave",       icon: "🗓️" },
  { label: "Performance",        desc: "Cycles, objectives and reviews",      href: "/astelfin_26/performance", icon: "📈" },
  { label: "Training & CPD",     desc: "Learning and development records",    href: "/astelfin_26/training",    icon: "🎓" },
  { label: "Travel",             desc: "Travel requests and advances",        href: "/astelfin_26/travel",      icon: "✈️" },
  { label: "Timesheets",         desc: "Team timesheet management",           href: "/astelfin_26/timesheets",  icon: "🕐" },
  { label: "Contacts",           desc: "External HR contacts and networks",   href: "/astelfin_26/contacts",    icon: "📇" },
];

function StaffCard({ name, position, level, email }: { name: string; position: string; level: string | null; email: string | null }) {
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const tier = level === "Executive" ? "Director" : ["Senior Manager","Manager"].includes(level ?? "") ? "Manager" : "Officer";
  const tierColor = tier === "Director" ? "bg-brand-gold text-white" : tier === "Manager" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600";
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white text-sm font-bold shrink-0">{initials}</div>
        <div className="min-w-0">
          <p className="font-semibold text-brand-navy text-sm truncate">{name}</p>
          <p className="text-xs text-brand-muted truncate">{position}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${tierColor}`}>{tier}</span>
        {email && <span className="text-[11px] text-gray-400 truncate max-w-[120px]">{email}</span>}
      </div>
    </div>
  );
}

export default async function HRDeptPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const org   = await getAstelfinOrg();
  const staff = org ? await getDeptStaff(org.id, DEPT_ALIASES) : [];
  const { directors, managers, officers } = groupByTier(staff);

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
        <h1 className="text-3xl font-bold text-brand-navy">Human Resources</h1>
        <p className="text-brand-muted text-sm">People operations, talent management and HR consulting services.</p>
        <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
          <span>{directors.length} Director{directors.length !== 1 ? "s" : ""}</span>
          <span>{managers.length} Manager{managers.length !== 1 ? "s" : ""}</span>
          <span>{officers.length} Officer{officers.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Setup notice */}
      {!org && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          <strong>Setup required:</strong> Create an Organisation with shortCode <code>ASTELFIN</code> to link staff to this room.
          Go to <Link href="/astelfin_26/settings/organisations" className="underline">Settings → Organisations</Link>.
        </div>
      )}

      {/* Team */}
      {org && (
        <section className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">Department Team</h2>
          {staff.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
              <p className="text-2xl mb-2">👥</p>
              <p className="font-semibold text-brand-navy">No staff in HR yet</p>
              <p className="text-sm text-brand-muted mt-1">Add employees with the <strong>Human Resources</strong> department tag.</p>
              <Link href="/astelfin_26/employees" className="inline-flex mt-4 items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-navy/90 transition-colors">Add Staff</Link>
            </div>
          ) : (
            <div className="space-y-5">
              {directors.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-brand-gold mb-3">Director</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {directors.map((e) => <StaffCard key={e.id} name={e.name} position={e.position} level={e.level} email={e.email ?? null} />)}
                  </div>
                </div>
              )}
              {managers.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mb-3">Managers</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {managers.map((e) => <StaffCard key={e.id} name={e.name} position={e.position} level={e.level} email={e.email ?? null} />)}
                  </div>
                </div>
              )}
              {officers.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Officers & Staff</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {officers.map((e) => <StaffCard key={e.id} name={e.name} position={e.position} level={e.level} email={e.email ?? null} />)}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">HR Operations</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map((qa) => (
            <Link key={qa.href} href={qa.href} className="group bg-white border border-gray-100 rounded-xl p-5 hover:border-brand-gold/40 hover:shadow-sm transition-all">
              <div className="text-2xl mb-3">{qa.icon}</div>
              <p className="font-semibold text-brand-navy text-sm group-hover:text-brand-gold transition-colors">{qa.label}</p>
              <p className="text-xs text-brand-muted mt-0.5">{qa.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
