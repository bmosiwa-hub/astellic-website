import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Home | Astelfin IMS",
  robots: { index: false, follow: false },
};

const ROLE_LABELS: Record<string, string> = {
  CEO:             "Chief Executive Officer",
  FINANCE_MANAGER: "Finance Manager",
  STAFF:           "Staff",
  CONSULTANT:      "Consultant",
  BD_OFFICER:      "Business Development Officer",
  HR_OFFICER:      "HR Officer",
  OPERATIONS:      "Operations Officer",
};

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role    = session.user.role;
  const name    = session.user.name ?? "there";
  const isCEO   = role === "CEO";
  const isFM    = role === "FINANCE_MANAGER";
  const isFinance = isCEO || isFM;

  // Staff / Consultant have their own portal
  if (role === "STAFF" || role === "CONSULTANT") {
    redirect("/astelfin_26/my");
  }

  // Lightweight counts for the status strip
  const [
    activeProjects,
    pendingApprovals,
    activeConsultants,
  ] = await Promise.all([
    prisma.project.count({ where: { status: "ACTIVE" } }),
    isFinance
      ? prisma.pendingChange.count({ where: { status: "PENDING" } })
      : Promise.resolve(0),
    prisma.consultant.count({ where: { active: true, deletedAt: null } }),
  ]);

  const hour  = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
                "Good evening";

  const quickLinks = [
    ...(isFinance ? [
      { label: "Financial Dashboard",  href: "/astelfin_26/dashboard",  desc: "Income, expenses & balance"  },
      { label: "Projects",             href: "/astelfin_26/projects",    desc: "Active project portfolio"    },
      { label: "Approvals",            href: "/astelfin_26/approvals",   desc: "Pending change requests",    badge: pendingApprovals > 0 ? pendingApprovals : undefined },
      { label: "Consultants",          href: "/astelfin_26/consultants", desc: "Roster & active engagements" },
    ] : [
      { label: "Projects",             href: "/astelfin_26/projects",    desc: "Active project portfolio"    },
      { label: "Consultants",          href: "/astelfin_26/consultants", desc: "Roster & active engagements" },
    ]),
    { label: "ASIL",                   href: "/astelfin_26/asil",        desc: "Pilots & intelligence entries" },
    { label: "Employees",              href: "/astelfin_26/employees",   desc: "Staff records"               },
    { label: "Documents",              href: "/astelfin_26/documents",   desc: "Shared document library"     },
    { label: "Settings",               href: "/astelfin_26/settings",    desc: "System configuration"        },
  ];

  const statusItems = [
    { label: "Active Projects",    value: activeProjects },
    { label: "Active Consultants", value: activeConsultants },
    ...(isFinance && pendingApprovals > 0
      ? [{ label: "Pending Approvals", value: pendingApprovals, urgent: true }]
      : []),
  ];

  return (
    <div className="max-w-4xl space-y-10">

      {/* Greeting */}
      <div className="space-y-1">
        <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em]">
          Astelfin IMS
        </p>
        <h1 className="text-3xl font-bold text-brand-navy">
          {greeting}, {name.split(" ")[0]}.
        </h1>
        <p className="text-brand-muted text-sm">
          {ROLE_LABELS[role] ?? role} &mdash; {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Status strip */}
      {statusItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusItems.map((s) => (
            <div
              key={s.label}
              className={`rounded-xl border p-4 ${
                (s as { urgent?: boolean }).urgent
                  ? "bg-orange-50 border-orange-200"
                  : "bg-white border-gray-100"
              }`}
            >
              <p className={`text-2xl font-bold ${(s as { urgent?: boolean }).urgent ? "text-orange-600" : "text-brand-navy"}`}>
                {s.value}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Quick Access</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group bg-white border border-gray-100 hover:border-brand-gold/50 rounded-xl p-5 flex items-center justify-between transition-colors"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-brand-navy text-sm group-hover:text-brand-gold transition-colors">
                    {link.label}
                  </p>
                  {(link as { badge?: number }).badge !== undefined && (
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {(link as { badge?: number }).badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{link.desc}</p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-gold transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
