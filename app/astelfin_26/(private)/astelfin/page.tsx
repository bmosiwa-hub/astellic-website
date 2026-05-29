import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Astelfin | Management Platform",
  robots: { index: false, follow: false },
};

const departments = [
  {
    key:   "hr",
    label: "Human Resources",
    desc:  "Talent acquisition, employee lifecycle, leave & compliance advisory for client organisations.",
    href:  "/astelfin_26/astelfin/hr",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    key:   "finance",
    label: "Finance & Accounting",
    desc:  "Financial management, bookkeeping, payroll processing, and reporting services for clients.",
    href:  "/astelfin_26/astelfin/finance",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key:   "it",
    label: "IT & Systems",
    desc:  "Platform management, software support, security, and technology advisory.",
    href:  "/astelfin_26/astelfin/it",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key:   "marketing",
    label: "Marketing & Communications",
    desc:  "Brand strategy, digital presence, content development, and communications management.",
    href:  "/astelfin_26/astelfin/marketing",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
  {
    key:   "me",
    label: "Monitoring & Evaluation",
    desc:  "Results tracking, data systems, programme monitoring frameworks, and internal performance M&E.",
    href:  "/astelfin_26/astelfin/me",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    key:   "admin",
    label: "Administration & Operations",
    desc:  "Office management, compliance, vendor relationships, and operational support services.",
    href:  "/astelfin_26/astelfin/admin",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
];

export default async function AstelfinHomePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role === "STAFF" || role === "CONSULTANT") redirect("/astelfin_26/my");

  // Fetch managed clients
  const clients = await prisma.managedCompany.findMany({
    where:   { type: "CLIENT", active: true },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, slug: true, tagline: true, color: true },
  });

  const name = session.user.name ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
                "Good evening";

  return (
    <div className="max-w-5xl space-y-12">

      {/* Header */}
      <div>
        <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-1">Astelfin Management Platform</p>
        <h1 className="text-3xl font-bold text-brand-navy">
          {greeting}, {name.split(" ")[0]}.
        </h1>
        <p className="text-brand-muted text-sm mt-1">
          Management consulting services hub — HR, Finance, IT, Marketing, M&E.
        </p>
      </div>

      {/* Service departments */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Service Departments</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Link
              key={dept.key}
              href={dept.href}
              className="group bg-white border border-gray-100 hover:border-brand-gold/40 rounded-xl p-6 flex flex-col gap-3 transition-all hover:shadow-sm"
            >
              <div className="text-brand-navy group-hover:text-brand-gold transition-colors">
                {dept.icon}
              </div>
              <div>
                <p className="font-semibold text-brand-navy text-sm group-hover:text-brand-gold transition-colors">
                  {dept.label}
                </p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{dept.desc}</p>
              </div>
              <div className="mt-auto flex items-center gap-1 text-brand-gold text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Open
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Managed clients */}
      {clients.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Managed Clients</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/astelfin_26/dashboard`}
                className="group bg-white border border-gray-100 hover:border-brand-gold/40 rounded-xl px-5 py-4 flex items-center justify-between transition-all hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-brand-navy text-sm group-hover:text-brand-gold transition-colors">
                    {client.name}
                  </p>
                  {client.tagline && (
                    <p className="text-xs text-gray-400 mt-0.5">{client.tagline}</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-gold transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
