import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import HubSearchBar from "@/components/hp-hub/HubSearchBar";
import RepositoryBrowser from "@/components/hp-hub/RepositoryBrowser";
import { DocumentList } from "@/components/hp-hub/DocumentList";
import { Breadcrumbs, CountList, EmptyState, SectionHeading } from "@/components/hp-hub/ui";
import {
  countPublicDocuments,
  getCountryBySlug,
  getFeaturedDocuments,
  getPublishersWithCounts,
  getRecentDocuments,
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
  const [total, featured, recent, themes, types, publishers, years] = await Promise.all([
    countPublicDocuments(country.id),
    getFeaturedDocuments(4, country.id),
    getRecentDocuments(5, country.id),
    getThemesWithCounts(country.id),
    getTypesWithCounts(country.id),
    getPublishersWithCounts(country.id, 30),
    getYearsWithCounts(country.id),
  ]);
  const base = `/hp-hub/${country.slug}`;
  const withCountry = (q: string) => `/hp-hub/search?country=${country.slug}&${q}`;
  const latestYear = years[0]?.year;
  const earliestYear = years.at(-1)?.year;

  return (
    <>
      <section className="bg-brand-navy text-white px-6 pt-10 pb-14">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs tone="dark" items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: country.name }]} />
          <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-10 mt-8 items-end">
            <div>
              <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-4">Country repository</p>
              <h1 className="text-4xl md:text-5xl font-bold mb-5">{country.name}</h1>
              {country.intro && <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mb-8">{country.intro}</p>}
              <div className="max-w-2xl">
                <HubSearchBar country={country.slug} size="md" label={`Search within ${country.name}`} />
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-6 lg:pl-10 lg:border-l border-white/15">
              <div>
                <dd className="text-3xl font-bold tabular-nums">{total.toLocaleString("en-GB")}</dd>
                <dt className="text-sm text-gray-400 mt-1">Published documents</dt>
              </div>
              <div>
                <dd className="text-3xl font-bold tabular-nums">{publishers.length}</dd>
                <dt className="text-sm text-gray-400 mt-1">Publishers</dt>
              </div>
              <div>
                <dd className="text-3xl font-bold tabular-nums">{themes.filter((t) => t.count > 0).length}</dd>
                <dt className="text-sm text-gray-400 mt-1">Themes covered</dt>
              </div>
              <div>
                <dd className="text-3xl font-bold tabular-nums">{earliestYear && latestYear ? `${earliestYear}–${latestYear}` : "—"}</dd>
                <dt className="text-sm text-gray-400 mt-1">Years covered</dt>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <div className="px-6 py-14 space-y-16">
        {(featured.length > 0 || recent.length > 0) && (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14">
            <section aria-labelledby="featured">
              <SectionHeading id="featured" eyebrow="Selected" title="Featured documents" />
              {featured.length ? <DocumentList docs={featured} compact /> : <EmptyState title="No featured documents yet." />}
            </section>
            <section aria-labelledby="recent">
              <SectionHeading id="recent" eyebrow="Latest" title="Recently added" action={{ href: withCountry("sort=added"), label: "View all" }} />
              <DocumentList docs={recent} compact />
            </section>
          </div>
        )}

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-14">
          <section aria-labelledby="themes">
            <SectionHeading id="themes" eyebrow="Browse" title="Themes" />
            <CountList columns={2} items={themes.map((t) => ({ key: t.slug, label: t.name, count: t.count }))} hrefFor={(s) => withCountry(`theme=${s}`)} />
          </section>
          <section aria-labelledby="types">
            <SectionHeading id="types" eyebrow="Browse" title="Document types" />
            {types.some((t) => t.count > 0) ? (
              <CountList columns={1} hideEmpty items={types.map((t) => ({ key: t.slug, label: t.name, count: t.count }))} hrefFor={(s) => withCountry(`type=${s}`)} />
            ) : (
              <EmptyState title="No documents published yet." />
            )}
          </section>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-14">
          <section aria-labelledby="publishers" id="publishers">
            <SectionHeading id="publishers-h" eyebrow="Browse" title="Publishers" />
            {publishers.length ? (
              <CountList columns={2} items={publishers.map((p) => ({ key: p.slug, label: p.name, count: p.count }))} hrefFor={(s) => withCountry(`publisher=${s}`)} />
            ) : (
              <EmptyState title="Publishers appear here once their documents are published." />
            )}
          </section>
          <section aria-labelledby="years">
            <SectionHeading id="years" eyebrow="Browse" title="By year" />
            {years.length ? (
              <ul className="flex flex-wrap gap-2 pt-4">
                {years.map((y) => (
                  <li key={y.year}>
                    <Link
                      href={withCountry(`yearFrom=${y.year}&yearTo=${y.year}`)}
                      className="inline-flex items-baseline gap-1.5 border border-gray-200 rounded px-3 py-1.5 text-sm text-brand-navy hover:border-brand-navy"
                    >
                      {y.year} <span className="text-xs text-brand-muted tabular-nums">{y.count}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No dated documents yet." />
            )}
          </section>
        </div>

        <section aria-labelledby="all-docs" className="max-w-6xl mx-auto">
          <SectionHeading id="all-docs" eyebrow={country.name} title="All documents" />
          <div className="pt-6">
            <RepositoryBrowser params={sp} basePath={base} locked={{ country: [country.slug] }} showCountry={false} />
          </div>
        </section>
      </div>
    </>
  );
}
