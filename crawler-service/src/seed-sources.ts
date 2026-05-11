/**
 * One-time seed script: inserts the default Malawi-focused crawler sources
 * into the database if they don't already exist.
 *
 * Run from the crawler-service directory:
 *   ts-node src/seed-sources.ts
 *
 * Requires DATABASE_URL env var to be set.
 */

import { Pool } from "pg";
import { DEFAULT_SOURCES } from "./sources";

const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log("[seed] Seeding default crawler sources...");

  for (const s of DEFAULT_SOURCES) {
    // Check if a source with the same URL already exists
    const existing = await db.query(
      `SELECT id FROM "CrawlerSource" WHERE url = $1`,
      [s.url]
    );

    if (existing.rows.length > 0) {
      console.log(`[seed] Already exists: ${s.name}`);
      continue;
    }

    await db.query(
      `INSERT INTO "CrawlerSource" (
        id, name, url, "sourceType", description, country, tags,
        "crawlIntervalMins", active, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, $3, $4, $5, $6,
        $7, true, NOW(), NOW()
      )`,
      [
        s.name,
        s.url,
        s.sourceType,
        s.description,
        s.country,
        s.tags,
        s.crawlIntervalMins,
      ]
    );
    console.log(`[seed] Added: ${s.name}`);
  }

  await db.end();
  console.log("[seed] Done.");
}

seed().catch((err) => {
  console.error("[seed] Error:", err);
  process.exit(1);
});
