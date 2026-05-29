import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata = {
  title: "Astelfin | Management Consulting",
  robots: { index: false, follow: false },
};

const departments = [
  {
    slug: "clients",
    name: "Clients",
    tagline: "Managed client companies and engagements",
    href: "/astelfin_26/astelfin/clients",
    comingSoon: false,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    slug: "hr",
    name: "Human Resources",
    tagline: "Internal HR and people management",
    href: "/astelfin_26/astelfin/hr",
    comingSoon: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    slug: "it",
    name: "IT Services",
    tagline: "Technology infrastructure and system support",
    href: "/astelfin_26/astelfin/it",
    comingSoon: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    slug: "finance",
    name: "Finance Advisory",
    tagline: "Internal financial management and advisory",
    href: "/astelfin_26/astelfin/finance",
    comingSoon: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    slug: "marketing",
    name: "Marketing",
    tagline: "Brand, communications and business development",
    href: "/astelfin_26/astelfin/marketing",
    comingSoon: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    slug: "mande",
    name: "M&E Services",
    tagline: "Monitoring, evaluation and learning",
    href: "/astelfin_26/astelfin/mande",
    comingSoon: true,
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

const managedClients = [
  {
    name: "Astellic",
    tagline: "Research, Advisory & Implementation",
    href: "/astelfin_26/dashboard",
    color: "#0a1628",
  },
];

export default async function AstelfinRoomPage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;
  if (role !== "CEO" && role !== "FINANCE_MANAGER") {
    redirect("/astelfin_26/home");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12">

      {/* Header */}
      <div className="space-y-1.5">
        <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.2em]">
          Platform Owner
        </p>
        <h1 className="text-3xl font-bold text-brand-navy">Astelfin</h1>
        <p className="text-brand-muted text-sm">
          Management Consulting &amp; Platform
        </p>
      </div>

      {/* Service departments grid */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
          Departments
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => {
            const card = (
              <div
                className={`group relative bg-white border-2 rounded-2xl p-6 flex flex-col gap-4 transition-all ${
                  dept.comingSoon
                    ? "border-gray-100 opacity-60 cursor-default"
                    : "border-gray-100 hover:border-brand-gold/40 hover:shadow-md cursor-pointer"
                }`}
              >
                {dept.comingSoon && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    Coming soon
                  </span>
                )}

                <div className="w-10 h-10 rounded-xl bg-brand-navy/5 flex items-center justify-center text-brand-navy group-hover:bg-brand-gold/10 group-hover:text-brand-gold transition-colors">
                  {dept.icon}
                </div>

                <div>
                  <h3 className="font-bold text-brand-navy group-hover:text-brand-gold transition-colors">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-brand-muted mt-0.5 leading-snug">
                    {dept.tagline}
                  </p>
                </div>

                {!dept.comingSoon && (
                  <div className="flex items-center gap-1 text-brand-gold text-xs font-semibold mt-auto">
                    Open
                    <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            );

            return dept.comingSoon ? (
              <div key={dept.slug}>{card}</div>
            ) : (
              <Link key={dept.slug} href={dept.href}>
                {card}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Managed clients */}
      <section className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-brand-muted">
          Managed Clients
        </h2>
        <div className="flex flex-col gap-3">
          {managedClients.map((client) => (
            <Link
              key={client.name}
              href={client.href}
              className="group flex items-center justify-between bg-white border-2 border-gray-100 hover:border-brand-gold/40 rounded-2xl px-6 py-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: client.color }}
                />
                <div>
                  <p className="font-bold text-brand-navy group-hover:text-brand-gold transition-colors">
                    {client.name}
                  </p>
                  <p className="text-xs text-brand-muted">{client.tagline}</p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-brand-gold text-xs font-semibold">
                Go to dashboard
                <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
