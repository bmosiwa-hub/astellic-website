/**
 * Lightweight crawler for in-IMS manual refresh.
 * Fetches and parses a source, stores raw items to the DB (no AI — that runs separately).
 * Called by server actions on the Sources page.
 */

import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";
import { hashUrl, hashContent, checkDuplicate } from "./dedup";
import { passesSourceFilters } from "./filters";

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

// ── Types ─────────────────────────────────────────────────────────────────────

interface RawItem {
  title: string;
  link: string;
  description?: string;
  pubDate?: string;
  content?: string;
}

export interface CrawlResult {
  found: number;
  added: number;
  duplicates: number;
  errors: number;
  runId: string;
}

// ── RSS parser ────────────────────────────────────────────────────────────────

async function fetchRss(url: string): Promise<RawItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "AstellicIntelBot/1.0", Accept: "application/rss+xml,application/xml,text/xml,*/*" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);

  const xml = await res.text();
  const parsed = xmlParser.parse(xml);
  const items: RawItem[] = [];

  // RSS 2.0
  const rssItems = parsed?.rss?.channel?.item;
  if (rssItems) {
    const arr = Array.isArray(rssItems) ? rssItems : [rssItems];
    for (const item of arr) {
      const title = extractText(item.title);
      const link  = extractText(item.link) || extractText(item.guid);
      if (!title || !link) continue;
      items.push({
        title,
        link,
        description: extractText(item.description) || undefined,
        pubDate:     extractText(item.pubDate) || undefined,
        content:     extractText(item["content:encoded"]) || undefined,
      });
    }
    return items;
  }

  // Atom
  const atomEntries = parsed?.feed?.entry;
  if (atomEntries) {
    const arr = Array.isArray(atomEntries) ? atomEntries : [atomEntries];
    for (const entry of arr) {
      const title = extractText(entry.title);
      const link  = extractAtomLink(entry.link);
      if (!title || !link) continue;
      items.push({
        title,
        link,
        description: extractText(entry.summary) || undefined,
        pubDate:     extractText(entry.published) || extractText(entry.updated) || undefined,
        content:     extractText(entry.content) || undefined,
      });
    }
  }

  return items;
}

// ── WordPress Job Manager REST API fetcher ────────────────────────────────────
// Fetches from /wp-json/wp/v2/job-listings and filters by job type using
// the class_list field (e.g. "job-type-consultant", "job-type-short-term").
// The source tags drive which job types are included — any tag that matches
// a WP Job Manager type slug (consultant, contract, short-term, etc.) is used
// as a type filter. If no type tags are found, all listings are returned.

const WP_JOB_TYPE_SLUGS = new Set([
  "consultant","contract","freelance","full-time",
  "internship","part-time","short-term","temporary","training","volunteer",
]);

async function fetchWpJobManager(url: string, tags: string[]): Promise<RawItem[]> {
  const base = new URL(url);

  // Build type filters from source tags
  const typeFilters = tags
    .flatMap((t) => t.toLowerCase().split(/[\s,]+/))
    .filter((w) => WP_JOB_TYPE_SLUGS.has(w));

  const apiUrl = `${base.origin}/wp-json/wp/v2/job-listings?per_page=100&orderby=date&order=desc&_fields=id,title,link,date,excerpt,class_list`;

  const res = await fetch(apiUrl, {
    headers: { "User-Agent": "AstellicIntelBot/1.0", Accept: "application/json" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${apiUrl}`);

  const jobs: any[] = await res.json();
  if (!Array.isArray(jobs)) throw new Error("Unexpected response from WP REST API");

  const items: RawItem[] = [];

  for (const job of jobs) {
    // Filter by job type if type filters are specified
    if (typeFilters.length > 0) {
      const classList: string[] = Object.values(job.class_list ?? {});
      const jobTypeSlugs = classList
        .filter((c) => c.startsWith("job-type-"))
        .map((c) => c.replace("job-type-", ""));
      const matches = typeFilters.some((f) => jobTypeSlugs.includes(f));
      if (!matches) continue;
    }

    const title: string = (job.title?.rendered ?? "")
      .replace(/&#\d+;/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
    const link: string = job.link ?? "";
    if (!title || !link) continue;

    const description: string | undefined = job.excerpt?.rendered
      ? job.excerpt.rendered.replace(/<[^>]+>/g, "").trim() || undefined
      : undefined;

    items.push({ title, link, description, pubDate: job.date || undefined });
  }

  return items;
}

// ── HTML parser (basic — for JS-heavy sites use Railway Playwright) ───────────

async function fetchHtml(url: string): Promise<RawItem[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "AstellicIntelBot/1.0", Accept: "text/html,*/*" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);

  const html = await res.text();
  const items: RawItem[] = [];
  const seen = new Set<string>();
  const base = new URL(url);

  // Extract <a> tags that look like opportunity listings
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const opKeywords = /consult|tender|bid|rfp|rfq|evaluation|research|assessment|grant|procurement|notice|announce/i;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    const text = match[2].replace(/<[^>]+>/g, "").trim();

    if (!text || text.length < 15 || text.length > 250) continue;
    if (!opKeywords.test(text) && !opKeywords.test(href)) continue;

    let link: string;
    try {
      link = new URL(href, base.origin).toString();
    } catch {
      continue;
    }

    if (!link.startsWith("http") || seen.has(link)) continue;
    seen.add(link);

    items.push({ title: text, link });
    if (items.length >= 30) break;
  }

  return items;
}

// ── Main crawl function ───────────────────────────────────────────────────────

export async function crawlSource(sourceId: string): Promise<CrawlResult> {
  const source = await prisma.crawlerSource.findUnique({ where: { id: sourceId } });
  if (!source) throw new Error("Source not found");

  // Create crawl run record
  const run = await prisma.crawlRun.create({
    data: { sourceId, status: "RUNNING" },
  });

  let items: RawItem[] = [];
  let errorMsg: string | null = null;

  try {
    if (source.sourceType === "RSS") {
      items = await fetchRss(source.url);
    } else if (source.sourceType === "HTML") {
      items = await fetchHtml(source.url);
    } else if (source.sourceType === "WPJOBS") {
      items = await fetchWpJobManager(source.url, source.tags);
    } else {
      // PLAYWRIGHT — can't run on Vercel, skip with message
      errorMsg = "PLAYWRIGHT sources require the Railway crawler service. Use Refresh All via Railway.";
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  let added = 0;
  let duplicates = 0;
  let errors = 0;

  for (const item of items) {
    try {
      // ── Pre-AI qualification filter ────────────────────────────────────────
      // WPJOBS: type filtering already done in fetchWpJobManager; only check country.
      const filterTags = source.sourceType === "WPJOBS" ? [] : source.tags;
      const filter = passesSourceFilters(
        { country: source.country, tags: filterTags },
        { rawTitle: item.title, rawDescription: item.description, rawContent: item.content }
      );
      if (!filter.passes) { continue; }

      const urlHash     = hashUrl(item.link);
      const contentHash = item.content ? hashContent(item.content) : undefined;

      const dedup = await checkDuplicate({ urlHash, contentHash, title: item.title });
      if (dedup.isDuplicate) { duplicates++; continue; }

      await prisma.discoveredOpportunity.create({
        data: {
          sourceId,
          rawTitle:       item.title,
          rawDescription: item.description,
          rawUrl:         item.link,
          rawPublishedAt: item.pubDate ? new Date(item.pubDate) : null,
          rawContent:     item.content,
          urlHash,
          contentHash,
          status: "NEW",
        },
      });
      added++;
    } catch {
      errors++;
    }
  }

  // Update run record
  await prisma.crawlRun.update({
    where: { id: run.id },
    data: {
      status:      errorMsg ? "FAILED" : "COMPLETED",
      itemsFound:  items.length,
      itemsNew:    added,
      errorMsg,
      completedAt: new Date(),
    },
  });

  // Update source lastCrawledAt
  await prisma.crawlerSource.update({
    where: { id: sourceId },
    data: { lastCrawledAt: new Date() },
  });

  return { found: items.length, added, duplicates, errors, runId: run.id };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractText(val: unknown): string {
  if (typeof val === "string") return val.trim();
  if (typeof val === "object" && val !== null) {
    const v = (val as Record<string, unknown>)["#text"];
    if (typeof v === "string") return v.trim();
  }
  return "";
}

function extractAtomLink(link: unknown): string {
  if (typeof link === "string") return link;
  if (Array.isArray(link)) {
    const alt = link.find((l: any) => l["@_rel"] === "alternate" || !l["@_rel"]);
    return alt?.["@_href"] ?? link[0]?.["@_href"] ?? "";
  }
  if (typeof link === "object" && link !== null) {
    return (link as any)["@_href"] ?? "";
  }
  return "";
}
