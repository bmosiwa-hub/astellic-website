import Link from "next/link";
import { ACCESS_LABELS, VERIFICATION_LABELS } from "@/lib/hp-hub/constants";
import { searchDocuments, searchFacets, toQueryString, type Facet, type SearchParams } from "@/lib/hp-hub/search";
import AutoSubmitForm from "./AutoSubmitForm";
import { DocumentList } from "./DocumentList";
import { EmptyState, Pagination } from "./ui";

type ListKey = "country" | "theme" | "type" | "publisher" | "language" | "access" | "verification";

const FACET_TITLES: Record<ListKey, string> = {
  country: "Country",
  theme: "Theme",
  type: "Document type",
  publisher: "Publisher",
  language: "Language",
  access: "Access",
  verification: "Verification",
};

const SORT_LABELS = {
  relevance: "Relevance",
  newest: "Newest",
  oldest: "Oldest",
  title: "Title A–Z",
  added: "Recently added",
} as const;

function facetLabel(key: ListKey, f: Facet): string {
  if (key === "access") return ACCESS_LABELS[f.value as keyof typeof ACCESS_LABELS] ?? f.label;
  if (key === "verification") return VERIFICATION_LABELS[f.value as keyof typeof VERIFICATION_LABELS] ?? f.label;
  return f.label;
}

/**
 * Search results with filters. `locked` dimensions come from the page itself
 * (e.g. the theme on a theme page) and are kept but not shown as filters.
 */
export default async function RepositoryBrowser({
  params,
  basePath,
  locked = {},
  showCountry = true,
}: {
  params: SearchParams;
  basePath: string;
  locked?: Partial<Pick<SearchParams, ListKey>>;
  showCountry?: boolean;
}) {
  const effective: SearchParams = { ...params, ...locked };
  const [result, facets] = await Promise.all([searchDocuments(effective), searchFacets(effective)]);
  const lockedKeys = new Set(Object.keys(locked) as ListKey[]);

  const href = (overrides: Partial<SearchParams>) => `${basePath}${toQueryString(params, { page: 1, ...overrides })}`;

  const dims: ListKey[] = (["country", "theme", "type", "publisher", "language", "access", "verification"] as ListKey[]).filter(
    (k) => !lockedKeys.has(k) && facets[k].length > 0 && !(k === "country" && facets.country.length < 2 && !params.country?.length),
  );

  // Active filter chips, each with a link that removes just that value.
  const chips: { label: string; href: string }[] = [];
  for (const k of dims) {
    for (const v of params[k] ?? []) {
      const f = facets[k].find((x) => x.value === v);
      chips.push({ label: f ? facetLabel(k, f) : v, href: href({ [k]: (params[k] ?? []).filter((x) => x !== v) }) });
    }
  }
  if (params.yearFrom || params.yearTo) {
    chips.push({ label: `${params.yearFrom ?? "…"}–${params.yearTo ?? "…"}`, href: href({ yearFrom: undefined, yearTo: undefined }) });
  }
  const clearHref = `${basePath}${toQueryString({ q: params.q })}`;
  const activeCount = chips.length;

  const years = facets.year.map((y) => Number(y.value));
  const minYear = years.length ? Math.min(...years) : undefined;
  const maxYear = years.length ? Math.max(...years) : undefined;

  const filters = (
    <AutoSubmitForm action={basePath} ariaLabel="Filter results" className="space-y-7">
      {params.q && <input type="hidden" name="q" value={params.q} />}
      {params.sort && <input type="hidden" name="sort" value={params.sort} />}
      {dims.map((k) => (
        <fieldset key={k}>
          <legend className="text-xs font-bold uppercase tracking-[0.16em] text-brand-navy mb-2.5">{FACET_TITLES[k]}</legend>
          <ul className={`space-y-1.5 ${facets[k].length > 8 ? "max-h-64 overflow-y-auto pr-2" : ""}`}>
            {facets[k].map((f) => {
              const id = `f-${k}-${f.value}`;
              const checked = (params[k] ?? []).includes(f.value);
              return (
                <li key={f.value}>
                  <label htmlFor={id} className="flex items-start gap-2.5 text-sm text-gray-700 cursor-pointer hover:text-brand-navy">
                    <input
                      id={id}
                      type="checkbox"
                      name={k}
                      value={f.value}
                      defaultChecked={checked}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy/30"
                    />
                    <span className="flex-1 leading-snug">{facetLabel(k, f)}</span>
                    <span className="tabular-nums text-xs text-brand-muted pt-0.5">{f.count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
      {minYear !== undefined && (
        <fieldset>
          <legend className="text-xs font-bold uppercase tracking-[0.16em] text-brand-navy mb-2.5">Publication year</legend>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="yearFrom">
              From year
            </label>
            <input id="yearFrom" name="yearFrom" type="number" inputMode="numeric" min={1900} max={2100} placeholder={String(minYear)} defaultValue={params.yearFrom}
              className="w-full h-10 rounded border border-gray-300 px-2.5 text-sm focus:border-brand-navy focus:ring-brand-navy/20" />
            <span className="text-brand-muted" aria-hidden>–</span>
            <label className="sr-only" htmlFor="yearTo">
              To year
            </label>
            <input id="yearTo" name="yearTo" type="number" inputMode="numeric" min={1900} max={2100} placeholder={String(maxYear)} defaultValue={params.yearTo}
              className="w-full h-10 rounded border border-gray-300 px-2.5 text-sm focus:border-brand-navy focus:ring-brand-navy/20" />
          </div>
        </fieldset>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" className="h-10 px-5 rounded bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90">
          Apply filters
        </button>
        {activeCount > 0 && (
          <Link href={clearHref} className="text-sm text-brand-muted hover:text-brand-navy underline underline-offset-4">
            Clear all
          </Link>
        )}
      </div>
    </AutoSubmitForm>
  );

  return (
    <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-10 lg:gap-14">
      {/* Filters: collapsible on phones, sidebar on desktop */}
      <div>
        <details className="lg:hidden border border-gray-200 rounded-md group" open={false}>
          <summary className="flex items-center justify-between px-4 h-12 cursor-pointer list-none font-semibold text-brand-navy">
            <span>
              Filters{activeCount > 0 && <span className="ml-2 text-xs bg-brand-navy text-white rounded-full px-2 py-0.5">{activeCount}</span>}
            </span>
            <span aria-hidden className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="px-4 pb-5 pt-2 border-t border-gray-100">{filters}</div>
        </details>
        <div className="hidden lg:block sticky top-24">{filters}</div>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <p className="text-sm text-brand-muted" aria-live="polite">
            <span className="font-semibold text-brand-navy tabular-nums">{result.total.toLocaleString("en-GB")}</span>{" "}
            {result.total === 1 ? "document" : "documents"}
            {params.q && (
              <>
                {" "}
                for <span className="font-semibold text-brand-navy">&ldquo;{params.q}&rdquo;</span>
              </>
            )}
          </p>
          <AutoSubmitForm action={basePath} className="flex items-center gap-2">
            {(Object.keys(params) as (keyof SearchParams)[]).flatMap((k) => {
              if (k === "sort" || k === "page") return [];
              const v = params[k];
              const values = Array.isArray(v) ? v : v !== undefined ? [String(v)] : [];
              return values.map((val) => <input key={`${k}-${val}`} type="hidden" name={k} value={val} />);
            })}
            <label htmlFor="sort" className="text-sm text-brand-muted">
              Sort
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={params.sort}
              className="h-9 rounded border border-gray-300 text-sm text-brand-navy pl-2.5 pr-8 focus:border-brand-navy focus:ring-brand-navy/20"
            >
              {(Object.keys(SORT_LABELS) as (keyof typeof SORT_LABELS)[])
                .filter((s) => s !== "relevance" || params.q)
                .map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
            </select>
            <noscript>
              <button type="submit" className="h-9 px-3 rounded border border-gray-300 text-sm">
                Sort
              </button>
            </noscript>
          </AutoSubmitForm>
        </div>

        {chips.length > 0 && (
          <ul className="flex flex-wrap gap-2 pt-4" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="inline-flex items-center gap-1.5 text-sm bg-brand-light text-brand-navy rounded-full pl-3 pr-2 py-1 hover:bg-gray-200"
                  aria-label={`Remove filter ${c.label}`}
                >
                  {c.label} <span aria-hidden className="text-brand-muted">✕</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {result.items.length ? (
          <DocumentList docs={result.items} showCountry={showCountry} />
        ) : (
          <EmptyState
            title={params.q || activeCount ? "No documents match your search." : "No documents have been published here yet."}
            action={
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold">
                {(params.q || activeCount > 0) && (
                  <Link href={basePath} className="text-brand-teal hover:text-brand-navy">
                    Clear search and filters
                  </Link>
                )}
                <Link href="/hp-hub/submit" className="text-brand-teal hover:text-brand-navy">
                  Suggest a missing document
                </Link>
              </div>
            }
          >
            {params.q ? "Try fewer or different words, check the spelling, or remove a filter." : "Records appear here once they have been reviewed and published."}
          </EmptyState>
        )}

        <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => `${basePath}${toQueryString(params, { page: p })}`} />
      </div>
    </div>
  );
}
