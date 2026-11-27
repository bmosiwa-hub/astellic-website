"use client";

/**
 * "Find documents" panel shown on every public HP-Hub page. Keywords,
 * searchable country / theme / document-type dropdowns, publication year,
 * and "More filters" (language, access, verification, period covered).
 *
 * It pre-fills itself from where the visitor is: the current search's filters
 * on /hp-hub/search, the country on a country page, the theme or type on
 * theme/type pages. Submits as a GET form to /hp-hub/search.
 */
import { usePathname, useSearchParams } from "next/navigation";
import FilterDropdown from "./FilterDropdown";

export interface PanelItem {
  slug: string;
  name: string;
  count: number;
}

export interface FilterPanelData {
  countries: PanelItem[];
  themes: PanelItem[];
  types: PanelItem[];
  years: { year: number; count: number }[];
  languages: { language: string; count: number }[];
}

const ACCESS = [
  { value: "HOSTED", label: "Hosted download" },
  { value: "EXTERNAL", label: "External source" },
  { value: "RESTRICTED", label: "Restricted access" },
];

const VERIFICATION = [
  { value: "VERIFIED", label: "Verified" },
  { value: "PENDING_VERIFICATION", label: "Verification pending" },
  { value: "UNVERIFIED", label: "Unverified" },
];

const input =
  "w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none";
const heading = "text-xs font-bold uppercase tracking-[0.14em] text-brand-navy mb-2";

/** Options with documents first, then the rest in their usual order. */
const toOptions = (items: PanelItem[]) =>
  [...items].sort((a, b) => Number(b.count > 0) - Number(a.count > 0)).map((i) => ({ value: i.slug, label: i.name, count: i.count }));

export default function HubFilterPanel({ data, idPrefix }: { data: FilterPanelData; idPrefix: string }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const all = (k: string) => sp.getAll(k).flatMap((v) => v.split(",")).filter(Boolean);

  // Pre-select from the page being viewed.
  const seg = pathname.split("/").filter(Boolean); // ["hp-hub", ...]
  const country = all("country");
  const theme = all("theme");
  const type = all("type");
  if (seg.length === 2 && data.countries.some((c) => c.slug === seg[1]) && !country.includes(seg[1])) country.push(seg[1]);
  if (seg[1] === "themes" && seg[2] && !theme.includes(seg[2])) theme.push(seg[2]);
  if (seg[1] === "types" && seg[2] && !type.includes(seg[2])) type.push(seg[2]);

  const access = all("access");
  const verification = all("verification");
  const language = all("language");
  const moreActive = access.length + verification.length + language.length > 0 || !!sp.get("covers");
  const years = data.years.map((y) => y.year);

  // Remount the form whenever the page or query changes so defaults refresh.
  const key = `${pathname}?${sp.toString()}`;

  return (
    <form
      key={key}
      action="/hp-hub/search"
      method="get"
      role="search"
      aria-label="Search and filter documents"
      className="space-y-5"
      onSubmit={(e) => {
        // Leave empty fields out of the URL so result links stay short.
        const els = Array.from(e.currentTarget.elements) as HTMLInputElement[];
        for (const el of els) if (el.name && !el.value) el.disabled = true;
        setTimeout(() => els.forEach((el) => (el.disabled = false)), 0);
      }}
    >
      <div>
        <label htmlFor={`${idPrefix}-q`} className={`${heading} block`}>
          Keywords
        </label>
        <input id={`${idPrefix}-q`} type="search" name="q" defaultValue={sp.get("q") ?? ""} maxLength={200} placeholder="e.g. health financing" className={input} />
      </div>

      {data.countries.length > 0 && (
        <FilterDropdown label="Country" name="country" options={toOptions(data.countries)} defaultSelected={country} allLabel="All countries" searchPlaceholder="Search countries…" />
      )}
      <FilterDropdown label="Theme" name="theme" options={toOptions(data.themes)} defaultSelected={theme} allLabel="All themes" searchPlaceholder="Search themes…" />
      <FilterDropdown label="Document type" name="type" options={toOptions(data.types)} defaultSelected={type} allLabel="All document types" searchPlaceholder="Search document types…" />

      <fieldset>
        <legend className={heading}>Publication year</legend>
        <div className="flex items-center gap-2">
          <label htmlFor={`${idPrefix}-from`} className="sr-only">
            From year
          </label>
          <input id={`${idPrefix}-from`} name="yearFrom" type="number" inputMode="numeric" min={1900} max={2100} defaultValue={sp.get("yearFrom") ?? ""} placeholder={years.length ? String(Math.min(...years)) : "From"} className={input} />
          <span className="text-brand-muted" aria-hidden>
            –
          </span>
          <label htmlFor={`${idPrefix}-to`} className="sr-only">
            To year
          </label>
          <input id={`${idPrefix}-to`} name="yearTo" type="number" inputMode="numeric" min={1900} max={2100} defaultValue={sp.get("yearTo") ?? ""} placeholder={years.length ? String(Math.max(...years)) : "To"} className={input} />
        </div>
      </fieldset>

      <details open={moreActive} className="group/more border-t border-gray-200 pt-4">
        <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-brand-navy">
          More filters
          <span aria-hidden className="text-brand-muted transition-transform group-open/more:rotate-180">
            ⌄
          </span>
        </summary>
        <div className="space-y-5 pt-4">
          {data.languages.length > 1 && (
            <FilterDropdown
              label="Language"
              name="language"
              options={data.languages.map((l) => ({ value: l.language, label: l.language, count: l.count }))}
              defaultSelected={language}
              allLabel="All languages"
              searchPlaceholder="Search languages…"
            />
          )}
          <fieldset>
            <legend className={heading}>Access</legend>
            {ACCESS.map((o) => (
              <label key={o.value} className="flex items-center gap-2.5 py-1 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="access" value={o.value} defaultChecked={access.includes(o.value)} className="h-4 w-4 rounded border-gray-300" />
                {o.label}
              </label>
            ))}
          </fieldset>
          <fieldset>
            <legend className={heading}>Verification</legend>
            {VERIFICATION.map((o) => (
              <label key={o.value} className="flex items-center gap-2.5 py-1 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" name="verification" value={o.value} defaultChecked={verification.includes(o.value)} className="h-4 w-4 rounded border-gray-300" />
                {o.label}
              </label>
            ))}
          </fieldset>
          <div>
            <label htmlFor={`${idPrefix}-covers`} className={`${heading} block`}>
              Period covered
            </label>
            <input id={`${idPrefix}-covers`} name="covers" type="number" inputMode="numeric" min={1900} max={2100} defaultValue={sp.get("covers") ?? ""} placeholder="Covers the year, e.g. 2025" className={input} />
          </div>
        </div>
      </details>

      {sp.get("sort") && <input type="hidden" name="sort" value={sp.get("sort")!} />}
      <div className="flex items-center gap-3 pt-1">
        <button type="submit" className="h-11 flex-1 rounded bg-brand-gold hover:bg-[#b8973f] text-white text-sm font-semibold transition-colors">
          Search
        </button>
        <a href="/hp-hub/search" className="h-11 inline-flex items-center px-3 text-sm text-brand-muted hover:text-brand-navy underline underline-offset-4">
          Clear
        </a>
      </div>
    </form>
  );
}
