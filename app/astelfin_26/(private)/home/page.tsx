import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserCompanies } from "@/lib/company";
import Link from "next/link";

export const metadata = {
  title: "Home | Astelfin IMS",
  robots: { index: false, follow: false },
};

// Map company slug → landing path
function companyHref(slug: string) {
  if (slug === "astelfin") return "/astelfin_26/astelfin";
  if (slug === "astellic") return "/astelfin_26/dashboard";
  return `/astelfin_26/dashboard`;
}

// Accent colours per company (fallback to company.color)
const COMPANY_ACCENTS: Record<string, { bg: string; text: string; border: string }> = {
  astelfin: { bg: "bg-brand-gold",  text: "text-white", border: "border-brand-gold" },
  astellic: { bg: "bg-brand-navy",  text: "text-white", border: "border-brand-navy" },
};

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) redirect("/astelfin_26/login");

  const role = session.user.role;

  // Staff / Consultant go straight to their personal portal
  if (role === "STAFF" || role === "CONSULTANT") {
    redirect("/astelfin_26/my");
  }

  const companies = await getUserCompanies(session.user.id!);

  // No memberships yet — fall back to the Astellic dashboard (backward compat)
  if (companies.length === 0) {
    redirect("/astelfin_26/dashboard");
  }

  // Single membership — skip the selector
  if (companies.length === 1) {
    redirect(companyHref(companies[0].slug));
  }

  const name = session.user.name ?? "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 17 ? "Good afternoon" :
                "Good evening";

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      {/* Greeting */}
      <div className="space-y-1">
        <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em]">
          Astelfin IMS
        </p>
        <h1 className="text-3xl font-bold text-brand-navy">
          {greeting}, {name.split(" ")[0]}.
        </h1>
        <p className="text-brand-muted text-sm">
          Select a company to continue.
        </p>
      </div>

      {/* Company cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {companies.map((company) => {
          const accent = COMPANY_ACCENTS[company.slug];
          const href   = companyHref(company.slug);
          const isPlatformOwner = company.type === "PLATFORM_OWNER";

          return (
            <Link
              key={company.id}
              href={href}
              className="group bg-white border-2 border-gray-100 hover:border-brand-gold/40 rounded-2xl p-7 flex flex-col gap-4 transition-all hover:shadow-md"
            >
              {/* Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    accent
                      ? `${accent.bg} ${accent.text}`
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {isPlatformOwner ? "Platform Owner" : "Client"}
                </span>
                <span className="text-xs text-gray-400 capitalize">{company.role}</span>
              </div>

              {/* Name */}
              <div>
                <h2 className="text-xl font-bold text-brand-navy group-hover:text-brand-gold transition-colors">
                  {company.name}
                </h2>
                {company.tagline && (
                  <p className="text-sm text-brand-muted mt-1 leading-snug">
                    {company.tagline}
                  </p>
                )}
              </div>

              {/* Enter arrow */}
              <div className="flex items-center gap-1.5 text-brand-gold text-sm font-semibold mt-auto">
                Enter
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
