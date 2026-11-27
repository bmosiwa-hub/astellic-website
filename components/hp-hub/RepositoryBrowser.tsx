import Link from "next/link";
import { ACCESS_LABELS, VERIFICATION_LABELS } from "@/lib/hp-hub/constants";
import { searchDocuments, searchFacets, toQueryString, type Facet, type SearchParams } from "@/lib/hp-hub/search";
import AutoSubmitForm from "./AutoSubmitForm";
import { DocumentList } from "./DocumentList";
import { Pagination } from "./ui";

type ListKey = "country" | "theme" | "type" | "publisher" | "language" | "access" | "verification";
const KEYS: ListKey[] = ["country", "theme", "type", "publisher", "language", "access", "verification"];

const SORTS = { relevance: "Relevance", newest: "Newest", oldest: "Oldest", title: "Title A–Z", added: "Recently added" } as const;

function label(key: ListKey, f: Facet): string {
  if (key === "access") return ACCESS_LABELS[f.value as keyof typeof ACCESS_LABELS] ?? f.label;
  if (key === "verification") return VERIFICATION_LABELS[f.value as keyof typeof VERIFICATION_LABELS] ?? f.label;
  return f.label;
}

/**
 * Search results: count, sort, active filters (each removable) and the
 * document list. Filters are chosen in the "Find documents" panel that the
 * HP-Hub layout shows on every page. `locked` dimensions come from the page
 * itself (e.g. the theme on a theme page) and aren't shown as removable.
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

  // Active filter chips, each removing just itself.
  const chips: { label: string; href: string }[] = [];
  for (const k of KEYS) {
    if (lockedKeys.has(k)) continue;
    for (const v of params[k] ?? []) {
      const f = facets[k].find((x) => x.value === v);
      chips.push({ label: f ? label(k, f) : v.replace(/-/g, " "), href: href({ [k]: (params[k] ?? []).filter((x) => x !== v) }) });
    }
  }
  if (params.yearFrom || params.yearTo) chips.push({ label: `Published ${params.yearFrom ?? "…"}–${params.yearTo ?? "…"}`, href: href({ yearFrom: undefined, yearTo: undefined }) });
  if (params.covers) chips.push({ label: `Covers ${params.covers}`, href: href({ covers: undefined }) });
  const clearHref = `${basePath}${toQueryString({ q: params.q })}`;

  const sortKeys = (["relevance", "newest", "oldest"] as const).filter((s) => s !== "relevance" || params.q);
  const currentSort = params.sort ?? (params.q ? "relevance" : "newest");

  return (
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
  );
}
