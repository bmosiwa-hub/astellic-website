"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Props {
  initialQuery?: string;
  autoFocus?: boolean;
  /** "sidebar" = compact dark bar in the nav; "page" = full input on the results page. */
  variant?: "sidebar" | "page";
}

/**
 * Global Astelfin search input. Submitting navigates to /astelfin_26/search?q=…,
 * where the server renders permission-scoped results. Pressing "/" anywhere
 * focuses the sidebar box (unless the user is already typing in a field).
 */
export default function SearchBox({ initialQuery = "", autoFocus = false, variant = "sidebar" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setValue(initialQuery); }, [initialQuery]);

  useEffect(() => {
    if (variant !== "sidebar") return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q.length < 2) return;
    router.push(`/astelfin_26/search?q=${encodeURIComponent(q)}`);
  }

  const icon = (
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
    </svg>
  );

  if (variant === "page") {
    return (
      <form onSubmit={submit} className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search Astelfin…"
          className="w-full pl-11 pr-24 py-3 rounded-xl border border-gray-200 text-sm text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-gold/40 focus:border-brand-gold"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-gold hover:bg-brand-gold/90 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          Search
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search…"
        aria-label="Search Astelfin"
        className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/10 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:bg-white/15"
      />
      <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-sans text-gray-400 border border-white/20 rounded px-1.5 py-0.5 pointer-events-none">
        /
      </kbd>
    </form>
  );
}
