/**
 * RSS/Atom feed crawler using fast-xml-parser.
 * Returns an array of raw items extracted from the feed.
 */

import axios from "axios";
import { XMLParser } from "fast-xml-parser";

export interface RawItem {
  title: string;
  description?: string;
  link: string;
  pubDate?: string;
  author?: string;
  content?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
});

export async function crawlRss(url: string): Promise<RawItem[]> {
  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      "User-Agent": "AstellicIntelBot/1.0 (+https://astellic.org)",
      "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
    },
    maxRedirects: 5,
  });

  const xml = response.data as string;
  const parsed = parser.parse(xml);

  const items: RawItem[] = [];

  // RSS 2.0
  const rssItems = parsed?.rss?.channel?.item;
  if (rssItems) {
    const arr = Array.isArray(rssItems) ? rssItems : [rssItems];
    for (const item of arr) {
      const title = extractText(item.title);
      const link  = extractText(item.link) || item.guid?.["#text"] || item.guid;
      if (!title || !link) continue;
      items.push({
        title,
        description: extractText(item.description) || undefined,
        link,
        pubDate: extractText(item.pubDate) || undefined,
        author:  extractText(item["dc:creator"]) || extractText(item.author) || undefined,
        content: extractText(item["content:encoded"]) || undefined,
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
        description: extractText(entry.summary) || undefined,
        link,
        pubDate: extractText(entry.published) || extractText(entry.updated) || undefined,
        author:  extractText(entry.author?.name) || undefined,
        content: extractText(entry.content) || undefined,
      });
    }
    return items;
  }

  return items;
}

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
    const alternate = link.find((l: any) => l["@_rel"] === "alternate" || !l["@_rel"]);
    return alternate?.["@_href"] ?? link[0]?.["@_href"] ?? "";
  }
  if (typeof link === "object" && link !== null) {
    return (link as any)["@_href"] ?? "";
  }
  return "";
}
