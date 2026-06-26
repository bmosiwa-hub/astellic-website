import { prisma } from "./prisma";

/**
 * Live MWK-per-unit exchange rate for an employee's salary currency, using the
 * system's current exchange rate table (RBM middle rate) — the same rate used
 * everywhere else in the app for currency conversion.
 *
 * PAYE must always be calculated on the prevailing rate, not a rate snapshot
 * taken at hire time, so foreign-currency salaries' PAYE fluctuates with the
 * exchange rate like it should.
 *
 * Falls back to 1 (no conversion) if no live rate exists for the currency.
 */
export async function getLiveSalaryRate(currency: string): Promise<number> {
  if (currency === "MWK") return 1;
  const rate = await prisma.exchangeRate.findUnique({
    where: { currency },
    select: { middleRate: true },
  });
  return rate?.middleRate ?? 1;
}
