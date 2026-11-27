/** Shared admin-portal building blocks (server components). */
import Link from "next/link";
import type { ReactNode } from "react";

export const inputCls =
  "w-full h-10 rounded border border-gray-300 bg-white px-3 text-sm text-brand-navy focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/15 outline-none aria-[invalid=true]:border-red-400";
export const textareaCls = `${inputCls} h-auto py-2`;
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded bg-brand-navy text-white text-sm font-semibold hover:bg-brand-navy/90 disabled:opacity-60";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded border border-gray-300 bg-white text-brand-navy text-sm font-semibold hover:border-brand-navy disabled:opacity-60";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 h-10 px-4 rounded border border-red-300 bg-white text-red-700 text-sm font-semibold hover:bg-red-50";

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8">
      {back && (
        <Link href={back.href} className="text-sm text-brand-muted hover:text-brand-navy">
          ← {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 mt-1">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{title}</h1>
          {description && <p className="text-sm text-brand-muted mt-1 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, children, actions, className = "" }: { title?: string; children: ReactNode; actions?: ReactNode; className?: string }) {
  return (
    <section className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {title && (
        <div className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-bold text-brand-navy">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const TONES: Record<string, string> = {
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-50 text-blue-800",
  green: "bg-green-50 text-green-800",
  amber: "bg-amber-50 text-amber-800",
  red: "bg-red-50 text-red-800",
  teal: "bg-teal-50 text-teal-800",
  navy: "bg-brand-navy text-white",
};

export function Pill({ tone = "gray", children }: { tone?: keyof typeof TONES; children: ReactNode }) {
  return <span className={`inline-flex items-center whitespace-nowrap text-xs font-semibold rounded px-2 py-0.5 ${TONES[tone]}`}>{children}</span>;
}

export const STATUS_TONE: Record<string, keyof typeof TONES> = {
  DRAFT: "gray",
  PENDING_REVIEW: "amber",
  PUBLISHED: "green",
  ARCHIVED: "gray",
  UNVERIFIED: "gray",
  PENDING_VERIFICATION: "amber",
  VERIFIED: "green",
  DISPUTED: "red",
  ACQUIRED: "green",
  MISSING: "red",
  NEEDS_VERIFICATION: "amber",
  BROKEN_LINK: "red",
  PERMISSION_REQUIRED: "blue",
  NEEDS_UPDATING: "amber",
  NEW: "blue",
  IN_REVIEW: "amber",
  ACCEPTED: "green",
  REJECTED: "gray",
  DUPLICATE: "gray",
  OPEN: "blue",
  RESOLVED: "green",
  DISMISSED: "gray",
  SENT: "blue",
  AWAITING_RESPONSE: "amber",
  RESPONDED: "teal",
  DOCUMENT_RECEIVED: "green",
  DECLINED: "red",
  NO_RESPONSE: "gray",
};

export function Stat({ label, value, href, tone }: { label: string; value: number | string; href?: string; tone?: "alert" }) {
  const body = (
    <>
      <p className={`text-2xl font-bold tabular-nums ${tone === "alert" && value ? "text-red-700" : "text-brand-navy"}`}>{value}</p>
      <p className="text-xs text-brand-muted mt-1">{label}</p>
    </>
  );
  return href ? (
    <Link href={href} className="block bg-white border border-gray-200 rounded-lg px-4 py-3.5 hover:border-brand-navy transition-colors">
      {body}
    </Link>
  ) : (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3.5">{body}</div>
  );
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-brand-muted border-b border-gray-100">
            {head.map((h, i) => (
              <th key={i} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "error" | "warn"; children: ReactNode }) {
  const cls =
    tone === "success"
      ? "bg-green-50 border-green-200 text-green-900"
      : tone === "error"
        ? "bg-red-50 border-red-200 text-red-900"
        : tone === "warn"
          ? "bg-amber-50 border-amber-200 text-amber-900"
          : "bg-blue-50 border-blue-200 text-blue-900";
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`border rounded px-4 py-3 text-sm ${cls}`}>
      {children}
    </div>
  );
}

export function fmtDate(d: Date | null | undefined, withTime = false): string {
  if (!d) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
    timeZone: "Africa/Blantyre",
  });
}

export function dateInputValue(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : "";
}

/** Reads ?ok= / ?err= flash parameters set by server-action redirects. */
export function Flash({ ok, err }: { ok?: string; err?: string }) {
  if (!ok && !err) return null;
  return <div className="mb-6">{err ? <Notice tone="error">{err}</Notice> : <Notice tone="success">{ok}</Notice>}</div>;
}
