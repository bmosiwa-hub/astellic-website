import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import HubSearchBar from "@/components/hp-hub/HubSearchBar";
import RepositoryBrowser from "@/components/hp-hub/RepositoryBrowser";
import { DocumentList } from "@/components/hp-hub/DocumentList";
import { Breadcrumbs, CountList, SectionHeading } from "@/components/hp-hub/ui";
import {
  countPublicDocuments,
  getCountryBySlug,
  getFeaturedDocuments,
  getPublishersWithCounts,
  getThemesWithCounts,
  getTypesWithCounts,
  getYearsWithCounts,
} from "@/lib/hp-hub/queries";
import { parseSearchParams } from "@/lib/hp-hub/search";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ country: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country: slug } = await params;
  const country = await getCountryBySlug(slug);
  if (!country || !country.isActive) return { title: "Not found" };
  return {
    title: `${country.name} health policy repository`,
    description: `Health policies, strategies, guidelines, reports, evaluations and research from ${country.name}, catalogued by Astellic's Health Policy Intelligence Hub.`,
    alternates: { canonical: `/hp-hub/${country.slug}` },
  };
}

export default async function CountryPage({ params, searchParams }: Props) {
  const { country: slug } = await params;
  // Route segments are lowercase; redirecting mixed case keeps URLs canonical.
  if (slug !== slug.toLowerCase()) permanentRedirect(`/hp-hub/${slug.toLowerCase()}`);
  const country = await getCountryBySlug(slug);
  if (!country || !country.isActive) notFound();

  const sp = parseSearchParams(await searchParams);
  const [total, featured, themes, types, publishers, years] = await Promise.all([
    countPublicDocuments(country.id),
    getFeaturedDocuments(4, country.id),
    getThemesWithCounts(country.id),
    getTypesWithCounts(country.id),
    getPublishersWithCounts(country.id, 20),
    getYearsWithCounts(country.id),
  ]);
  const base = `/hp-hub/${country.slug}`;
  const withCountry = (q: string) => `/hp-hub/search?country=${country.slug}&${q}`;
  const usedThemes = themes.filter((t) => t.count > 0);
  const usedTypes = types.filter((t) => t.count > 0);
  const span = years.length ? (years.length > 1 ? `${years.at(-1)!.year}–${years[0].year}` : String(years[0].year)) : null;
  const searching = !!(sp.q || sp.theme?.length || sp.type?.length || sp.publisher?.length || sp.yearFrom || sp.yearTo || sp.covers || sp.page && sp.page > 1);

  return (
    <>
      <section className="bg-brand-navy text-white px-4 sm:px-6 pt-6 pb-10 sm:pb-12">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs tone="dark" items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "Countries", href: "/hp-hub/countries" }, { label: country.name }]} />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mt-6 mb-3">{country.name}</h1>
          {total > 0 ? (
            <p className="text-gray-300 text-base sm:text-lg mb-6">
              {total.toLocaleString("en-GB")} {total === 1 ? "document" : "documents"}
              {publishers.length > 0 && ` from ${publishers.length} ${publishers.length === 1 ? "publisher" : "publishers"}`}
              {span && `, ${span}`}
            </p>
          ) : (
            country.intro && <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-6">{country.intro}</p>
          )}
          <div className="max-w-2xl">
            <HubSearchBar country={country.slug} size="md" label={`Search within ${country.name}`} />
          </div>
        </div>
      </section>

      <div className="px-4 sm:px-6 py-10 sm:py-12 space-y-12">
        {total === 0 ? (
          <section className="max-w-6xl mx-auto rounded-lg border border-gray-200 px-5 py-6 sm:px-8 sm:py-7">
            <h2 className="text-lg font-bold text-brand-navy">{country.name}&rsquo;s collection is growing</h2>
            <p className="text-[15px] text-brand-muted leading-relaxed mt-1 max-w-2xl">
              We&rsquo;re actively sourcing, cataloguing and verifying health-policy documents. Published documents will appear here
              as soon as they&rsquo;re ready.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm font-semibold">
              <Link href="/hp-hub/themes" className="text-brand-teal hover:text-brand-navy">
                Browse themes
              </Link>
              <Link href="/hp-hub/submit" className="text-brand-teal hover:text-brand-navy">
                Submit a document from {country.name}
              </Link>
            </div>
          </section>
        ) : (
          <>
            {!searching && featured.length > 0 && (
              <section aria-labelledby="featured" className="max-w-6xl mx-auto">
                <SectionHeading id="featured" title="Featured documents" />
                <DocumentList docs={featured} compact showCountry={false} />
              </section>
            )}

            {!searching && (usedThemes.length > 0 || usedTypes.length > 0) && (
              <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-10 lg:gap-14">
                {usedThemes.length > 0 && (
                  <section aria-labelledby="themes">
                    <SectionHeading id="themes" title="Themes" />
                    <CountList columns={2} items={usedThemes.map((t) => ({ key: t.slug, label: t.name, count: t.count }))} hrefFor={(s) => withCountry(`theme=${s}`)} />
                  </section>
                )}
                {usedTypes.length > 0 && (
                  <section aria-labelledby="types">
                    <SectionHeading id="types" title="Document types" />
                    <CountList columns={1} items={usedTypes.map((t) => ({ key: t.slug, label: t.name, count: t.count }))} hrefFor={(s) => withCountry(`type=${s}`)} />
                  </section>
                )}
              </div>
            )}

            <section aria-labelledby="all-docs" className="max-w-6xl mx-auto" id="publishers">
              <SectionHeading id="all-docs" title={searching ? "Results" : "All documents"} />
              <div className="pt-5">
                <RepositoryBrowser params={sp} basePath={base} locked={{ country: [country.slug] }} showCountry={false} />
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}
