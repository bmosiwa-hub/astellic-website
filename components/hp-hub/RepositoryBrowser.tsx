import Link from "next/link";
import { ACCESS_LABELS, VERIFICATION_LABELS } from "@/lib/hp-hub/constants";
import { searchDocuments, searchFacets, toQueryString, type Facet, type Facets, type SearchParams } from "@/lib/hp-hub/search";
import AutoSubmitForm from "./AutoSubmitForm";
import { DocumentList } from "./DocumentList";
import { Pagination } from "./ui";

type ListKey = "country" | "theme" | "type" | "publisher" | "language" | "access" | "verification";

const TITLES: Record<ListKey, string> = {
  country: "Country",
  theme: "Theme",
  type: "Document type",
  publisher: "Publisher",
  language: "Language",
  access: "Access",
  verification: "Verification",
};

const PRIMARY: ListKey[] = ["country", "theme", "type", "publisher"];
const SECONDARY: ListKey[] = ["language", "access", "verification"];

const SORTS = { relevance: "Relevance", newest: "Newest", oldest: "Oldest", title: "Title A–Z", added: "Recently added" } as const;

function label(key: ListKey, f: Facet): string {
  if (key === "access") return ACCESS_LABELS[f.value as keyof typeof ACCESS_LABELS] ?? f.label;
  if (key === "verification") return VERIFICATION_LABELS[f.value as keyof typeof VERIFICATION_LABELS] ?? f.label;
  return f.label;
}

const fieldInput =
  "w-full h-10 rounded border border-gray-300 bg-white px-2.5 text-sm text-brand-navy focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none";

function FacetGroup({ k, facets, params }: { k: ListKey; facets: Facets; params: SearchParams }) {
  const list = facets[k];
  const selected = params[k] ?? [];
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-brand-navy mb-2">{TITLES[k]}</legend>
      <ul className={`space-y-1 ${list.length > 7 ? "max-h-56 overflow-y-auto pr-1" : ""}`}>
        {list.map((f) => {
          const id = `f-${k}-${f.value}`;
          return (
            <li key={f.value}>
              <label htmlFor={id} className="flex items-start gap-2.5 py-1 text-sm text-gray-700 cursor-pointer hover:text-brand-navy">
                <input id={id} type="checkbox" name={k} value={f.value} defaultChecked={selected.includes(f.value)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-navy" />
                <span className="flex-1 leading-snug">{label(k, f)}</span>
                <span className="tabular-nums text-xs text-brand-muted pt-0.5">{f.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

/**
 * Search results with filters. `locked` dimensions come from the page itself
 * (e.g. the theme on a theme page): they are applied but not offered as filters.
 */
export default async function RepositoryBrowser({
  params,
  basePath,
  locked = {},
  showCountry = true,
  emptyMessage,
}: {
  params: SearchParams;
  basePath: string;
  locked?: Partial<Pick<SearchParams, ListKey>>;
  showCountry?: boolean;
  emptyMessage?: string;
}) {
  const effective: SearchParams = { ...params, ...locked };
  const [result, facets] = await Promise.all([searchDocuments(effective), searchFacets(effective)]);
  const lockedKeys = new Set(Object.keys(locked) as ListKey[]);
  const href = (o: Partial<SearchParams>) => `${basePath}${toQueryString(params, { page: 1, ...o })}`;
  const offered = (k: ListKey) =>
    !lockedKeys.has(k) && facets[k].length > 0 && !(k === "country" && facets.country.length < 2 && !params.country?.length);

  const primary = PRIMARY.filter(offered);
  const secondary = SECONDARY.filter(offered);

  // Active filter chips, each removing just itself.
  const chips: { label: string; href: string; secondary?: boolean }[] = [];
  for (const k of [...PRIMARY, ...SECONDARY]) {
    if (lockedKeys.has(k)) continue;
    for (const v of params[k] ?? []) {
      const f = facets[k].find((x) => x.value === v);
      chips.push({ label: f ? label(k, f) : v, href: href({ [k]: (params[k] ?? []).filter((x) => x !== v) }), secondary: SECONDARY.includes(k) });
    }
  }
  if (params.yearFrom || params.yearTo) chips.push({ label: `Published ${params.yearFrom ?? "…"}–${params.yearTo ?? "…"}`, href: href({ yearFrom: undefined, yearTo: undefined }) });
  if (params.covers) chips.push({ label: `Covers ${params.covers}`, href: href({ covers: undefined }), secondary: true });
  const clearHref = `${basePath}${toQueryString({ q: params.q })}`;
  const secondaryActive = chips.some((c) => c.secondary);

  const years = facets.year.map((y) => Number(y.value));
  const hasYears = years.length > 0;

  const filterForm = (
    <AutoSubmitForm action={basePath} ariaLabel="Filter results" className="space-y-6">
      {params.q && <input type="hidden" name="q" value={params.q} />}
      {params.sort && <input type="hidden" name="sort" value={params.sort} />}
      {primary.map((k) => (
        <FacetGroup key={k} k={k} facets={facets} params={params} />
      ))}
      {hasYears && (
        <fieldset>
          <legend className="text-sm font-semibold text-brand-navy mb-2">Publication year</legend>
          <div className="flex items-center gap-2">
            <label className="sr-only" htmlFor="yearFrom">From year</label>
            <input id="yearFrom" name="yearFrom" type="number" inputMode="numeric" min={1900} max={2100} placeholder={String(Math.min(...years))} defaultValue={params.yearFrom} className={fieldInput} />
            <span className="text-brand-muted" aria-hidden>–</span>
            <label className="sr-only" htmlFor="yearTo">To year</label>
            <input id="yearTo" name="yearTo" type="number" inputMode="numeric" min={1900} max={2100} placeholder={String(Math.max(...years))} defaultValue={params.yearTo} className={fieldInput} />
          </div>
        </fieldset>
      )}
      {(secondary.length > 0 || hasYears) && (
        <details open={secondaryActive} className="group border-t border-gray-200 pt-4">
          <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-brand-navy">
            More filters
            <span aria-hidden className="text-brand-muted transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="space-y-6 pt-4">
            {secondary.map((k) => (
              <FacetGroup key={k} k={k} facets={facets} params={params} />
            ))}
            <fieldset>
              <legend className="text-sm font-semibold text-brand-navy mb-2">Period covered</legend>
              <label htmlFor="covers" className="block text-xs text-brand-muted mb-1.5">
                Documents covering the year
              </label>
              <input id="covers" name="covers" type="number" inputMode="numeric" min={1900} max={2100} placeholder="e.g. 2025" defaultValue={params.covers} className={fieldInput} />
            </fieldset>
          </div>
        </details>
      )}
      <div className="flex items-center gap-4 pt-1">
        <button type="submit" className="h-11 px-5 rounded bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90">
          Apply
        </button>
        {chips.length > 0 && (
          <Link href={clearHref} className="text-sm text-brand-muted hover:text-brand-navy underline underline-offset-4">
            Clear all filters
          </Link>
        )}
      </div>
    </AutoSubmitForm>
  );

  const anyFilters = primary.length + secondary.length > 0 || hasYears;
  const sortKeys = (["relevance", "newest", "oldest"] as const).filter((s) => s !== "relevance" || params.q);
  const currentSort = params.sort ?? (params.q ? "relevance" : "newest");

  return (
    <div className={anyFilters ? "grid lg:grid-cols-[250px_minmax(0,1fr)] gap-6 lg:gap-12" : ""}>
      {anyFilters && (
        <div>
          <details className="lg:hidden rounded-md border border-gray-200 group">
            <summary className="flex items-center justify-between px-4 h-12 cursor-pointer list-none font-semibold text-brand-navy">
              <span>
                Filters
                {chips.length > 0 && <span className="ml-2 text-xs bg-brand-navy text-white rounded-full px-2 py-0.5">{chips.length}</span>}
              </span>
              <span aria-hidden className="transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="px-4 pb-5 pt-3 border-t border-gray-100">{filterForm}</div>
          </details>
          <div className="hidden lg:block sticky top-24">{filterForm}</div>
        </div>
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <p className="text-sm text-brand-muted" aria-live="polite">
            {result.total > 0 ? (
              <>
                <span className="font-semibold text-brand-navy tabular-nums">{result.total.toLocaleString("en-GB")}</span> {result.total === 1 ? "document" : "documents"}
                {params.q && (
                  <>
                    {" "}
                    for <span className="font-semibold text-brand-navy">&ldquo;{params.q}&rdquo;</span>
                  </>
                )}
              </>
            ) : (
              "No documents found"
            )}
          </p>
          {result.total > 1 && (
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
              <select id="sort" name="sort" defaultValue={currentSort} className="h-10 rounded border border-gray-300 text-sm text-brand-navy pl-2.5 pr-8">
                {sortKeys.map((s) => (
                  <option key={s} value={s}>
                    {SORTS[s]}
                  </option>
                ))}
                {!(sortKeys as readonly string[]).includes(currentSort) && <option value={currentSort}>{SORTS[currentSort]}</option>}
              </select>
              <noscript>
                <button type="submit" className="h-10 px-3 rounded border border-gray-300 text-sm">
                  Sort
                </button>
              </noscript>
            </AutoSubmitForm>
          )}
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <ul className="contents" aria-label="Active filters">
              {chips.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} aria-label={`Remove filter ${c.label}`} className="inline-flex items-center gap-1.5 text-sm bg-brand-light text-brand-navy rounded-full pl-3 pr-2 py-1.5 hover:bg-gray-200">
                    {c.label} <span aria-hidden className="text-brand-muted">✕</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={clearHref} className="inline-block py-1.5 text-sm text-brand-muted hover:text-brand-navy underline underline-offset-4 ml-1">
              Clear all filters
            </Link>
          </div>
        )}

        {result.items.length ? (
          <DocumentList docs={result.items} showCountry={showCountry} />
        ) : (
          <div className="py-10 max-w-xl">
            <p className="font-semibold text-brand-navy mb-1.5">
              {params.q || chips.length ? "No documents match your search." : emptyMessage ?? "Nothing has been published here yet."}
            </p>
            <p className="text-sm text-brand-muted leading-relaxed">
              {params.q || chips.length
                ? "Try fewer or different words, check the spelling, or remove a filter."
                : "We’re actively sourcing, cataloguing and verifying health-policy documents."}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm font-semibold">
              {(params.q || chips.length > 0) && (
                <Link href={basePath} className="text-brand-teal hover:text-brand-navy">
                  Clear search and filters
                </Link>
              )}
              <Link href="/hp-hub/themes" className="text-brand-teal hover:text-brand-navy">
                Browse themes
              </Link>
              <Link href="/hp-hub/submit" className="text-brand-teal hover:text-brand-navy">
                Suggest a document
              </Link>
            </div>
          </div>
        )}

        <Pagination page={result.page} pageCount={result.pageCount} hrefFor={(p) => `${basePath}${toQueryString(params, { page: p })}`} />
      </div>
    </div>
  );
}
