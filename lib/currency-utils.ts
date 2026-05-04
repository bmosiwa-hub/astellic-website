/**
 * Currency conversion helpers.
 *
 * Exchange rates are stored as MWK per 1 unit of foreign currency
 * (the RBM convention). The base currency is always MWK.
 *
 * Examples (middleRate):
 *   USD middleRate = 1734  → 1 USD = MWK 1,734
 *   EUR middleRate = 2085  → 1 EUR = MWK 2,085
 */

export interface RateMap {
  [currency: string]: number; // middleRate (MWK per 1 unit)
}

/**
 * Build a RateMap from prisma ExchangeRate records (or any object with currency + middleRate).
 */
export function buildRateMap(
  rows: { currency: string; middleRate: number }[]
): RateMap {
  const map: RateMap = { MWK: 1 };
  for (const r of rows) {
    map[r.currency.toUpperCase()] = r.middleRate;
  }
  return map;
}

/**
 * Convert `amount` from `fromCurrency` to `toCurrency` using stored middle rates.
 * Returns null if either currency is missing from the rate map.
 */
export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: RateMap
): number | null {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return amount;

  const fromRate = rates[f]; // MWK per 1 from-unit
  const toRate   = rates[t]; // MWK per 1 to-unit

  if (!fromRate || !toRate) return null;

  // Convert: from → MWK → to
  const mwk = amount * fromRate;
  return mwk / toRate;
}

/**
 * Convert to MWK. Returns null if the rate is missing.
 */
export function toMWK(
  amount: number,
  currency: string,
  rates: RateMap
): number | null {
  return convertCurrency(amount, currency, "MWK", rates);
}

/**
 * Format a converted amount with currency prefix.
 * Falls back to the original amount + original currency if conversion fails.
 */
export function formatConverted(
  amount: number,
  from: string,
  to: string,
  rates: RateMap
): string {
  const result = convertCurrency(amount, from, to, rates);
  if (result === null) return `${from} ${amount.toLocaleString()}`;
  return `${to} ${result.toLocaleString("en-MW", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
