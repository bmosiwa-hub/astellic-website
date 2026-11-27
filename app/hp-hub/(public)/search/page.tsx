import type { Metadata } from "next";
import HubSearchBar from "@/components/hp-hub/HubSearchBar";
import RepositoryBrowser from "@/components/hp-hub/RepositoryBrowser";
import { Breadcrumbs } from "@/components/hp-hub/ui";
import { parseSearchParams } from "@/lib/hp-hub/search";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const p = parseSearchParams(await searchParams);
  return {
    title: p.q ? `Search: ${p.q}` : "Search the repository",
    alternates: { canonical: "/hp-hub/search" },
    // Result pages are endless permutations; keep them out of search engines.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = parseSearchParams(await searchParams);
  return (
    <>
      <section className="bg-brand-light border-b border-gray-200 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs items={[{ label: "HP-Hub", href: "/hp-hub" }, { label: "Search" }]} />
          <h1 className="text-3xl font-bold text-brand-navy mt-4 mb-6">Search the repository</h1>
          <div className="max-w-3xl">
            <HubSearchBar defaultValue={params.q} size="md" tone="light" />
          </div>
          <p className="text-sm text-brand-muted mt-3">
            Searches titles, abstracts, publishers, authors, keywords, themes and document types. Use quotes for an exact
            phrase and a minus sign to exclude a word.
          </p>
        </div>
      </section>
      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <RepositoryBrowser params={params} basePath="/hp-hub/search" />
        </div>
      </div>
    </>
  );
}
