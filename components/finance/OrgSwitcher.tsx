"use client";

/**
 * OrgSwitcher — sidebar widget for selecting the active organisation.
 * Writes the chosen org ID into the `astelfin_org` cookie via a small API
 * route, then hard-navigates to reload all server data with the new context.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface Org {
  id:        string;
  name:      string;
  shortCode: string;
}

interface Props {
  orgs:      Org[];
  activeId:  string | null;
}

export function OrgSwitcher({ orgs, activeId }: Props) {
  const router    = useRouter();
  const [pending, startTransition] = useTransition();
  const [open,    setOpen]         = useState(false);

  if (orgs.length === 0) return null; // single-entity mode — hide entirely

  const current = orgs.find((o) => o.id === activeId) ?? orgs[0];

  async function switchOrg(orgId: string) {
    setOpen(false);
    await fetch("/api/org/switch", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ orgId }),
    });
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-navy/5 hover:bg-brand-navy/10 transition-colors text-left"
        aria-label="Switch organisation"
      >
        {/* Entity badge */}
        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-[10px] font-bold uppercase leading-none">
          {current.shortCode.slice(0, 2)}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[11px] text-gray-400 leading-none mb-0.5">Organisation</span>
          <span className="block text-xs font-semibold text-brand-navy truncate">{current.name}</span>
        </span>
        {pending ? (
          <svg className="w-3.5 h-3.5 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        ) : (
          <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
          {orgs.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => switchOrg(org.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${
                org.id === activeId ? "bg-brand-gold/5" : ""
              }`}
            >
              <span className="w-6 h-6 rounded-md bg-brand-gold/20 text-brand-gold flex items-center justify-center text-[10px] font-bold uppercase leading-none flex-shrink-0">
                {org.shortCode.slice(0, 2)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs font-semibold text-brand-navy truncate">{org.name}</span>
                <span className="block text-[10px] text-gray-400">{org.shortCode}</span>
              </span>
              {org.id === activeId && (
                <svg className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
