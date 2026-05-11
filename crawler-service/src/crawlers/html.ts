/**
 * HTML scraper using Cheerio for static pages.
 * Extracts opportunity-like items from common listing patterns.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import type { RawItem } from "./rss";

export async function crawlHtml(url: string): Promise<RawItem[]> {
  const response = await axios.get(url, {
    timeout: 20000,
    headers: {
      "User-Agent": "AstellicIntelBot/1.0 (+https://astellic.org)",
      "Accept": "text/html,application/xhtml+xml,*/*",
    },
    maxRedirects: 5,
  });

  const html = response.data as string;
  const $ = cheerio.load(html);
  const items: RawItem[] = [];
  const seen = new Set<string>();

  // Strategy 1: Look for elements with common "tender/opportunity" class patterns
  const containerSelectors = [
    ".tender-item", ".procurement-item", ".opportunity-item", ".job-item",
    ".result-item", ".search-result", ".notice-item", ".listing-item",
    "article", ".card", ".post", ".entry",
  ];

  for (const sel of containerSelectors) {
    const els = $(sel);
    if (els.length < 2) continue; // need at least 2 to be a list

    els.each((_, el) => {
      const $el = $(el);
      // Find a heading-like element for title
      const titleEl = $el.find("h1, h2, h3, h4, .title, .name, [class*='title'], [class*='heading']").first();
      const title = titleEl.text().trim();
      if (!title || title.length < 10) return;

      // Find link
      const linkEl = $el.find("a[href]").first();
      let link = linkEl.attr("href") ?? "";
      if (!link) return;
      link = resolveUrl(link, url);

      if (seen.has(link)) return;
      seen.add(link);

      // Extract description
      const desc = $el.find("p, .description, .summary, [class*='desc']").first().text().trim();

      // Extract date-like text
      const dateEl = $el.find("time, .date, [class*='date'], [class*='deadline'], [class*='published']").first();
      const pubDate = dateEl.attr("datetime") || dateEl.text().trim() || undefined;

      items.push({ title, link, description: desc || undefined, pubDate });
    });

    if (items.length > 0) break; // found items with this selector
  }

  // Strategy 2: Fallback — extract all links that look like opportunity postings
  if (items.length === 0) {
    const base = new URL(url);
    $("a[href]").each((_, el) => {
      const $el = $(el);
      const href = $el.attr("href") ?? "";
      const text = $el.text().trim();

      if (!text || text.length < 15 || text.length > 200) return;

      // Heuristic: link text looks like an opportunity title
      const opKeywords = /consult|tender|bid|rfp|rfq|evaluation|research|assessment|grant|award|procurement|notice|announce/i;
      if (!opKeywords.test(text) && !opKeywords.test(href)) return;

      const link = resolveUrl(href, url);
      if (!link.startsWith("http")) return;
      if (seen.has(link)) return;
      seen.add(link);

      // Try to grab nearby context text
      const parent = $el.parent();
      const context = parent.text().replace(text, "").trim().slice(0, 300);

      items.push({
        title: text,
        link,
        description: context || undefined,
      });
    });
  }

  return items.slice(0, 50); // cap at 50 per crawl run
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}
