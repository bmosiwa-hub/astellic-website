import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserCompanies } from "@/lib/company";
import Link from "next/link";

export const metadata = {
  title: "Astelfin IMS",
  robots: { index: false, follow: false },
};

function companyHref(slug: string) {
  if (slug === "astelfin") return "/astelfin_26/astelfin";
  if (slug === "astellic") return "/astelfin_26/dashboard";
  return "/astelfin_26/dashboard";
}

// Per-company visual config
const COMPANY_CONFIG: Record<string, { accent: string; bg: string; dot: string }> = {
  astelfin: { accent: "#c9a227", bg: "#1a2e4a", dot: "#c9a227" },
  astellic: { accent: "#4a9eff", bg: "#0a1628", dot: "#4a9eff" },
};

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;

  if (role === "STAFF" || role === "CONSULTANT") {
    redirect("/astelfin_26/my");
  }

  const companies = await getUserCompanies(session.user.id!);

  if (companies.length === 0) redirect("/astelfin_26/dashboard");
  if (companies.length === 1) redirect(companyHref(companies[0].slug));

  const firstName = (session.user.name ?? "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-12">

      {/* Platform header */}
      <div className="text-center space-y-3">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">
          Astelfin IMS
        </p>
        <h1 className="text-4xl font-bold text-brand-navy">
          {greeting}, {firstName}.
        </h1>
        <p className="text-gray-500 text-sm">
          Choose a company room to continue.
        </p>
      </div>

      {/* Company cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {companies.map((company) => {
          const cfg  = COMPANY_CONFIG[company.slug];
          const href = companyHref(company.slug);
          const isPO = company.type === "PLATFORM_OWNER";

          return (
            <Link
              key={company.id}
              href={href}
              className="group block rounded-2xl overflow-hidden border-2 border-transparent hover:border-gray-200 transition-all hover:shadow-xl"
            >
              {/* Coloured header band */}
              <div
                className="px-7 pt-7 pb-5"
                style={{ backgroundColor: cfg?.bg ?? "#0a1628" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{
                      backgroundColor: cfg ? cfg.accent + "33" : "#ffffff22",
                      color: cfg?.accent ?? "#ffffff",
                    }}
                  >
                    {isPO ? "Platform Owner" : "Client Company"}
                  </span>
                  <span className="text-xs text-white/40 capitalize">{company.role}</span>
                </div>
                <h2 className="text-2xl font-bold text-white">{company.name}</h2>
                {company.tagline && (
                  <p className="text-sm mt-1.5 leading-snug" style={{ color: cfg?.accent ?? "#ffffff99" }}>
                    {company.tagline}
                  </p>
                )}
              </div>

              {/* Footer action */}
              <div className="bg-white px-7 py-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">Open company room</span>
                <span
                  className="flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all"
                  style={{ color: cfg?.accent ?? "#0a1628" }}
                >
                  Enter
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer hint */}
      <p className="text-center text-xs text-gray-400">
        Each company has its own room. Use the switcher inside a room to jump between companies.
      </p>
    </div>
  );
}
