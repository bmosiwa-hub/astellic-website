/**
 * Shared presentational pieces for the public HP-Hub. Server components; no
 * client JavaScript unless a component says otherwise.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ACCESS_LABELS, VERIFICATION_LABELS } from "@/lib/hp-hub/constants";

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-brand-gold text-sm font-bold uppercase tracking-[0.2em] ${className}`}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  id,
}: {
  eyebrow?: string;
  title: string;
  action?: { href: string; label: string };
  id?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-gray-200 pb-4 mb-2">
      <div>
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-muted mb-1.5">{eyebrow}</p>}
        <h2 id={id} className="text-2xl font-bold text-brand-navy">
          {title}
        </h2>
      </div>
      {action && (
        <Link href={action.href} className="shrink-0 text-sm font-semibold text-brand-teal hover:text-brand-navy transition-colors">
          {action.label} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

export function AccessBadge({ access }: { access: keyof typeof ACCESS_LABELS }) {
  const style =
    access === "HOSTED"
      ? "text-brand-teal border-brand-teal/30 bg-brand-teal/5"
      : access === "RESTRICTED"
        ? "text-amber-800 border-amber-300 bg-amber-50"
        : "text-brand-navy border-brand-navy/20 bg-white";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-wider border rounded px-1.5 py-0.5 ${style}`}>
      {ACCESS_LABELS[access]}
    </span>
  );
}

export function VerificationBadge({ status }: { status: keyof typeof VERIFICATION_LABELS }) {
  if (status !== "VERIFIED") {
    return <span className="text-xs text-brand-muted">{VERIFICATION_LABELS[status]}</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green">
      <svg aria-hidden className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z" clipRule="evenodd" />
      </svg>
      Verified
    </span>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, tone = "light" }: { items: Crumb[]; tone?: "light" | "dark" }) {
  const base = tone === "dark" ? "text-gray-400" : "text-brand-muted";
  const link = tone === "dark" ? "hover:text-white" : "hover:text-brand-navy";
  const current = tone === "dark" ? "text-gray-200" : "text-brand-navy";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `https://www.astellic.com${c.href}` } : {}),
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className={`text-sm ${base}`}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => (
          <li key={`${c.label}-${i}`} className="flex items-center gap-2 min-w-0">
            {i > 0 && <span aria-hidden>/</span>}
            {c.href && i < items.length - 1 ? (
              <Link href={c.href} className={`${link} transition-colors`}>
                {c.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className={`${current} truncate max-w-[60vw] sm:max-w-md`}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(jsonLd) }} />
    </nav>
  );
}

/** JSON-LD serialiser that can't break out of the <script> element. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="py-12 border-b border-gray-100">
      <p className="font-semibold text-brand-navy mb-1.5">{title}</p>
      {children && <div className="text-brand-muted text-sm leading-relaxed max-w-xl">{children}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Pagination({ page, pageCount, hrefFor }: { page: number; pageCount: number; hrefFor: (p: number) => string }) {
  if (pageCount <= 1) return null;
  const pages = new Set([1, pageCount, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pageCount));
  const sorted = [...pages].sort((a, b) => a - b);
  const btn = "min-w-10 h-10 inline-flex items-center justify-center px-3 rounded text-sm font-semibold transition-colors";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 pt-8">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={`${btn} border border-gray-200 text-brand-navy hover:border-brand-navy`}>
          <span aria-hidden>←</span>&nbsp;Previous
        </Link>
      ) : (
        <span />
      )}
      <ol className="hidden sm:flex items-center gap-1">
        {sorted.map((p, i) => (
          <li key={p} className="flex items-center gap-1">
            {i > 0 && sorted[i - 1] !== p - 1 && <span className="px-1 text-brand-muted">…</span>}
            {p === page ? (
              <span aria-current="page" className={`${btn} bg-brand-navy text-white`}>
                {p}
              </span>
            ) : (
              <Link href={hrefFor(p)} className={`${btn} text-brand-navy hover:bg-brand-light`}>
                {p}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <span className="sm:hidden text-sm text-brand-muted">
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} rel="next" className={`${btn} border border-gray-200 text-brand-navy hover:border-brand-navy`}>
          Next&nbsp;<span aria-hidden>→</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

/** Name + count lists used for browsing themes, types, publishers and years. */
export function CountList({
  items,
  hrefFor,
  columns = 2,
  hideEmpty = false,
}: {
  items: { key: string; label: string; count: number }[];
  hrefFor: (key: string) => string;
  columns?: 1 | 2 | 3;
  hideEmpty?: boolean;
}) {
  const shown = hideEmpty ? items.filter((i) => i.count > 0) : items;
  const cols = columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : "";
  return (
    <ul className={`grid ${cols} gap-x-10`}>
      {shown.map((i) => (
        <li key={i.key} className="border-b border-gray-100">
          <Link
            href={hrefFor(i.key)}
            className={`group flex items-baseline justify-between gap-4 py-3 text-[15px] hover:text-brand-teal transition-colors ${i.count ? "text-brand-navy" : "text-gray-500"}`}
          >
            <span className="group-hover:underline underline-offset-4 decoration-brand-teal/40">{i.label}</span>
            {i.count > 0 && <span className="tabular-nums text-sm text-brand-muted">{i.count}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
