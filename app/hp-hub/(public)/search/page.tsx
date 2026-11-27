import type { Metadata } from "next";
import HubSearchBar from "@/components/hp-hub/HubSearchBar";
import RepositoryBrowser from "@/components/hp-hub/RepositoryBrowser";
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
      <section className="bg-brand-light border-b border-gray-200 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="sr-only">Search HP-Hub</h1>
          <div className="max-w-3xl">
            <HubSearchBar defaultValue={params.q} size="md" tone="light" />
          </div>
          <p className="text-xs text-brand-muted mt-2">
            Tip: use &ldquo;quotes&rdquo; for an exact phrase, and a minus sign to exclude a word.
          </p>
        </div>
      </section>
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <RepositoryBrowser params={params} basePath="/hp-hub/search" />
        </div>
      </div>
    </>
  );
}
