import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAstelfinOrg } from "@/lib/astelfin-org";
import Link from "next/link";

export const metadata = {
  title: "Astelfin | Staff Directory",
  robots: { index: false, follow: false },
};

const LEVEL_ORDER = ["Executive", "Senior Manager", "Manager", "Officer", "Support Staff"];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function levelBadge(level: string | null) {
  if (level === "Executive")     return { label: "Director",        cls: "bg-amber-100 text-amber-800" };
  if (level === "Senior Manager") return { label: "Senior Manager",  cls: "bg-blue-100 text-blue-800" };
  if (level === "Manager")       return { label: "Manager",          cls: "bg-blue-100 text-blue-800" };
  return { label: level ?? "Staff", cls: "bg-gray-100 text-gray-600" };
}

export default async function AstelfinStaffPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");
  if (session.user.role !== "CEO" && session.user.role !== "FINANCE_MANAGER") redirect("/astelfin_26/home");

  const org = await getAstelfinOrg();

  const staff = org
    ? await prisma.employee.findMany({
        where: { organisationId: org.id, active: true },
        orderBy: [{ name: "asc" }],
      })
    : [];

  const sorted = [...staff].sort((a, b) => {
    const ai = LEVEL_ORDER.indexOf(a.level ?? "");
    const bi = LEVEL_ORDER.indexOf(b.level ?? "");
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi) || a.name.localeCompare(b.name);
  });

  const executives = sorted.filter((e) => e.level === "Executive");
  const managers   = sorted.filter((e) => ["Senior Manager", "Manager"].includes(e.level ?? ""));
  const officers   = sorted.filter((e) => !["Executive", "Senior Manager", "Manager"].includes(e.level ?? ""));

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">Astelfin</p>
          <h1 className="text-3xl font-bold text-brand-navy">Staff Directory</h1>
          <p className="text-brand-muted text-sm">{staff.length} active staff member{staff.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/astelfin_26/employees/new"
          className="bg-brand-gold hover:bg-brand-gold/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          + Add Staff
        </Link>
      </div>

      {!org && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-800">
          Astelfin organisation is not set up in the database yet. Run the setup script to enable staff management.
        </div>
      )}

      {org && staff.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-10 text-center text-brand-muted">
          No staff added yet.{" "}
          <Link href="/astelfin_26/employees/new" className="text-brand-gold font-semibold hover:underline">
            Add the first staff member
          </Link>
        </div>
      )}

      {[{ label: "Directors", items: executives }, { label: "Managers", items: managers }, { label: "Officers & Staff", items: officers }]
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <section key={group.label} className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">{group.label}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {group.items.map((emp) => {
                const badge = levelBadge(emp.level);
                return (
                  <Link
                    key={emp.id}
                    href={`/astelfin_26/employees/${emp.id}`}
                    className="group flex items-center gap-4 bg-white border border-gray-100 hover:border-brand-gold/40 rounded-2xl px-5 py-4 transition-all hover:shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {initials(emp.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-navy group-hover:text-brand-gold transition-colors truncate">
                        {emp.name}
                      </p>
                      <p className="text-xs text-brand-muted truncate">{emp.position}</p>
                      {emp.departments.length > 0 && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{emp.departments.join(" · ")}</p>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
    </div>
  );
}
