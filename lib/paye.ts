/**
 * lib/paye.ts
 * Phase 15 — PAYE band versioning utilities.
 *
 * Key ideas:
 *  - A PAYEBandSet is a versioned snapshot of MRA tax bands valid from a given date.
 *  - `getActiveBandSet(periodDate)` finds the set whose effectiveFrom is the highest
 *    value still <= the supplied period date — i.e. the bands that were in force then.
 *  - `calculatePAYEFromBands(gross, bands)` applies progressive marginal rates.
 *  - The fallback constant `HARDCODED_BANDS` mirrors the rates previously in
 *    lib/finance-utils.ts and is used when no DB band set exists.
 */

import { prisma } from "@/lib/prisma";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PAYEBandData {
  order:      number;
  fromAmount: number;
  toAmount:   number | null; // null = no upper bound
  rate:       number;        // percentage, e.g. 30 (not 0.30)
}

export interface ActiveBandSetResult {
  id:       string;
  label:    string;
  bands:    PAYEBandData[];
  snapshot: PAYEBandData[]; // serialisable form to store on Payroll record
}

// ── Fallback bands (current MRA rates as of 2024) ─────────────────────────────
// Kept in sync with the legacy calculatePAYE() in finance-utils.ts.
export const HARDCODED_BANDS: PAYEBandData[] = [
  { order: 1, fromAmount: 0,          toAmount: 170_000,   rate: 0  },
  { order: 2, fromAmount: 170_000,    toAmount: 1_570_000, rate: 30 },
  { order: 3, fromAmount: 1_570_000,  toAmount: null,      rate: 35 },
];

// ── Core calculation ──────────────────────────────────────────────────────────

/**
 * Progressive PAYE calculation given an explicit list of bands.
 * Bands must be ordered ascending by fromAmount.
 * The rate field is a percentage (e.g. 30 means 30 %).
 */
export function calculatePAYEFromBands(
  monthlyGross: number,
  bands: PAYEBandData[],
): number {
  // Sort defensively in case bands are out of order
  const sorted = [...bands].sort((a, b) => a.order - b.order);

  let tax = 0;

  for (const band of sorted) {
    if (monthlyGross <= band.fromAmount) break;

    const bandTop = band.toAmount ?? Infinity;
    const taxable = Math.min(monthlyGross, bandTop) - band.fromAmount;
    tax += taxable * (band.rate / 100);
  }

  return Math.round(tax * 100) / 100;
}

// ── Database lookup ────────────────────────────────────────────────────────────

/**
 * Returns the PAYEBandSet that was in force on `periodDate`.
 * If no band sets exist in the database, returns null (caller should fall back
 * to the legacy calculatePAYE() in finance-utils.ts).
 */
export async function getActiveBandSet(
  periodDate: Date,
): Promise<ActiveBandSetResult | null> {
  // Find the band set with the highest effectiveFrom that is <= periodDate
  const bandSet = await prisma.pAYEBandSet.findFirst({
    where:   { effectiveFrom: { lte: periodDate } },
    orderBy: { effectiveFrom: "desc" },
    include: { bands: { orderBy: { order: "asc" } } },
  });

  if (!bandSet) return null;

  const bands: PAYEBandData[] = bandSet.bands.map((b) => ({
    order:      b.order,
    fromAmount: b.fromAmount,
    toAmount:   b.toAmount,
    rate:       b.rate,
  }));

  return {
    id:       bandSet.id,
    label:    bandSet.label,
    bands,
    snapshot: bands, // identical structure — JSON-serialisable
  };
}

/**
 * Convenience wrapper: look up the active band set then calculate PAYE.
 * Falls back to hardcoded bands if no versioned sets exist.
 * Returns both the tax amount and the band set metadata for storage on Payroll.
 */
export async function calculatePAYEForPeriod(
  monthlyGross: number,
  periodDate: Date,
): Promise<{
  paye:             number;
  payeBandSetId:    string | null;
  payeBandSnapshot: PAYEBandData[] | null;
}> {
  const active = await getActiveBandSet(periodDate);

  if (active) {
    return {
      paye:             calculatePAYEFromBands(monthlyGross, active.bands),
      payeBandSetId:    active.id,
      payeBandSnapshot: active.snapshot,
    };
  }

  // Legacy fallback — mirrors old calculatePAYE() exactly
  return {
    paye:             calculatePAYEFromBands(monthlyGross, HARDCODED_BANDS),
    payeBandSetId:    null,
    payeBandSnapshot: null,
  };
}
