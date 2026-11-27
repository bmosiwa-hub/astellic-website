/**
 * Discovery: searches public document repositories for health policy
 * documents and flags which ones are not yet in HP-Hub.
 *
 * Sources (all free, no paid APIs):
 *  - World Bank Documents & Reports (search.worldbank.org/api/v3/wds), filtered
 *    by country on the server.
 *  - WHO IRIS (iris.who.int, DSpace 7 REST). It has no server-side country
 *    filter, so the country name is added to the query and results are kept
 *    only when tagged with the country (who.country.iso) or naming it.
 *  - ReliefWeb (api.reliefweb.int), only when RELIEFWEB_APPNAME is set: their
 *    API needs an app name you request (free) from ReliefWeb.
 *
 * Nothing here decides rights: licence text is passed through so a person
 * can judge whether a file may be hosted.
 */
import { prisma } from "@/lib/prisma";

export type SourceId = "worldbank" | "who" | "reliefweb";

export const SOURCES: Record<SourceId, { label: string; site: string }> = {
  worldbank: { label: "World Bank Documents & Reports", site: "documents.worldbank.org" },
  who: { label: "WHO IRIS", site: "iris.who.int" },
  reliefweb: { label: "ReliefWeb", site: "reliefweb.int" },
};

export function availableSources(): SourceId[] {
  return process.env.RELIEFWEB_APPNAME ? ["worldbank", "who", "reliefweb"] : ["worldbank", "who"];
}

export interface DiscoveredDoc {
  source: SourceId;
  externalId: string;
  title: string;
  year: number | null;
  date: string | null;
  publisher: string | null;
  docType: string | null;
  summary: string | null;
  pageUrl: string; // record page at the source
  fileUrl: string | null; // direct file (usually PDF) when given
  language: string | null;
  licence: string | null;
  rightsHolder: string | null;
}

export interface DiscoveryQuery {
  q: string;
  country: { name: string; isoCode: string } | null;
  sources: SourceId[];
  yearFrom?: number;
  page: number;
}

export interface SourceOutcome {
  source: SourceId;
  total: number | null;
  error: string | null;
  items: DiscoveredDoc[];
}

export const DISCOVERY_PAGE_SIZE = 20;
const TIMEOUT_MS = 25_000;
const UA = "AstellicHPHub/1.0 (+https://www.astellic.com/hp-hub)";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Lowercase alphanumeric words, for title comparison. */
export function normaliseTitle(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normaliseUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try {
    const x = new URL(u);
    return `${x.hostname.replace(/^www\./, "")}${x.pathname.replace(/\/+$/, "")}`.toLowerCase();
  } catch {
    return null;
  }
}

function yearOf(date: string | null | undefined): number | null {
  const m = date?.match(/(19|20)\d{2}/);
  return m ? Number(m[0]) : null;
}

function clean(s: unknown, max = 600): string | null {
  if (typeof s !== "string") return null;
  const t = s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return t ? (t.length > max ? `${t.slice(0, max - 1)}…` : t) : null;
}

function https(u: unknown): string | null {
  if (typeof u !== "string" || !u) return null;
  const v = u.replace(/^http:\/\//, "https://");
  return /^https:\/\//.test(v) ? v : null;
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    headers: { "User-Agent": UA, Accept: "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    // Identical searches within an hour reuse the source's answer.
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ── World Bank ───────────────────────────────────────────────────────────────

type WbDoc = {
  id?: string;
  display_title?: string;
  docdt?: string;
  pdfurl?: string;
  url?: string;
  docty?: string;
  repnme?: string;
  count?: string;
  lang?: string;
  abstracts?: { "cdata!"?: string } | string;
};

export function parseWorldBank(json: unknown): { total: number; items: DiscoveredDoc[] } {
  const j = json as { total?: number; documents?: Record<string, WbDoc> };
  const items: DiscoveredDoc[] = [];
  for (const [key, d] of Object.entries(j.documents ?? {})) {
    if (!key.startsWith("D") || !d?.display_title) continue;
    const page = https(d.url) ?? (d.id ? `https://documents.worldbank.org/en/publication/documents-reports/documentdetail/${d.id}` : null);
    if (!page) continue;
    const abstract = typeof d.abstracts === "string" ? d.abstracts : d.abstracts?.["cdata!"];
    items.push({
      source: "worldbank",
      externalId: d.id ?? key,
      title: clean(d.display_title, 400)!,
      year: yearOf(d.docdt),
      date: d.docdt?.slice(0, 10) ?? null,
      publisher: "World Bank",
      docType: clean(d.docty, 80),
      summary: clean(abstract),
      pageUrl: page,
      fileUrl: https(d.pdfurl),
      language: clean(d.lang, 40),
      licence: null,
      rightsHolder: null,
    });
  }
  return { total: Number(j.total ?? items.length), items };
}

const WORLD_BANK_TYPES = [
  "Brief",
  "Working Paper",
  "Working Paper (Numbered Series)",
  "Policy Research Working Paper",
  "Publication",
  "Report",
  "Policy Note",
  "Book",
  "Journal Article",
  "Pre-2003 Economic or Sector Report",
  "Economic & Sector Work",
  "Public Expenditure Review",
  "Country Economic Memorandum",
  "Systematic Country Diagnostic",
  "Country Partnership Framework",
  "Poverty Reduction Strategy Paper (PRSP)",
  "Health Nutrition and Population (HNP) Discussion Paper",
  "Implementation Completion and Results Report",
  "Project Performance Assessment Report",
];

async function searchWorldBank(q: DiscoveryQuery): Promise<SourceOutcome> {
  const p = new URLSearchParams({
    format: "json",
    qterm: q.q || "health",
    rows: String(DISCOVERY_PAGE_SIZE),
    os: String((q.page - 1) * DISCOVERY_PAGE_SIZE),
    fl: "display_title,docdt,pdfurl,url,docty,repnme,count,lang,abstracts",
    sort: "docdt",
    order: "desc",
  });
  if (q.country) p.set("count_exact", q.country.name);
  // Analysis and policy material only; leaves out project paperwork
  // (procurement plans, safeguard reviews, appraisal documents…).
  p.set("docty_exact", WORLD_BANK_TYPES.join("^"));
  if (q.yearFrom) p.set("strdate", `${q.yearFrom}-01-01`);
  const { total, items } = parseWorldBank(await getJson(`https://search.worldbank.org/api/v3/wds?${p}`));
  return { source: "worldbank", total, error: null, items };
}

// ── WHO IRIS ─────────────────────────────────────────────────────────────────

type DsMeta = Record<string, { value: string }[]>;
type DsObject = { _embedded?: { indexableObject?: { uuid?: string; name?: string; handle?: string; metadata?: DsMeta } } };

const first = (m: DsMeta, k: string) => m[k]?.[0]?.value ?? null;

export function parseWho(json: unknown, country: { name: string; isoCode: string } | null): { total: number; items: DiscoveredDoc[] } {
  const j = json as { _embedded?: { searchResult?: { page?: { totalElements?: number }; _embedded?: { objects?: DsObject[] } } } };
  const sr = j._embedded?.searchResult;
  const items: DiscoveredDoc[] = [];
  for (const o of sr?._embedded?.objects ?? []) {
    const it = o._embedded?.indexableObject;
    const m = it?.metadata;
    if (!it || !m) continue;
    const title = first(m, "dc.title") ?? it.name;
    if (!title) continue;
    if (country) {
      const isoTags = (m["who.country.iso"] ?? []).map((v) => v.value.toUpperCase());
      const text = [title, ...(m["dc.subject.mesh"] ?? []).map((v) => v.value), ...(m["dc.subject"] ?? []).map((v) => v.value)].join(" ").toLowerCase();
      if (!isoTags.includes(country.isoCode.toUpperCase()) && !text.includes(country.name.toLowerCase())) continue;
    }
    const page = https(first(m, "dc.identifier.uri")) ?? (it.handle ? `https://iris.who.int/handle/${it.handle}` : null);
    if (!page) continue;
    const licence = first(m, "dc.rights");
    items.push({
      source: "who",
      externalId: it.uuid ?? page,
      title: clean(title, 400)!,
      year: yearOf(first(m, "dc.date.issued")),
      date: first(m, "dc.date.issued"),
      publisher: clean(first(m, "dc.publisher"), 200) ?? "World Health Organization",
      docType: clean(first(m, "who.docsubtype") ?? first(m, "dc.type"), 80),
      summary: clean(first(m, "dc.description.abstract")),
      pageUrl: page,
      fileUrl: null,
      language: clean(first(m, "dc.language"), 40),
      licence: clean(licence, 200),
      rightsHolder: clean(first(m, "dc.rights.holder"), 200),
    });
  }
  return { total: Number(sr?.page?.totalElements ?? items.length), items };
}

/** Keeps only letters, digits and spaces so user text can't alter the Solr query. */
export function solrTerms(s: string): string {
  return s.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 150);
}

async function searchWho(q: DiscoveryQuery): Promise<SourceOutcome> {
  const words = solrTerms(q.q) || "health";
  // Few WHO records carry a country tag, so match the tag OR the country
  // name, then filter precisely afterwards. Relevance order keeps the
  // country's own documents first.
  const query = q.country
    ? `(who.country.iso:${q.country.isoCode.toUpperCase().replace(/[^A-Z]/g, "")} OR "${solrTerms(q.country.name)}") AND (${words})`
    : words;
  const size = q.country ? 60 : DISCOVERY_PAGE_SIZE;
  const p = new URLSearchParams({ query, dsoType: "ITEM", size: String(size), page: String(q.page - 1) });
  const json = await getJson(`https://iris.who.int/server/api/discover/search/objects?${p}`);
  const { items } = parseWho(json, q.country);
  const filtered = q.yearFrom ? items.filter((i) => !i.year || i.year >= q.yearFrom!) : items;
  // The source's total isn't meaningful after our country filter.
  return { source: "who", total: q.country ? null : Number((json as { _embedded?: { searchResult?: { page?: { totalElements?: number } } } })._embedded?.searchResult?.page?.totalElements ?? 0), error: null, items: filtered.slice(0, DISCOVERY_PAGE_SIZE) };
}

// ── ReliefWeb (optional) ─────────────────────────────────────────────────────

type RwItem = { id?: number; fields?: { title?: string; url_alias?: string; url?: string; date?: { original?: string }; source?: { name?: string }[]; format?: { name?: string }[]; file?: { url?: string; mimetype?: string }[]; language?: { name?: string }[]; "body-html"?: string } };

export function parseReliefWeb(json: unknown): { total: number; items: DiscoveredDoc[] } {
  const j = json as { totalCount?: number; data?: RwItem[] };
  const items: DiscoveredDoc[] = [];
  for (const r of j.data ?? []) {
    const f = r.fields;
    const page = https(f?.url_alias) ?? https(f?.url);
    if (!f?.title || !page) continue;
    items.push({
      source: "reliefweb",
      externalId: String(r.id ?? page),
      title: clean(f.title, 400)!,
      year: yearOf(f.date?.original),
      date: f.date?.original?.slice(0, 10) ?? null,
      publisher: f.source?.map((s) => s.name).filter(Boolean).join("; ") || null,
      docType: f.format?.[0]?.name ?? null,
      summary: clean(f["body-html"]),
      pageUrl: page,
      fileUrl: https(f.file?.find((x) => x.mimetype === "application/pdf")?.url ?? f.file?.[0]?.url),
      language: f.language?.[0]?.name ?? null,
      licence: null,
      rightsHolder: null,
    });
  }
  return { total: Number(j.totalCount ?? items.length), items };
}

async function searchReliefWeb(q: DiscoveryQuery, iso3: string | null): Promise<SourceOutcome> {
  const appname = process.env.RELIEFWEB_APPNAME;
  if (!appname) return { source: "reliefweb", total: null, error: "Not configured", items: [] };
  const conditions: object[] = [{ field: "theme.name", value: "Health" }];
  if (iso3) conditions.push({ field: "primary_country.iso3", value: iso3.toLowerCase() });
  if (q.yearFrom) conditions.push({ field: "date.original", value: { from: `${q.yearFrom}-01-01T00:00:00+00:00` } });
  const body = {
    ...(q.q ? { query: { value: q.q } } : {}),
    filter: { operator: "AND", conditions },
    fields: { include: ["title", "url_alias", "url", "date.original", "source.name", "format.name", "file.url", "file.mimetype", "language.name", "body-html"] },
    limit: DISCOVERY_PAGE_SIZE,
    offset: (q.page - 1) * DISCOVERY_PAGE_SIZE,
    sort: ["date.original:desc"],
  };
  const json = await getJson(`https://api.reliefweb.int/v2/reports?appname=${encodeURIComponent(appname)}`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
  const { total, items } = parseReliefWeb(json);
  return { source: "reliefweb", total, error: null, items };
}

// ISO2 → ISO3 for the countries HP-Hub is likely to cover (ReliefWeb uses ISO3).
const ISO3: Record<string, string> = {
  MW: "MWI", KE: "KEN", ZM: "ZMB", UG: "UGA", NG: "NGA", TZ: "TZA", MZ: "MOZ", ZW: "ZWE", ZA: "ZAF", ET: "ETH",
  GH: "GHA", RW: "RWA", BW: "BWA", LS: "LSO", SZ: "SWZ", NA: "NAM", SN: "SEN", CM: "CMR", CD: "COD", SL: "SLE",
};

// ── Orchestration ────────────────────────────────────────────────────────────

export async function discover(q: DiscoveryQuery): Promise<SourceOutcome[]> {
  const run: Record<SourceId, () => Promise<SourceOutcome>> = {
    worldbank: () => searchWorldBank(q),
    who: () => searchWho(q),
    reliefweb: () => searchReliefWeb(q, q.country ? ISO3[q.country.isoCode.toUpperCase()] ?? null : null),
  };
  const chosen = q.sources.filter((s) => availableSources().includes(s));
  const settled = await Promise.allSettled(chosen.map((s) => run[s]()));
  return settled.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          source: chosen[i],
          total: null,
          items: [],
          error: r.reason instanceof Error && r.reason.name === "TimeoutError" ? "The source took too long to respond." : "The source couldn't be reached right now.",
        },
  );
}

// ── "Already in HP-Hub?" ─────────────────────────────────────────────────────

export type HubMatch =
  | { kind: "document"; id: string; title: string; status: string }
  | { kind: "tracker"; id: string; title: string; status: string }
  | null;

/**
 * Matches discovered titles/URLs against catalogued documents and tracker
 * records: exact source URL, or a title similarity of at least 0.6 (pg_trgm),
 * so small wording differences still count as the same document.
 */
export async function matchAgainstHub(items: DiscoveredDoc[]): Promise<HubMatch[]> {
  if (!items.length) return [];
  const titles = items.map((i) => i.title);
  const [docs, tracked] = await Promise.all([
    prisma.$queryRaw<{ i: number; id: string; title: string; status: string; sim: number }[]>`
      SELECT DISTINCT ON (t.i) t.i, d."id", d."title", d."status"::text AS status, similarity(d."title", t.title) AS sim
      FROM unnest(${titles}::text[]) WITH ORDINALITY AS t(title, i)
      JOIN "HpDocument" d ON similarity(d."title", t.title) >= 0.6
      ORDER BY t.i, sim DESC`,
    prisma.$queryRaw<{ i: number; id: string; title: string; status: string; sim: number }[]>`
      SELECT DISTINCT ON (t.i) t.i, a."id", a."title", a."status"::text AS status, similarity(a."title", t.title) AS sim
      FROM unnest(${titles}::text[]) WITH ORDINALITY AS t(title, i)
      JOIN "HpAcquisitionItem" a ON similarity(a."title", t.title) >= 0.6
      ORDER BY t.i, sim DESC`,
  ]);

  const urls = items.flatMap((i) => [normaliseUrl(i.pageUrl), normaliseUrl(i.fileUrl)]).filter((u): u is string => !!u);
  const urlDocs = urls.length
    ? await prisma.hpDocument.findMany({ where: { sourceUrl: { not: null } }, select: { id: true, title: true, status: true, sourceUrl: true } })
    : [];
  const urlTracked = urls.length
    ? await prisma.hpAcquisitionItem.findMany({ where: { sourceUrl: { not: null } }, select: { id: true, title: true, status: true, sourceUrl: true } })
    : [];
  const byUrlDoc = new Map(urlDocs.map((d) => [normaliseUrl(d.sourceUrl), d]));
  const byUrlTrack = new Map(urlTracked.map((d) => [normaliseUrl(d.sourceUrl), d]));

  return items.map((item, idx) => {
    const keys = [normaliseUrl(item.pageUrl), normaliseUrl(item.fileUrl)].filter(Boolean) as string[];
    const ud = keys.map((k) => byUrlDoc.get(k)).find(Boolean);
    if (ud) return { kind: "document", id: ud.id, title: ud.title, status: ud.status };
    const d = docs.find((r) => Number(r.i) === idx + 1);
    if (d) return { kind: "document", id: d.id, title: d.title, status: d.status };
    const ut = keys.map((k) => byUrlTrack.get(k)).find(Boolean);
    if (ut) return { kind: "tracker", id: ut.id, title: ut.title, status: ut.status };
    const t = tracked.find((r) => Number(r.i) === idx + 1);
    if (t) return { kind: "tracker", id: t.id, title: t.title, status: t.status };
    return null;
  });
}

/**
 * Guess an HP-Hub document type from the source's type label, falling back to
 * the title when the label is generic (e.g. WHO's "Publications").
 */
export function guessDocumentTypeFor(d: { docType: string | null; title: string }, types: { id: string; name: string }[]): string | undefined {
  const generic = new Set([types.find((t) => t.name === "Technical Report")?.id, types.find((t) => t.name === "Other")?.id, undefined]);
  const fromLabel = guessDocumentType(d.docType, types);
  if (!generic.has(fromLabel)) return fromLabel;
  const fromTitle = guessDocumentType(d.title, types);
  return generic.has(fromTitle) ? fromLabel ?? fromTitle : fromTitle;
}

/** Guess an HP-Hub document type from a single label. */
export function guessDocumentType(label: string | null, types: { id: string; name: string }[]): string | undefined {
  if (!label) return undefined;
  const l = label.toLowerCase();
  const rules: [RegExp, string][] = [
    [/strategic plan/, "Strategic Plan"],
    [/country cooperation strategy|strateg(y|ies)/, "Strategy"],
    [/polic(y|ies)/, "Policy"],
    [/guideline/, "Guidelines"],
    [/framework/, "Framework"],
    [/evaluation|implementation completion|icr/, "Evaluation"],
    [/assessment|diagnostic/, "Assessment"],
    [/survey/, "Survey"],
    [/working paper/, "Working Paper"],
    [/annual report/, "Annual Report"],
    [/review/, "Review"],
    [/brief|fact sheet/, "Fact Sheet"],
    [/report|publication/, "Technical Report"],
  ];
  for (const [re, name] of rules) {
    if (re.test(l)) return types.find((t) => t.name === name)?.id;
  }
  return types.find((t) => t.name === "Other")?.id;
}
