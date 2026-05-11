/**
 * Astellic Opportunity Intelligence Crawler Service
 * Runs on Railway as a persistent Node.js process.
 *
 * Environment variables required:
 *   DATABASE_URL     — Neon PostgreSQL connection string
 *   IMS_BASE_URL     — Base URL of the Next.js IMS (e.g. https://astellic.org)
 *   INTEL_API_KEY    — Shared secret for /api/intel/discover endpoint
 *   PORT             — (optional) HTTP port for health check, default 3001
 */

import { Pool } from "pg";
import cron from "node-cron";
import { crawlRss } from "./crawlers/rss";
import { crawlHtml } from "./crawlers/html";
import http from "http";
import type { RawItem } from "./crawlers/rss";

const DATABASE_URL = process.env.DATABASE_URL ?? "";
const IMS_BASE_URL = (process.env.IMS_BASE_URL ?? "").replace(/\/$/, "");
const INTEL_API_KEY = process.env.INTEL_API_KEY ?? "";
const PORT = parseInt(process.env.PORT ?? "3001", 10);

if (!DATABASE_URL) throw new Error("DATABASE_URL is required");
if (!IMS_BASE_URL) throw new Error("IMS_BASE_URL is required");
if (!INTEL_API_KEY) throw new Error("INTEL_API_KEY is required");

const db = new Pool({ connectionString: DATABASE_URL });

// ── Types ─────────────────────────────────────────────────────────────────────

interface CrawlerSourceRow {
  id: string;
  name: string;
  url: string;
  source_type: "RSS" | "HTML" | "PLAYWRIGHT";
  active: boolean;
  tags: string[];
  crawl_interval_mins: number;
  last_crawled_at: Date | null;
}

// ── Submit to IMS ─────────────────────────────────────────────────────────────

async function submitToIMS(sourceId: string, item: RawItem): Promise<"accepted" | "duplicate" | "error"> {
  try {
    const response = await fetch(`${IMS_BASE_URL}/api/intel/discover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INTEL_API_KEY}`,
      },
      body: JSON.stringify({
        sourceId,
        rawTitle: item.title,
        rawDescription: item.description,
        rawUrl: item.link,
        rawPublishedAt: item.pubDate,
        rawFunder: undefined,
        rawContent: item.content,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[crawler] IMS rejected item: ${response.status} ${text.slice(0, 200)}`);
      return "error";
    }

    const data = await response.json() as { status: string };
    return data.status === "accepted" ? "accepted" : "duplicate";
  } catch (err) {
    console.error("[crawler] submitToIMS error:", err);
    return "error";
  }
}

// ── Crawl a single source ─────────────────────────────────────────────────────

async function crawlSource(source: CrawlerSourceRow): Promise<void> {
  console.log(`[crawler] Starting crawl: ${source.name} (${source.source_type})`);
  const startedAt = new Date();

  // Create CrawlRun record
  const runResult = await db.query(
    `INSERT INTO "CrawlRun" (id, "sourceId", status, "itemsFound", "itemsNew", "startedAt")
     VALUES (gen_random_uuid(), $1, 'RUNNING', 0, 0, NOW())
     RETURNING id`,
    [source.id]
  );
  const runId = runResult.rows[0].id as string;

  let items: RawItem[] = [];
  let errorMsg: string | null = null;

  try {
    if (source.source_type === "RSS") {
      items = await crawlRss(source.url);
    } else if (source.source_type === "HTML") {
      items = await crawlHtml(source.url);
    } else {
      // PLAYWRIGHT — not yet implemented, log and skip
      console.warn(`[crawler] PLAYWRIGHT source ${source.name} — Playwright not yet configured`);
      items = [];
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[crawler] Crawl failed for ${source.name}:`, errorMsg);
  }

  let newCount = 0;
  if (items.length > 0 && !errorMsg) {
    // Submit each item to IMS
    for (const item of items) {
      const result = await submitToIMS(source.id, item);
      if (result === "accepted") newCount++;
      // Small delay to avoid overwhelming the IMS
      await sleep(200);
    }
  }

  // Update CrawlRun
  await db.query(
    `UPDATE "CrawlRun"
     SET status = $1, "itemsFound" = $2, "itemsNew" = $3, "errorMsg" = $4, "completedAt" = NOW()
     WHERE id = $5`,
    [errorMsg ? "FAILED" : "COMPLETED", items.length, newCount, errorMsg, runId]
  );

  // Update source lastCrawledAt
  await db.query(
    `UPDATE "CrawlerSource" SET "lastCrawledAt" = NOW() WHERE id = $1`,
    [source.id]
  );

  console.log(`[crawler] Done: ${source.name} — ${items.length} found, ${newCount} new`);
}

// ── Main scheduler ────────────────────────────────────────────────────────────

async function runDueSources(): Promise<void> {
  // Fetch all active sources that are due for a crawl
  const { rows } = await db.query<CrawlerSourceRow>(`
    SELECT id, name, url, "sourceType" as source_type, active, tags,
           "crawlIntervalMins" as crawl_interval_mins, "lastCrawledAt" as last_crawled_at
    FROM "CrawlerSource"
    WHERE active = true
      AND (
        "lastCrawledAt" IS NULL
        OR "lastCrawledAt" < NOW() - (("crawlIntervalMins" || ' minutes')::interval)
      )
    ORDER BY COALESCE("lastCrawledAt", '2000-01-01') ASC
  `);

  if (rows.length === 0) {
    console.log("[crawler] No sources due for crawl.");
    return;
  }

  console.log(`[crawler] ${rows.length} source(s) due for crawl.`);

  // Crawl sequentially to avoid connection/rate-limit spikes
  for (const source of rows) {
    try {
      await crawlSource(source);
    } catch (err) {
      console.error(`[crawler] Unhandled error for ${source.name}:`, err);
    }
    await sleep(2000); // 2s gap between sources
  }
}

// ── Health check HTTP server (Railway health probe) ───────────────────────────

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "astellic-crawler", time: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end("Not found");
  }
});

// ── Entry point ───────────────────────────────────────────────────────────────

async function main() {
  console.log("[crawler] Astellic Opportunity Intelligence Crawler starting...");
  console.log(`[crawler] IMS base URL: ${IMS_BASE_URL}`);

  server.listen(PORT, () => {
    console.log(`[crawler] Health check server listening on port ${PORT}`);
  });

  // Run immediately on startup
  await runDueSources();

  // Then check every 15 minutes for sources that are due
  cron.schedule("*/15 * * * *", async () => {
    console.log("[crawler] Scheduled check triggered");
    await runDueSources();
  });

  console.log("[crawler] Scheduler running. Checking every 15 minutes.");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
  console.error("[crawler] Fatal error:", err);
  process.exit(1);
});
