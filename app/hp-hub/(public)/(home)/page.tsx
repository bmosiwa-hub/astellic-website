import Link from "next/link";
import type { Metadata } from "next";
import HubSearchBar from "@/components/hp-hub/HubSearchBar";
import { DocumentList } from "@/components/hp-hub/DocumentList";
import { CountList, EmptyState, SectionHeading } from "@/components/hp-hub/ui";
import { HP_HUB_TAGLINE } from "@/lib/hp-hub/constants";
import {
  countPublicDocuments,
  getCountriesWithCounts,
  getFeaturedCollections,
  getFeaturedDocuments,
  getMostDownloaded,
  getPublishersWithCounts,
  getRecentDocuments,
  getThemesWithCounts,
  getTypesWithCounts,
} from "@/lib/hp-hub/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Health Policy Intelligence Hub (HP-Hub) | Astellic" },
  alternates: { canonical: "/hp-hub" },
};

export default async function HpHubHome() {
  const [total, countries, themes, types, recent, featured, popular, collections] = await Promise.all([
    countPublicDocuments(),
    getCountriesWithCounts(),
    getThemesWithCounts(),
    getTypesWithCounts(),
    getRecentDocuments(6),
    getFeaturedDocuments(4),
    getMostDownloaded(5),
    getFeaturedCollections(4),
  ]);
  const malawi = countries.find((c) => c.slug === "malawi");
  const isEmpty = total === 0;
  const malawiStats = malawi
    ? await Promise.all([getThemesWithCounts(malawi.id), getTypesWithCounts(malawi.id), getPublishersWithCounts(malawi.id)]).then(
        ([th, ty, pb]) => [
          { label: "Documents", value: malawi.count },
          { label: "Themes covered", value: th.filter((t) => t.count > 0).length },
          { label: "Document types", value: ty.filter((t) => t.count > 0).length },
          { label: "Publishers", value: pb.length },
        ],
      )
    : [];

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-brand-navy text-white px-6 pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="max-w-6xl mx-auto">
          <p className="text-brand-gold text-sm font-bold uppercase tracking-[0.2em] mb-5">{HP_HUB_TAGLINE}</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] max-w-3xl mb-6">
            Health Policy Intelligence Hub <span className="text-gray-400 font-semibold">(HP-Hub)</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl mb-10">
            Discover health policies, strategies, guidelines, research and reports from Malawi and across Africa. A
            curated resource for researchers, policymakers, practitioners and development partners.
          </p>
          <div className="max-w-3xl">
            <HubSearchBar />
          </div>
          <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-gray-400">
            <div className="flex gap-2">
              <dt>Documents</dt>
              <dd className="text-white font-semibold tabular-nums">{total.toLocaleString("en-GB")}</dd>
            </div>
            <div className="flex gap-2">
              <dt>Countries</dt>
              <dd className="text-white font-semibold tabular-nums">{countries.length}</dd>
            </div>
            <div className="flex gap-2">
              <dt>Themes</dt>
              <dd className="text-white font-semibold tabular-nums">{themes.length}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── Three functions ────────────────────────────────────────────────── */}
      <section className="px-6 py-14 border-b border-gray-100">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          {[
            { k: "Discover", t: "Access policy and evidence", d: "Find policies, strategies, guidelines, research, evaluations and grey literature that are otherwise hard to locate." },
            { k: "Understand", t: "Explore the policy landscape", d: "Browse by country, theme, institution, period and document type to see how the landscape is structured and changing." },
            { k: "Intelligence", t: "Turn information into insight", d: "Policy tracking, comparison and expert interpretation will be added over time, built on this curated evidence base." },
          ].map((x, i) => (
            <div key={x.k}>
              <p className="text-xs font-bold tabular-nums text-brand-gold tracking-widest mb-2">0{i + 1}</p>
              <h2 className="text-lg font-bold text-brand-navy">{x.k}</h2>
              <p className="text-sm font-semibold text-brand-teal mb-2">{x.t}</p>
              <p className="text-[15px] text-brand-muted leading-relaxed">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="px-6 py-16 space-y-20">
        {/* ── Featured country ─────────────────────────────────────────────── */}
        {malawi && (
          <section aria-labelledby="featured-country" className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-10 items-start bg-brand-light rounded-lg p-8 md:p-12">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted mb-2">Featured country</p>
                <h2 id="featured-country" className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
                  Malawi
                </h2>
                <p className="text-brand-muted leading-relaxed mb-6">{malawi.intro}</p>
                <Link
                  href="/hp-hub/malawi"
                  className="inline-flex items-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white px-6 py-3 rounded font-semibold text-sm transition-colors"
                >
                  Explore the Malawi collection <span aria-hidden>→</span>
                </Link>
              </div>
              <dl className="grid grid-cols-2 gap-px bg-gray-200 rounded overflow-hidden self-stretch">
                {malawiStats.map((s) => (
                  <div key={s.label} className="bg-white p-6 flex flex-col-reverse justify-end">
                    <dt className="text-sm text-brand-muted mt-1">{s.label}</dt>
                    <dd className="text-3xl font-bold text-brand-navy tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* ── Recently added + most downloaded ─────────────────────────────── */}
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-14">
          <section aria-labelledby="recent">
            <SectionHeading id="recent" eyebrow="Latest" title="Recently added" action={isEmpty ? undefined : { href: "/hp-hub/search?sort=added", label: "View all" }} />
            {recent.length ? (
              <DocumentList docs={recent} showCountry={countries.length > 1} />
            ) : (
              <EmptyState title="The repository is being catalogued.">
                Documents will appear here as soon as they have been reviewed and published. If you hold a health policy
                document that should be here, you can{" "}
                <Link href="/hp-hub/submit" className="text-brand-teal font-semibold hover:underline">
                  submit it
                </Link>
                .
              </EmptyState>
            )}
          </section>

          <aside className="space-y-14">
            <section aria-labelledby="popular">
              <SectionHeading id="popular" eyebrow="Most used" title="Most downloaded" />
              {popular.length ? (
                <ol className="divide-y divide-gray-100">
                  {popular.map((d, i) => (
                    <li key={d.id} className="py-4 flex gap-4">
                      <span className="text-sm font-bold tabular-nums text-brand-gold w-5 shrink-0">{i + 1}</span>
                      <div className="min-w-0">
                        <Link href={`/hp-hub/documents/${d.slug}`} className="font-semibold text-brand-navy hover:text-brand-teal leading-snug">
                          {d.title}
                        </Link>
                        <p className="text-sm text-brand-muted mt-1">
                          {[d.publisher.acronym || d.publisher.name, d.publicationYear].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <EmptyState title="No downloads recorded yet." />
              )}
            </section>

            <section aria-labelledby="contribute" className="border-l-2 border-brand-gold pl-6">
              <h2 id="contribute" className="text-lg font-bold text-brand-navy mb-2">
                Know of a missing document?
              </h2>
              <p className="text-[15px] text-brand-muted leading-relaxed mb-4">
                Help us build the evidence base. Suggest a document or share a file; every submission is reviewed before
                anything is published.
              </p>
              <Link href="/hp-hub/submit" className="text-sm font-semibold text-brand-teal hover:text-brand-navy">
                Submit a document <span aria-hidden>→</span>
              </Link>
            </section>
          </aside>
        </div>

        {/* ── Featured documents & collections ─────────────────────────────── */}
        {(featured.length > 0 || collections.length > 0) && (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-14">
            {featured.length > 0 && (
              <section aria-labelledby="featured">
                <SectionHeading id="featured" eyebrow="Selected" title="Featured documents" />
                <DocumentList docs={featured} compact />
              </section>
            )}
            {collections.length > 0 && (
              <section aria-labelledby="collections">
                <SectionHeading id="collections" eyebrow="Curated" title="Featured collections" />
                <ul className="divide-y divide-gray-100">
                  {collections.map((c) => (
                    <li key={c.id} className="py-4">
                      <Link href={`/hp-hub/themes/${c.slug}`} className="font-semibold text-brand-navy hover:text-brand-teal">
                        {c.name}
                      </Link>
                      <p className="text-sm text-brand-muted mt-1">
                        {c.count} featured {c.count === 1 ? "document" : "documents"}
                        {c.description ? ` · ${c.description}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* ── Browse ───────────────────────────────────────────────────────── */}
        <section aria-labelledby="browse-themes" className="max-w-6xl mx-auto">
          <SectionHeading id="browse-themes" eyebrow="Browse" title="Health themes" action={{ href: "/hp-hub/themes", label: "All themes" }} />
          <CountList columns={3} items={themes.map((t) => ({ key: t.slug, label: t.name, count: t.count }))} hrefFor={(s) => `/hp-hub/themes/${s}`} />
        </section>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-14">
          <section aria-labelledby="browse-types">
            <SectionHeading id="browse-types" eyebrow="Browse" title="Document types" action={{ href: "/hp-hub/types", label: "All types" }} />
            <CountList
              columns={2}
              hideEmpty={!isEmpty}
              items={types.map((t) => ({ key: t.slug, label: t.name, count: t.count }))}
              hrefFor={(s) => `/hp-hub/types/${s}`}
            />
          </section>
          <section aria-labelledby="browse-countries">
            <SectionHeading id="browse-countries" eyebrow="Browse" title="Countries" />
            <CountList columns={1} items={countries.map((c) => ({ key: c.slug, label: c.name, count: c.count }))} hrefFor={(s) => `/hp-hub/${s}`} />
            <p className="text-sm text-brand-muted mt-4 leading-relaxed">
              HP-Hub starts with Malawi. Further African countries will be added as their collections are catalogued.
            </p>
          </section>
        </div>

        {/* ── About ────────────────────────────────────────────────────────── */}
        <section aria-labelledby="about-repo" className="max-w-6xl mx-auto border-t border-gray-200 pt-12 grid md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-8">
          <h2 id="about-repo" className="text-2xl font-bold text-brand-navy">
            About the repository
          </h2>
          <div className="text-brand-muted leading-relaxed space-y-4 max-w-2xl">
            <p>
              HP-Hub is a curated repository maintained by Astellic. Each record is catalogued with its publisher, period,
              themes and source, and carries a verification status so you know how it was checked.
            </p>
            <p>
              We host files only where the rights holder has given permission or the document is openly licensed.
              Otherwise we link to the original source.
            </p>
            <Link href="/hp-hub/about" className="inline-block text-sm font-semibold text-brand-teal hover:text-brand-navy">
              How the repository works <span aria-hidden>→</span>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
