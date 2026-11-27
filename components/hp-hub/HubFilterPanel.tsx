/**
 * Left-hand "Find documents" panel for the HP-Hub homepage: keywords plus the
 * main filters, submitted as an ordinary GET form to /hp-hub/search (works
 * without JavaScript). Long lists show the most-used options first and keep
 * the rest under "More…".
 */
import type { CountedItem } from "@/lib/hp-hub/queries";

const FEATURED_THEMES = [
  "health-systems-strengthening",
  "health-financing",
  "health-governance",
  "primary-health-care",
  "hiv-aids",
  "maternal-and-newborn-health",
  "tuberculosis",
  "digital-health",
];

const COMMON_TYPES = ["policy", "strategy", "strategic-plan", "guidelines", "annual-report", "evaluation", "assessment", "research-report"];

const input =
  "w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none";

function Options({ name, items, idPrefix }: { name: string; items: CountedItem[]; idPrefix: string }) {
  return (
    <ul className="space-y-0.5">
      {items.map((i) => {
        const id = `${idPrefix}-${name}-${i.slug}`;
        return (
          <li key={i.slug}>
            <label htmlFor={id} className="flex items-start gap-2.5 py-1 text-sm text-gray-700 cursor-pointer hover:text-brand-navy">
              <input id={id} type="checkbox" name={name} value={i.slug} className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-navy" />
              <span className="flex-1 leading-snug">{i.name}</span>
              {i.count > 0 && <span className="tabular-nums text-xs text-brand-muted pt-0.5">{i.count}</span>}
            </label>
          </li>
        );
      })}
    </ul>
  );
}

function Group({
  title,
  name,
  items,
  primary,
  moreLabel,
  idPrefix,
}: {
  title: string;
  name: string;
  items: CountedItem[];
  primary?: string[];
  moreLabel?: string;
  idPrefix: string;
}) {
  if (!items.length) return null;
  // Options with documents always come first among the "primary" set.
  const firstSet = primary ? items.filter((i) => primary.includes(i.slug) || i.count > 0) : items;
  const rest = primary ? items.filter((i) => !firstSet.includes(i)) : [];
  return (
    <fieldset>
      <legend className="text-xs font-bold uppercase tracking-[0.14em] text-brand-navy mb-2">{title}</legend>
      <Options name={name} items={firstSet} idPrefix={idPrefix} />
      {rest.length > 0 && (
        <details className="group mt-1">
          <summary className="cursor-pointer list-none py-1 text-sm font-semibold text-brand-teal hover:text-brand-navy">
            <span className="group-open:hidden">
              {moreLabel ?? "More"} ({rest.length})
            </span>
            <span className="hidden group-open:inline">Fewer</span>
          </summary>
          <div className="mt-1">
            <Options name={name} items={rest} idPrefix={idPrefix} />
          </div>
        </details>
      )}
    </fieldset>
  );
}

export default function HubFilterPanel({
  countries,
  themes,
  types,
  years,
  idPrefix = "hp",
}: {
  countries: CountedItem[];
  themes: CountedItem[];
  types: CountedItem[];
  years: { year: number; count: number }[];
  idPrefix?: string;
}) {
  const minYear = years.length ? Math.min(...years.map((y) => y.year)) : undefined;
  const maxYear = years.length ? Math.max(...years.map((y) => y.year)) : undefined;
  return (
    <form action="/hp-hub/search" method="get" role="search" aria-label="Search and filter documents" className="space-y-6">
      <div>
        <label htmlFor={`${idPrefix}-q`} className="text-xs font-bold uppercase tracking-[0.14em] text-brand-navy mb-2 block">
          Keywords
        </label>
        <input id={`${idPrefix}-q`} type="search" name="q" maxLength={200} placeholder="e.g. health financing" className={input} />
      </div>

      <Group title="Country" name="country" items={countries} idPrefix={idPrefix} />
      <Group title="Theme" name="theme" items={themes} primary={FEATURED_THEMES} moreLabel="More themes" idPrefix={idPrefix} />
      <Group title="Document type" name="type" items={types} primary={COMMON_TYPES} moreLabel="More types" idPrefix={idPrefix} />

      <fieldset>
        <legend className="text-xs font-bold uppercase tracking-[0.14em] text-brand-navy mb-2">Publication year</legend>
        <div className="flex items-center gap-2">
          <label htmlFor={`${idPrefix}-from`} className="sr-only">
            From year
          </label>
          <input id={`${idPrefix}-from`} name="yearFrom" type="number" inputMode="numeric" min={1900} max={2100} placeholder={minYear ? String(minYear) : "From"} className={input} />
          <span className="text-brand-muted" aria-hidden>
            –
          </span>
          <label htmlFor={`${idPrefix}-to`} className="sr-only">
            To year
          </label>
          <input id={`${idPrefix}-to`} name="yearTo" type="number" inputMode="numeric" min={1900} max={2100} placeholder={maxYear ? String(maxYear) : "To"} className={input} />
        </div>
      </fieldset>

      <div className="flex items-center gap-3 pt-1">
        <button type="submit" className="h-11 flex-1 rounded bg-brand-gold hover:bg-[#b8973f] text-white text-sm font-semibold transition-colors">
          Search
        </button>
        <button type="reset" className="h-11 px-3 text-sm text-brand-muted hover:text-brand-navy underline underline-offset-4">
          Reset
        </button>
      </div>
    </form>
  );
}
