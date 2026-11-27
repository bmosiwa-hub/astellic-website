"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
  count?: number;
}

/**
 * Multi-select dropdown with a type-to-narrow search box, for HP-Hub filters.
 * Selected values are submitted as hidden inputs named `name`, so it works
 * inside ordinary GET forms. The list opens in the page flow (not a floating
 * layer), so it is never clipped inside scrolling sidebars and works on phones.
 *
 * With `autoSubmit`, the "Apply" button submits the surrounding form.
 */
export default function FilterDropdown({
  label,
  name,
  options,
  defaultSelected = [],
  allLabel,
  searchPlaceholder,
  autoSubmit = false,
}: {
  label: string;
  name: string;
  options: DropdownOption[];
  defaultSelected?: string[];
  allLabel: string;
  searchPlaceholder: string;
  autoSubmit?: boolean;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  // Close on Escape or when clicking elsewhere.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Reset with the surrounding form's Reset button.
  useEffect(() => {
    const form = rootRef.current?.closest("form");
    if (!form) return;
    const onReset = () => {
      setSelected([]);
      setQuery("");
    };
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  function close() {
    setOpen(false);
    setQuery("");
    rootRef.current?.querySelector<HTMLButtonElement>("button[data-trigger]")?.focus();
  }

  const toggle = (v: string) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const summary = selected.length === 0 ? allLabel : selected.length === 1 ? labelOf(selected[0]) : `${selected.length} selected`;

  return (
    <div ref={rootRef}>
      <span id={`${id}-label`} className="block text-xs font-bold uppercase tracking-[0.14em] text-brand-navy mb-2">
        {label}
      </span>
      <button
        type="button"
        data-trigger
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => (open ? close() : setOpen(true))}
        className={`w-full h-10 flex items-center justify-between gap-2 rounded border bg-white px-3 text-left text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/15 ${
          open ? "border-brand-navy" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <span id={`${id}-value`} className={`truncate ${selected.length ? "text-brand-navy font-medium" : "text-gray-500"}`}>
          {summary}
        </span>
        <svg aria-hidden className={`w-4 h-4 shrink-0 text-brand-muted transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {selected.map((v) => (
        <input key={v} type="hidden" name={name} value={v} />
      ))}

      {open && (
        <div className="mt-1 rounded border border-gray-300 bg-white shadow-sm">
          <div className="p-2 border-b border-gray-100">
            <label htmlFor={`${id}-search`} className="sr-only">
              {searchPlaceholder}
            </label>
            <input
              ref={searchRef}
              id={`${id}-search`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // Enter picks the single remaining match instead of submitting the form.
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (shown.length === 1) toggle(shown[0].value);
                }
              }}
              placeholder={searchPlaceholder}
              autoComplete="off"
              className="w-full h-9 rounded border border-gray-200 px-2.5 text-sm text-brand-navy placeholder:text-gray-400 focus:border-brand-navy focus:outline-none"
            />
          </div>
          <ul role="listbox" aria-multiselectable="true" aria-labelledby={`${id}-label`} className="max-h-60 overflow-y-auto py-1">
            {shown.map((o) => {
              const checked = selected.includes(o.value);
              const optId = `${id}-o-${o.value}`;
              return (
                <li key={o.value} role="option" aria-selected={checked}>
                  <label htmlFor={optId} className="flex items-start gap-2.5 px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-brand-light">
                    <input id={optId} type="checkbox" checked={checked} onChange={() => toggle(o.value)} className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-navy" />
                    <span className="flex-1 leading-snug">{o.label}</span>
                    {!!o.count && <span className="tabular-nums text-xs text-brand-muted pt-0.5">{o.count}</span>}
                  </label>
                </li>
              );
            })}
            {shown.length === 0 && <li className="px-3 py-3 text-sm text-brand-muted">No matches for &ldquo;{query}&rdquo;</li>}
          </ul>
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setSelected([])}
              disabled={!selected.length}
              className="h-8 text-sm text-brand-muted hover:text-brand-navy underline underline-offset-4 disabled:opacity-40 disabled:no-underline"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                if (autoSubmit) setTimeout(() => rootRef.current?.closest("form")?.requestSubmit(), 0);
              }}
              className="h-8 px-4 rounded bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90"
            >
              {autoSubmit ? "Apply" : "Done"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
