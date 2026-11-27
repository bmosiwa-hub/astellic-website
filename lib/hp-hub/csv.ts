/**
 * Bulk metadata import from CSV. Pure parsing + validation; the admin action
 * shows a preview and only writes rows the user confirms.
 *
 * Files can't be attached through CSV, so imported rows are EXTERNAL or
 * RESTRICTED records. Hosted files are added afterwards on each record.
 */
import { documentInputSchema, fieldErrors, type DocumentInput } from "./validation";
import { splitList } from "./text";

export const MAX_IMPORT_ROWS = 1000;

export const CSV_COLUMNS = [
  { key: "title", required: true, help: "Full document title" },
  { key: "country", required: true, help: "Country name, slug or ISO code, e.g. Malawi" },
  { key: "document_type", required: true, help: "e.g. Policy, Strategic Plan, Guidelines" },
  { key: "publisher", required: true, help: "Name or acronym; new publishers are created" },
  { key: "source_url", required: true, help: "Link to the original source" },
  { key: "publication_year", required: false, help: "e.g. 2023" },
  { key: "publication_date", required: false, help: "YYYY-MM-DD" },
  { key: "authors", required: false, help: "Separate with semicolons" },
  { key: "themes", required: false, help: "Theme names, separated with semicolons" },
  { key: "primary_theme", required: false, help: "One of the themes" },
  { key: "keywords", required: false, help: "Separate with semicolons or commas" },
  { key: "description", required: false, help: "" },
  { key: "abstract", required: false, help: "" },
  { key: "language", required: false, help: "Defaults to English" },
  { key: "version", required: false, help: "" },
  { key: "edition", required: false, help: "" },
  { key: "start_year", required: false, help: "Period covered" },
  { key: "end_year", required: false, help: "Period covered" },
  { key: "access_type", required: false, help: "external (default) or restricted" },
  { key: "permission_status", required: false, help: "not_required (default), unknown, requested, granted, open_license, denied" },
  { key: "rights_holder", required: false, help: "" },
  { key: "rights_statement", required: false, help: "" },
  { key: "citation", required: false, help: "Leave blank to generate" },
  { key: "notes", required: false, help: "Internal notes" },
] as const;

const ALIASES: Record<string, string> = {
  type: "document_type",
  doc_type: "document_type",
  year: "publication_year",
  url: "source_url",
  source: "source_url",
  link: "source_url",
  author: "authors",
  theme: "themes",
  keyword: "keywords",
  access: "access_type",
  permission: "permission_status",
  date: "publication_date",
};

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF, BOM). */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function headerKey(h: string): string {
  const k = h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return ALIASES[k] ?? k;
}

export interface CsvLookups {
  countries: { id: string; slug: string; name: string; isoCode: string }[];
  types: { id: string; slug: string; name: string }[];
  themes: { id: string; slug: string; name: string }[];
  publishers: { id: string; name: string; acronym: string | null }[];
}

export interface CsvRow {
  row: number; // 1-based line number in the file (header = 1)
  input: DocumentInput;
  newPublisher: boolean;
}

export interface CsvError {
  row: number;
  message: string;
}

const norm = (s: string) => s.trim().toLowerCase();

export function parseCsvRows(text: string, lookups: CsvLookups): { rows: CsvRow[]; errors: CsvError[]; total: number } {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], errors: [{ row: 1, message: "The file has no data rows." }], total: 0 };

  const headers = table[0].map(headerKey);
  const missing = CSV_COLUMNS.filter((c) => c.required && !headers.includes(c.key)).map((c) => c.key);
  if (missing.length) {
    return { rows: [], errors: [{ row: 1, message: `Missing required column(s): ${missing.join(", ")}` }], total: 0 };
  }

  const data = table.slice(1);
  if (data.length > MAX_IMPORT_ROWS) {
    return { rows: [], errors: [{ row: 1, message: `Import at most ${MAX_IMPORT_ROWS} rows at a time.` }], total: data.length };
  }

  const find = <T extends { name: string; slug?: string; isoCode?: string; acronym?: string | null }>(list: T[], v: string) => {
    const n = norm(v);
    return list.find((x) => norm(x.name) === n || (x.slug && x.slug === n) || (x.isoCode && norm(x.isoCode) === n) || (x.acronym && norm(x.acronym) === n));
  };

  const rows: CsvRow[] = [];
  const errors: CsvError[] = [];

  data.forEach((cells, i) => {
    const line = i + 2;
    const get = (key: string) => {
      const idx = headers.indexOf(key);
      return idx >= 0 ? (cells[idx] ?? "").trim() : "";
    };
    const problems: string[] = [];

    const country = find(lookups.countries, get("country"));
    if (!country) problems.push(`Unknown country "${get("country")}"`);
    const type = find(lookups.types, get("document_type"));
    if (!type) problems.push(`Unknown document type "${get("document_type")}"`);

    const themeIds: string[] = [];
    for (const t of splitList(get("themes"), /[;\n]/)) {
      const theme = find(lookups.themes, t);
      if (theme) themeIds.push(theme.id);
      else problems.push(`Unknown theme "${t}"`);
    }
    const primary = get("primary_theme") ? find(lookups.themes, get("primary_theme")) : undefined;
    if (get("primary_theme") && !primary) problems.push(`Unknown primary theme "${get("primary_theme")}"`);
    if (primary && !themeIds.includes(primary.id)) themeIds.push(primary.id);

    const publisherName = get("publisher");
    const publisher = publisherName ? find(lookups.publishers, publisherName) : undefined;

    const access = (get("access_type") || "external").toUpperCase();
    if (access === "HOSTED") problems.push("HOSTED records need an uploaded file; import as external and attach the file on the record");
    else if (access !== "EXTERNAL" && access !== "RESTRICTED") problems.push(`Unknown access type "${get("access_type")}"`);

    const permission = (get("permission_status") || "not_required").toUpperCase();

    if (problems.length) {
      errors.push({ row: line, message: problems.join("; ") });
      return;
    }

    const parsed = documentInputSchema.safeParse({
      title: get("title"),
      countryId: country!.id,
      documentTypeId: type!.id,
      publisherId: publisher?.id ?? "",
      newPublisherName: publisher ? "" : publisherName,
      publicationYear: get("publication_year"),
      publicationDate: get("publication_date"),
      startYear: get("start_year"),
      endYear: get("end_year"),
      authors: get("authors"),
      description: get("description"),
      abstract: get("abstract"),
      language: get("language"),
      version: get("version"),
      edition: get("edition"),
      themeIds,
      primaryThemeId: primary?.id ?? "",
      keywords: get("keywords"),
      sourceUrl: get("source_url"),
      citationText: get("citation"),
      notes: get("notes"),
      accessType: access,
      permissionStatus: permission,
      rightsHolder: get("rights_holder"),
      rightsStatement: get("rights_statement"),
      hasFile: false,
    });
    if (!parsed.success) {
      errors.push({ row: line, message: Object.entries(fieldErrors(parsed.error)).map(([k, m]) => `${k}: ${m}`).join("; ") });
      return;
    }
    rows.push({ row: line, input: parsed.data, newPublisher: !publisher });
  });

  return { rows, errors, total: data.length };
}

export function csvTemplate(): string {
  const header = CSV_COLUMNS.map((c) => c.key).join(",");
  return `${header}\n`;
}
