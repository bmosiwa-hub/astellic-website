/**
 * Repository search on PostgreSQL full-text search.
 *
 *  - Weighted tsvector per document (title > keywords/themes/type >
 *    publisher/authors > abstract/description), rebuilt by
 *    hp_document_refresh_search() whenever a document changes.
 *  - Prefix matching for partial words ("malar" → malaria); quoted phrases
 *    and -exclusions via websearch_to_tsquery; trigram similarity on titles
 *    to tolerate small spelling mistakes.
 *  - Every filter is a parameterised SQL fragment (no string concatenation
 *    of user input). Facet counts exclude their own dimension so a user can
 *    widen a multi-select filter.
 *
 * Future full-text PDF/OCR indexing only needs another weighted component
 * (e.g. an HpDocumentText table) folded into hp_document_refresh_search().
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "./constants";
import { listInclude, type ListDocument } from "./queries";
import { escapeHtml } from "./text";
import { showSyntheticRecords } from "./visibility";

export const SORTS = ["relevance", "newest", "oldest", "title", "added"] as const;
export type SortKey = (typeof SORTS)[number];

export interface SearchParams {
  q?: string;
  country?: string[];
  theme?: string[];
  type?: string[];
  publisher?: string[];
  yearFrom?: number;
  yearTo?: number;
  /** Documents whose period covered includes this year. */
  covers?: number;
  language?: string[];
  access?: string[];
  verification?: string[];
  sort?: SortKey;
  page?: number;
  pageSize?: number;
}

type Dimension =
  | "country"
  | "theme"
  | "type"
  | "publisher"
  | "year"
  | "language"
  | "access"
  | "verification"
  | "period";

const ACCESS_VALUES = new Set(["HOSTED", "EXTERNAL", "RESTRICTED"]);
const VERIFICATION_VALUES = new Set(["UNVERIFIED", "PENDING_VERIFICATION", "VERIFIED", "DISPUTED"]);

// ── Query-string parsing ─────────────────────────────────────────────────────

function list(v: string | string[] | undefined, max = 20): string[] {
  const arr = Array.isArray(v) ? v : v ? [v] : [];
  return [...new Set(arr.flatMap((x) => x.split(",")).map((x) => x.trim()).filter(Boolean))]
    .filter((x) => x.length <= 120)
    .slice(0, max);
}

function year(v: string | string[] | undefined): number | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  const n = Number(s);
  return Number.isInteger(n) && n >= 1900 && n <= 2100 ? n : undefined;
}

export function parseSearchParams(sp: Record<string, string | string[] | undefined>): SearchParams {
  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim().slice(0, 200) || undefined;
  const sortRaw = Array.isArray(sp.sort) ? sp.sort[0] : sp.sort;
  const sort = (SORTS as readonly string[]).includes(sortRaw ?? "") ? (sortRaw as SortKey) : q ? "relevance" : "newest";
  const pageNum = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page);
  return {
    q,
    country: list(sp.country),
    theme: list(sp.theme),
    type: list(sp.type),
    publisher: list(sp.publisher),
    yearFrom: year(sp.yearFrom),
    yearTo: year(sp.yearTo),
    covers: year(sp.covers),
    language: list(sp.language),
    access: list(sp.access).filter((a) => ACCESS_VALUES.has(a)),
    verification: list(sp.verification).filter((v) => VERIFICATION_VALUES.has(v)),
    sort: sort === "relevance" && !q ? "newest" : sort,
    page: Number.isInteger(pageNum) && pageNum > 0 ? Math.min(pageNum, 1000) : 1,
  };
}

/** Serialises params back to a query string (for links that change one thing). */
export function toQueryString(p: SearchParams, overrides: Partial<SearchParams> = {}): string {
  const merged = { ...p, ...overrides };
  const usp = new URLSearchParams();
  if (merged.q) usp.set("q", merged.q);
  for (const key of ["country", "theme", "type", "publisher", "language", "access", "verification"] as const) {
    for (const v of merged[key] ?? []) usp.append(key, v);
  }
  if (merged.yearFrom) usp.set("yearFrom", String(merged.yearFrom));
  if (merged.yearTo) usp.set("yearTo", String(merged.yearTo));
  if (merged.covers) usp.set("covers", String(merged.covers));
  const defaultSort = merged.q ? "relevance" : "newest";
  if (merged.sort && merged.sort !== defaultSort) usp.set("sort", merged.sort);
  if (merged.page && merged.page > 1) usp.set("page", String(merged.page));
  const s = usp.toString();
  return s ? `?${s}` : "";
}

// ── Text query → tsquery ─────────────────────────────────────────────────────

/**
 * Builds a safe to_tsquery() expression with prefix matching on every term.
 * Only letters and digits survive, so no tsquery operators can be injected;
 * the result is still passed as a bound parameter.
 */
export function buildPrefixQuery(q: string): string | null {
  const terms = q
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2 || /\d/.test(t))
    .slice(0, 12);
  if (!terms.length) return null;
  return terms.map((t) => `${t}:*`).join(" & ");
}

function usesWebSyntax(q: string): boolean {
  return /["]|(^|\s)-\w|\bor\b/i.test(q);
}

function tsQuerySql(q: string): Prisma.Sql | null {
  if (usesWebSyntax(q)) return Prisma.sql`websearch_to_tsquery('english', ${q})`;
  const prefix = buildPrefixQuery(q);
  return prefix ? Prisma.sql`to_tsquery('english', ${prefix})` : null;
}

// ── WHERE builder ────────────────────────────────────────────────────────────

function whereSql(p: SearchParams, tsq: Prisma.Sql | null, except?: Dimension): Prisma.Sql {
  const parts: Prisma.Sql[] = [Prisma.sql`d."status" = 'PUBLISHED'`];
  if (!showSyntheticRecords()) parts.push(Prisma.sql`d."isSynthetic" = false`);

  if (p.q) {
    if (tsq) {
      parts.push(
        p.q.length >= 4
          ? Prisma.sql`(d."searchVector" @@ ${tsq} OR similarity(d."title", ${p.q}) > 0.3)`
          : Prisma.sql`d."searchVector" @@ ${tsq}`,
      );
    } else {
      parts.push(Prisma.sql`d."title" ILIKE ${`%${p.q.replace(/[%_\\]/g, "\\$&")}%`}`);
    }
  }

  const inList = (col: Prisma.Sql, values: string[] | undefined) =>
    values && values.length ? Prisma.sql`${col} IN (${Prisma.join(values)})` : null;

  const filters: [Dimension, Prisma.Sql | null][] = [
    [
      "country",
      p.country?.length
        ? Prisma.sql`EXISTS (SELECT 1 FROM "HpCountry" c WHERE c."id" = d."countryId" AND c."slug" IN (${Prisma.join(p.country)}))`
        : null,
    ],
    [
      "theme",
      p.theme?.length
        ? Prisma.sql`EXISTS (SELECT 1 FROM "HpDocumentTheme" dt JOIN "HpTheme" t ON t."id" = dt."themeId"
                      WHERE dt."documentId" = d."id" AND t."slug" IN (${Prisma.join(p.theme)}))`
        : null,
    ],
    [
      "type",
      p.type?.length
        ? Prisma.sql`EXISTS (SELECT 1 FROM "HpDocumentType" ty WHERE ty."id" = d."documentTypeId" AND ty."slug" IN (${Prisma.join(p.type)}))`
        : null,
    ],
    [
      "publisher",
      p.publisher?.length
        ? Prisma.sql`EXISTS (SELECT 1 FROM "HpPublisher" pb WHERE pb."id" = d."publisherId" AND pb."slug" IN (${Prisma.join(p.publisher)}))`
        : null,
    ],
    [
      "year",
      p.yearFrom || p.yearTo
        ? Prisma.sql`d."publicationYear" BETWEEN ${p.yearFrom ?? 1900} AND ${p.yearTo ?? 2100}`
        : null,
    ],
    [
      "period",
      p.covers
        ? Prisma.sql`(d."startYear" IS NOT NULL OR d."endYear" IS NOT NULL)
                     AND coalesce(d."startYear", d."endYear") <= ${p.covers}
                     AND coalesce(d."endYear", d."startYear") >= ${p.covers}`
        : null,
    ],
    ["language", inList(Prisma.sql`d."language"`, p.language)],
    ["access", inList(Prisma.sql`d."accessType"::text`, p.access)],
    ["verification", inList(Prisma.sql`d."verificationStatus"::text`, p.verification)],
  ];
  for (const [dim, sql] of filters) if (sql && dim !== except) parts.push(sql);

  return Prisma.join(parts, " AND ");
}

function orderSql(p: SearchParams, tsq: Prisma.Sql | null): Prisma.Sql {
  switch (p.sort) {
    case "relevance":
      if (p.q && tsq) {
        return Prisma.sql`(ts_rank_cd(coalesce(d."searchVector", ''::tsvector), ${tsq}, 32)
                           + similarity(d."title", ${p.q}) * 0.5) DESC, d."publicationYear" DESC NULLS LAST, d."id"`;
      }
      return Prisma.sql`d."publicationYear" DESC NULLS LAST, d."createdAt" DESC, d."id"`;
    case "oldest":
      return Prisma.sql`d."publicationYear" ASC NULLS LAST, d."createdAt" ASC, d."id"`;
    case "title":
      return Prisma.sql`lower(d."title") ASC, d."id"`;
    case "added":
      return Prisma.sql`d."createdAt" DESC, d."id"`;
    case "newest":
    default:
      return Prisma.sql`d."publicationYear" DESC NULLS LAST, d."createdAt" DESC, d."id"`;
  }
}

// Highlight markers that can't occur in normal text; replaced after escaping.
const HL_START = "\u0002";
const HL_END = "\u0003";

/** Escapes a ts_headline() result and turns our markers into <mark> tags. */
export function renderHighlight(raw: string | null): string | null {
  if (!raw) return null;
  return escapeHtml(raw).replaceAll(HL_START, "<mark>").replaceAll(HL_END, "</mark>");
}

// ── Main search ──────────────────────────────────────────────────────────────

const documentListInclude = listInclude;

export type DocumentListItem = ListDocument & {
  highlightTitle?: string | null;
  highlightSnippet?: string | null;
};

export interface SearchResult {
  items: DocumentListItem[];
  total: number;
  page: number;
  pageCount: number;
  pageSize: number;
}

export async function searchDocuments(p: SearchParams): Promise<SearchResult> {
  const pageSize = p.pageSize ?? PAGE_SIZE;
  const page = p.page ?? 1;
  const tsq = p.q ? tsQuerySql(p.q) : null;
  const where = whereSql(p, tsq);

  const headlineOpts = `StartSel=${HL_START},StopSel=${HL_END},MaxWords=40,MinWords=18,MaxFragments=2,FragmentDelimiter= … `;
  const headline =
    p.q && tsq
      ? Prisma.sql`ts_headline('english', d."title", ${tsq}, ${`StartSel=${HL_START},StopSel=${HL_END},HighlightAll=true`}) AS "hlTitle",
                   ts_headline('english', coalesce(d."abstract", d."description", ''), ${tsq}, ${headlineOpts}) AS "hlSnippet"`
      : Prisma.sql`NULL::text AS "hlTitle", NULL::text AS "hlSnippet"`;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<{ id: string; hlTitle: string | null; hlSnippet: string | null }[]>`
      SELECT d."id", ${headline}
      FROM "HpDocument" d
      WHERE ${where}
      ORDER BY ${orderSql(p, tsq)}
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}`,
    prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*)::bigint AS n FROM "HpDocument" d WHERE ${where}`,
  ]);

  const total = Number(countRows[0]?.n ?? 0);
  const docs = rows.length
    ? await prisma.hpDocument.findMany({ where: { id: { in: rows.map((r) => r.id) } }, include: documentListInclude })
    : [];
  const byId = new Map(docs.map((d) => [d.id, d]));
  const items: DocumentListItem[] = rows.flatMap((r) => {
    const d = byId.get(r.id);
    if (!d) return [];
    return [
      {
        ...d,
        highlightTitle: renderHighlight(r.hlTitle),
        // Only show a snippet when it actually contains a match.
        highlightSnippet: r.hlSnippet?.includes(HL_START) ? renderHighlight(r.hlSnippet) : null,
      },
    ];
  });

  return { items, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

// ── Facets ───────────────────────────────────────────────────────────────────

export interface Facet {
  value: string;
  label: string;
  count: number;
}

export interface Facets {
  country: Facet[];
  theme: Facet[];
  type: Facet[];
  publisher: Facet[];
  year: Facet[];
  language: Facet[];
  access: Facet[];
  verification: Facet[];
}

export async function searchFacets(p: SearchParams): Promise<Facets> {
  const tsq = p.q ? tsQuerySql(p.q) : null;
  const w = (except: Dimension) => whereSql(p, tsq, except);
  type Row = { value: string; label: string; count: bigint };
  const run = (sql: Prisma.Sql) =>
    prisma.$queryRaw<Row[]>(sql).then((rows) => rows.map((r) => ({ value: r.value, label: r.label, count: Number(r.count) })));

  const [country, theme, type, publisher, year, language, access, verification] = await Promise.all([
    run(Prisma.sql`SELECT c."slug" AS value, c."name" AS label, count(*) AS count
      FROM "HpDocument" d JOIN "HpCountry" c ON c."id" = d."countryId"
      WHERE ${w("country")} GROUP BY c."slug", c."name" ORDER BY c."name"`),
    run(Prisma.sql`SELECT t."slug" AS value, t."name" AS label, count(*) AS count
      FROM "HpDocument" d JOIN "HpDocumentTheme" dt ON dt."documentId" = d."id" JOIN "HpTheme" t ON t."id" = dt."themeId"
      WHERE ${w("theme")} GROUP BY t."slug", t."name", t."sortOrder" ORDER BY count(*) DESC, t."sortOrder"`),
    run(Prisma.sql`SELECT ty."slug" AS value, ty."name" AS label, count(*) AS count
      FROM "HpDocument" d JOIN "HpDocumentType" ty ON ty."id" = d."documentTypeId"
      WHERE ${w("type")} GROUP BY ty."slug", ty."name", ty."sortOrder" ORDER BY count(*) DESC, ty."sortOrder"`),
    run(Prisma.sql`SELECT pb."slug" AS value, coalesce(pb."acronym", pb."name") AS label, count(*) AS count
      FROM "HpDocument" d JOIN "HpPublisher" pb ON pb."id" = d."publisherId"
      WHERE ${w("publisher")} GROUP BY pb."slug", pb."name", pb."acronym" ORDER BY count(*) DESC, pb."name" LIMIT 30`),
    run(Prisma.sql`SELECT d."publicationYear"::text AS value, d."publicationYear"::text AS label, count(*) AS count
      FROM "HpDocument" d WHERE ${w("year")} AND d."publicationYear" IS NOT NULL
      GROUP BY d."publicationYear" ORDER BY d."publicationYear" DESC`),
    run(Prisma.sql`SELECT d."language" AS value, d."language" AS label, count(*) AS count
      FROM "HpDocument" d WHERE ${w("language")} GROUP BY d."language" ORDER BY count(*) DESC`),
    run(Prisma.sql`SELECT d."accessType"::text AS value, d."accessType"::text AS label, count(*) AS count
      FROM "HpDocument" d WHERE ${w("access")} GROUP BY d."accessType"`),
    run(Prisma.sql`SELECT d."verificationStatus"::text AS value, d."verificationStatus"::text AS label, count(*) AS count
      FROM "HpDocument" d WHERE ${w("verification")} GROUP BY d."verificationStatus"`),
  ]);

  return { country, theme, type, publisher, year, language, access, verification };
}
