/** Small pure text helpers shared by HP-Hub server and client code. */

export function slugify(input: string, maxLength = 80): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/** Splits "a; b, c" or multi-line input into trimmed, de-duplicated values. */
export function splitList(input: string | null | undefined, separators = /[;\n,]/): string[] {
  if (!input) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of input.split(separators)) {
    const v = raw.trim().replace(/\s+/g, " ");
    if (!v) continue;
    const key = v.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(v);
  }
  return out;
}

export function normaliseKeyword(k: string): string {
  return k.trim().replace(/\s+/g, " ").toLowerCase().slice(0, 80);
}

export function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n >= 10 || i === 0 ? Math.round(n) : n.toFixed(1)} ${units[i]}`;
}

export function fileTypeLabel(mime: string | null | undefined, fileName?: string | null): string {
  if (mime === "application/pdf") return "PDF";
  if (mime?.includes("wordprocessingml") || mime === "application/msword") return "Word";
  if (mime?.includes("spreadsheetml") || mime === "application/vnd.ms-excel") return "Excel";
  if (mime?.includes("presentationml")) return "PowerPoint";
  const ext = fileName?.split(".").pop();
  return ext ? ext.toUpperCase() : "File";
}

export function periodLabel(start: number | null | undefined, end: number | null | undefined): string | null {
  if (start && end) return start === end ? String(start) : `${start}–${end}`;
  if (start) return `From ${start}`;
  if (end) return `Until ${end}`;
  return null;
}

/** Trims a description to a sentence-friendly length for meta tags and listings. */
export function excerpt(text: string | null | undefined, max = 220): string {
  if (!text) return "";
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).replace(/[,;:.\s]+$/, "")}…`;
}

export interface CitationInput {
  title: string;
  authors: string[];
  publisherName: string;
  publicationYear: number | null;
  countryName: string;
  documentTypeName: string;
  sourceUrl?: string | null;
  edition?: string | null;
  version?: string | null;
}

/**
 * A plain author–date citation. Government documents usually have an
 * institutional author, so the publisher stands in when no authors are given.
 */
export function buildCitation(d: CitationInput): string {
  const who = d.authors.length
    ? d.authors.length > 3
      ? `${d.authors[0]} et al.`
      : d.authors.join(", ")
    : d.publisherName;
  const year = d.publicationYear ? `(${d.publicationYear})` : "(n.d.)";
  const edition = [d.edition, d.version ? `Version ${d.version}` : null].filter(Boolean).join(", ");
  const parts = [
    `${who} ${year}.`,
    `${d.title.replace(/\.$/, "")}${edition ? ` (${edition})` : ""}.`,
    d.authors.length ? `${d.publisherName}, ${d.countryName}.` : `${d.countryName}.`,
  ];
  if (d.sourceUrl) parts.push(`Available at: ${d.sourceUrl}`);
  return parts.join(" ");
}

export function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Escapes text for safe inclusion in HTML when we must build markup by hand. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
