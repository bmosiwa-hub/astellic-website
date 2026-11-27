import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import HubFilterPanel from "@/components/hp-hub/HubFilterPanel";
import HubSearchBar from "@/components/hp-hub/HubSearchBar";
import { DocumentList } from "@/components/hp-hub/DocumentList";
import {
  countPublicDocuments,
  getCountriesWithCounts,
  getFilterPanelProps,
  getRecentDocuments,
  getThemesWithCounts,
} from "@/lib/hp-hub/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Health Policy Intelligence Hub (HP-Hub) | Astellic" },
  description: "Discover the policies, strategies, guidelines and evidence shaping health systems across Africa.",
  alternates: { canonical: "/hp-hub" },
};

const EXAMPLE_SEARCHES = ["Malawi Health Sector Strategic Plan", "HIV policy", "Health financing", "Community health"];

// Featured on the homepage; every theme stays available on /hp-hub/themes.
const FEATURED_THEME_SLUGS = [
  "health-systems-strengthening",
  "health-financing",
  "health-governance",
  "primary-health-care",
  "hiv-aids",
  "maternal-and-newborn-health",
  "tuberculosis",
  "digital-health",
];

const LAUNCH_COUNTRY = "malawi";

function plural(n: number, one: string, many = `${one}s`) {
  return `${n.toLocaleString("en-GB")} ${n === 1 ? one : many}`;
}

export default async function HpHubHome() {
  const [total, countries, themes, recent, panelData] = await Promise.all([
    countPublicDocuments(),
    getCountriesWithCounts(),
    getThemesWithCounts(),
    getRecentDocuments(6),
    getFilterPanelProps(),
  ]);

  // Show the launch country always; other countries only once they hold documents.
  const shownCountries = countries.filter((c) => c.slug === LAUNCH_COUNTRY || c.count > 0);
  const featuredThemes = FEATURED_THEME_SLUGS.map((s) => themes.find((t) => t.slug === s)).filter((t): t is NonNullable<typeof t> => !!t);

  return (
    <>
      {/* ── A. Hero and search ─────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white px-4 sm:px-6 pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-3">Health Policy Intelligence Hub</h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-7 max-w-2xl mx-auto">
            Discover the policies, strategies, guidelines and evidence shaping health systems across Africa.
          </p>
          <HubSearchBar />
          <div className="mt-4 flex flex-wrap justify-center items-center gap-2 text-sm">
            <span className="text-gray-400">Try:</span>
            {EXAMPLE_SEARCHES.map((q) => (
              <Link
                key={q}
                href={`/hp-hub/search?q=${encodeURIComponent(q)}`}
                className="rounded-full border border-white/20 px-3 py-1.5 text-gray-200 hover:bg-white/10 hover:text-white transition-colors"
              >
                {q}
              </Link>
            ))}
          </div>
          <nav aria-label="Browse" className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold">
            <Link href="/hp-hub/countries" className="text-brand-gold hover:text-white">
              Browse by country →
            </Link>
            <Link href="/hp-hub/themes" className="text-brand-gold hover:text-white">
              Browse by theme →
            </Link>
            <Link href="/hp-hub/types" className="text-gray-300 hover:text-white font-medium">
              Document types
            </Link>
          </nav>
        </div>
      </section>


      <div className="px-4 sm:px-6 py-12 sm:py-16 space-y-14 sm:space-y-16">
        {/* ── Phones: the filters, open and in plain view ─────────────────── */}
        {panelData && (
          <section aria-labelledby="find-documents" className="md:hidden max-w-6xl mx-auto">
            <h2 id="find-documents" className="text-xl font-bold text-brand-navy mb-1">
              Find documents
            </h2>
            <p className="text-sm text-brand-muted mb-5">Choose a country, theme or document type, then search.</p>
            <div className="rounded-lg border border-gray-200 bg-brand-light px-4 py-5">
              <Suspense>
                <HubFilterPanel data={panelData} idPrefix="home" />
              </Suspense>
            </div>
          </section>
        )}

        {/* ── B. Explore by country ────────────────────────────────────────── */}
        {shownCountries.length > 0 && (
          <section aria-labelledby="countries" className="max-w-6xl mx-auto">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <h2 id="countries" className="text-xl sm:text-2xl font-bold text-brand-navy">
                Explore by country
              </h2>
              <Link href="/hp-hub/countries" className="text-sm font-semibold text-brand-teal hover:text-brand-navy">
                All countries →
              </Link>
            </div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {shownCountries.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/hp-hub/${c.slug}`}
                    className="group block h-full rounded-lg border border-gray-200 p-5 hover:border-brand-navy hover:shadow-sm transition"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-lg font-bold text-brand-navy group-hover:text-brand-teal">{c.name}</span>
                      <span className="text-sm text-brand-muted">{c.count > 0 ? plural(c.count, "document") : "Collection growing"}</span>
                    </span>
                    {c.intro && <span className="block text-sm text-brand-muted leading-relaxed mt-2 line-clamp-2">{c.intro}</span>}
                    <span className="block text-sm font-semibold text-brand-teal mt-3">Explore {c.name} →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── C. Explore by theme ──────────────────────────────────────────── */}
        {featuredThemes.length > 0 && (
          <section aria-labelledby="themes" className="max-w-6xl mx-auto">
            <div className="flex items-baseline justify-between gap-4 mb-5">
              <h2 id="themes" className="text-xl sm:text-2xl font-bold text-brand-navy">
                Explore by theme
              </h2>
              <Link href="/hp-hub/themes" className="text-sm font-semibold text-brand-teal hover:text-brand-navy">
                Explore all themes →
              </Link>
            </div>
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {featuredThemes.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/hp-hub/themes/${t.slug}`}
                    className="group flex h-full min-h-[4.5rem] flex-col justify-between gap-1 rounded-lg bg-brand-light px-4 py-3.5 hover:bg-gray-200/70 transition-colors"
                  >
                    <span className="font-semibold text-brand-navy leading-snug group-hover:text-brand-teal">{t.name}</span>
                    {t.count > 0 && <span className="text-xs text-brand-muted">{plural(t.count, "document")}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── D. Recently added ────────────────────────────────────────────── */}
        <section aria-labelledby="recent" className="max-w-6xl mx-auto">
          {recent.length > 0 ? (
            <>
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <h2 id="recent" className="text-xl sm:text-2xl font-bold text-brand-navy">
                  Recently added
                </h2>
                {total > recent.length && (
                  <Link href="/hp-hub/search?sort=added" className="text-sm font-semibold text-brand-teal hover:text-brand-navy">
                    View all {total.toLocaleString("en-GB")} →
                  </Link>
                )}
              </div>
              <DocumentList docs={recent} showCountry />
            </>
          ) : (
            <div className="rounded-lg border border-gray-200 px-5 py-6 sm:px-8 sm:py-7 sm:flex sm:items-center sm:justify-between sm:gap-8">
              <div>
                <h2 id="recent" className="text-lg font-bold text-brand-navy">
                  The collection is being curated
                </h2>
                <p className="text-[15px] text-brand-muted leading-relaxed mt-1 max-w-2xl">
                  We&rsquo;re actively sourcing, cataloguing and verifying health-policy documents. Published documents will appear
                  here as soon as they&rsquo;re ready.
                </p>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 sm:mt-0 shrink-0 text-sm font-semibold">
                <Link href="/hp-hub/themes" className="text-brand-teal hover:text-brand-navy">
                  Browse themes
                </Link>
                <Link href="/hp-hub/submit" className="text-brand-teal hover:text-brand-navy">
                  Submit a document
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* ── E. Contribute ────────────────────────────────────────────────── */}
        <section aria-labelledby="contribute" className="max-w-6xl mx-auto border-t border-gray-200 pt-10 sm:flex sm:items-center sm:justify-between sm:gap-8">
          <div>
            <h2 id="contribute" className="text-lg font-bold text-brand-navy">
              Help expand the health-policy evidence base
            </h2>
            <p className="text-[15px] text-brand-muted leading-relaxed mt-1">
              Have a policy, strategy, guideline or report that isn&rsquo;t in HP-Hub? Share it with us.
            </p>
            <Link href="/hp-hub/about" className="inline-block mt-2 py-1 text-sm font-semibold text-brand-teal hover:text-brand-navy">
              About HP-Hub →
            </Link>
          </div>
          <Link
            href="/hp-hub/submit"
            className="mt-4 sm:mt-0 shrink-0 inline-flex items-center justify-center h-11 px-5 rounded border border-brand-navy text-brand-navy text-sm font-semibold hover:bg-brand-navy hover:text-white transition-colors"
          >
            Submit a document
          </Link>
        </section>
      </div>
    </>
  );
}
