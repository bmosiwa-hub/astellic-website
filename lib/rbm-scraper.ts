/**
 * Scrapes the Reserve Bank of Malawi (RBM) major exchange rates page.
 * URL: https://www.rbm.mw/Statistics/MajorRates/
 *
 * The page returns a plain HTML table:
 *   Currency | Buying | Middle | Selling
 * All rates express 1 unit of foreign currency in MWK.
 */

export interface RBMRate {
  currency: string;
  buyRate: number;
  middleRate: number;
  sellRate: number;
}

export interface RBMResult {
  effectiveDate: Date;
  rates: RBMRate[];
}

const RBM_URL = "https://www.rbm.mw/Statistics/MajorRates/";

/**
 * Parses a date string like "30-April-2026" or "30-Apr-2026" into a Date.
 */
function parseRBMDate(raw: string): Date {
  // normalise to "30 April 2026"
  const cleaned = raw.replace(/-/g, " ").trim();
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) return d;
  // fallback: today
  return new Date();
}

/**
 * Extract all <td> values from a <tr> block.
 */
function parseTdValues(row: string): string[] {
  const vals: string[] = [];
  const re = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(row)) !== null) {
    // strip any inner HTML tags and trim
    vals.push(m[1].replace(/<[^>]+>/g, "").trim());
  }
  return vals;
}

export async function fetchRBMRates(): Promise<RBMResult> {
  const res = await fetch(RBM_URL, {
    cache: "no-store",
    headers: { "User-Agent": "Mozilla/5.0 (compatible; Astelfin/1.0)" },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`RBM fetch failed: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // ── Extract effective date ──────────────────────────────────────
  // Looks for "Exchange Rates 30-April-2026" anywhere in the page
  const dateMatch = html.match(/Exchange\s+Rates?\s+([\d]+-[A-Za-z]+-[\d]+)/i);
  const effectiveDate = dateMatch ? parseRBMDate(dateMatch[1]) : new Date();

  // ── Extract table rows ──────────────────────────────────────────
  // Split on <tr ...> boundaries, then look for rows with 4 <td> cells
  const rows = html.split(/<tr[\s>]/i);
  const rates: RBMRate[] = [];

  for (const row of rows) {
    const cells = parseTdValues(row);
    if (cells.length < 4) continue;

    const [currencyRaw, buyRaw, middleRaw, sellRaw] = cells;
    const currency = currencyRaw.toUpperCase().trim();

    // Skip header-like rows and obviously invalid currencies
    if (!currency || currency.length < 2 || currency.length > 4) continue;
    if (!/^[A-Z]{2,4}$/.test(currency)) continue;

    const buyRate    = parseFloat(buyRaw.replace(/,/g, ""));
    const middleRate = parseFloat(middleRaw.replace(/,/g, ""));
    const sellRate   = parseFloat(sellRaw.replace(/,/g, ""));

    if (isNaN(buyRate) || isNaN(middleRate) || isNaN(sellRate)) continue;
    if (middleRate <= 0) continue;

    rates.push({ currency, buyRate, middleRate, sellRate });
  }

  if (rates.length === 0) {
    throw new Error("RBM scraper found 0 rates — the page structure may have changed.");
  }

  return { effectiveDate, rates };
}
