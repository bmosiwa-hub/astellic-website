/**
 * Currency conversion utilities for Astelfin IMS.
 *
 * All consolidation uses the RBM middle rate (the mid-point between buy/sell),
 * which is standard for accounting purposes.
 *
 * Usage:
 *   const rates = await prisma.exchangeRate.findMany({ select: { currency: true, middleRate: true, updatedAt: true } });
 *   const rateMap = buildRateMap(rates);
 *   const mwk = toMWK(1000, "USD", rateMap); // → e.g. 1_734_000
 */

export type RateMap = Record<string, number>; // currency ISO code → MWK per 1 unit

export interface RateEntry {
  currency:   string;
  middleRate: number;
  updatedAt:  Date;
}

/**
 * Build a lookup map from a list of exchange rate records.
 * MWK is always 1:1 (no conversion needed).
 */
export function buildRateMap(rates: RateEntry[]): RateMap {
  const map: RateMap = { MWK: 1 };
  for (const r of rates) {
    map[r.currency] = r.middleRate;
  }
  return map;
}

/**
 * Convert `amount` in `currency` to its MWK equivalent.
 * If no rate is available for the currency, returns the amount unchanged
 * (with a 1:1 assumption) — callers should surface a warning in this case.
 */
export function toMWK(amount: number, currency: string, rates: RateMap): number {
  if (currency === "MWK") return amount;
  const rate = rates[currency];
  if (!rate) return amount; // fallback: treat as 1:1
  return amount * rate;
}

/**
 * Convert a set of { amount, currency } records to a single MWK total.
 */
export function sumAsMWK(
  records: Array<{ amount: number; currency: string }>,
  rates: RateMap,
): number {
  return records.reduce((s, r) => s + toMWK(r.amount, r.currency, rates), 0);
}

/**
 * Return the set of currencies in the records that have no exchange rate.
 * Used to surface warnings in the UI.
 */
export function missingRateCurrencies(
  records: Array<{ currency: string }>,
  rates: RateMap,
): string[] {
  const missing = new Set<string>();
  for (const r of records) {
    if (r.currency !== "MWK" && !rates[r.currency]) missing.add(r.currency);
  }
  return [...missing];
}

/** Format a number as MWK with no decimal places. */
export function fmtMWK(n: number): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency: "MWK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/**
 * Return how stale the exchange rates are.
 * Returns null if rates array is empty.
 */
export function ratesAgeHours(rates: RateEntry[]): number | null {
  if (rates.length === 0) return null;
  const latest = Math.max(...rates.map((r) => r.updatedAt.getTime()));
  return (Date.now() - latest) / (1000 * 60 * 60);
}
