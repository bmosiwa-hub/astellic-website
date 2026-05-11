/**
 * Deduplication utilities for discovered opportunities.
 * Three-tier strategy:
 *  1. Exact URL match (urlHash)
 *  2. Content hash (contentHash)
 *  3. pg_trgm trigram similarity via raw SQL (fuzzy title match)
 */

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

/** SHA-256 of a normalised URL (lowercased, query params stripped for tracking params) */
export function hashUrl(url: string): string {
  const normalised = normaliseUrl(url);
  return createHash("sha256").update(normalised).digest("hex");
}

/** SHA-256 of trimmed raw content */
export function hashContent(content: string): string {
  return createHash("sha256").update(content.trim()).digest("hex");
}

function normaliseUrl(url: string): string {
  try {
    const u = new URL(url);
    // Remove common tracking params
    const trackingParams = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "fbclid", "gclid"];
    trackingParams.forEach((p) => u.searchParams.delete(p));
    return u.toString().toLowerCase();
  } catch {
    return url.toLowerCase().trim();
  }
}

export interface DedupResult {
  isDuplicate: boolean;
  duplicateOf?: string;
  reason?: "URL_HASH" | "CONTENT_HASH" | "FUZZY_TITLE";
}

/**
 * Check whether a potential new opportunity is a duplicate of an existing one.
 * Returns the ID of the original if a duplicate is found.
 */
export async function checkDuplicate(params: {
  urlHash: string;
  contentHash?: string;
  title: string;
}): Promise<DedupResult> {
  const { urlHash, contentHash, title } = params;

  // Tier 1: URL hash exact match
  const byUrl = await prisma.discoveredOpportunity.findUnique({
    where: { urlHash },
    select: { id: true, status: true },
  });
  if (byUrl) {
    return { isDuplicate: true, duplicateOf: byUrl.id, reason: "URL_HASH" };
  }

  // Tier 2: Content hash match
  if (contentHash) {
    const byContent = await prisma.discoveredOpportunity.findFirst({
      where: { contentHash },
      select: { id: true },
    });
    if (byContent) {
      return { isDuplicate: true, duplicateOf: byContent.id, reason: "CONTENT_HASH" };
    }
  }

  // Tier 3: Fuzzy title match using pg_trgm (similarity >= 0.82)
  // Only run if title is meaningful
  if (title.length > 10) {
    try {
      const results = await prisma.$queryRaw<{ id: string; similarity: number }[]>`
        SELECT id, similarity(COALESCE(title, "rawTitle"), ${title}) AS similarity
        FROM "DiscoveredOpportunity"
        WHERE similarity(COALESCE(title, "rawTitle"), ${title}) >= 0.82
          AND status != 'DUPLICATE'
        ORDER BY similarity DESC
        LIMIT 1
      `;
      if (results.length > 0) {
        return { isDuplicate: true, duplicateOf: results[0].id, reason: "FUZZY_TITLE" };
      }
    } catch {
      // pg_trgm not available — skip fuzzy check
    }
  }

  return { isDuplicate: false };
}
