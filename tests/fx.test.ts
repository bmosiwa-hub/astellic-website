import { describe, it, expect } from "vitest";
import { buildRateMap, toMWK, sumAsMWK, missingRateCurrencies } from "@/lib/fx";

const rates = buildRateMap([
  { currency: "USD", middleRate: 1_734, updatedAt: new Date() },
  { currency: "GBP", middleRate: 2_200, updatedAt: new Date() },
]);

describe("buildRateMap", () => {
  it("always includes MWK at 1:1", () => {
    expect(buildRateMap([]).MWK).toBe(1);
    expect(rates.MWK).toBe(1);
  });
});

describe("toMWK", () => {
  it("converts foreign currency using the middle rate", () => {
    expect(toMWK(1_000, "USD", rates)).toBe(1_734_000);
    expect(toMWK(100, "GBP", rates)).toBe(220_000);
  });

  it("passes MWK through unchanged", () => {
    expect(toMWK(500_000, "MWK", rates)).toBe(500_000);
  });

  it("falls back to 1:1 when the rate is missing", () => {
    expect(toMWK(100, "EUR", rates)).toBe(100);
  });
});

describe("sumAsMWK", () => {
  it("consolidates mixed currencies into a single MWK total", () => {
    const total = sumAsMWK(
      [
        { amount: 500_000, currency: "MWK" },
        { amount: 1_000, currency: "USD" },
      ],
      rates,
    );
    expect(total).toBe(500_000 + 1_734_000);
  });
});

describe("missingRateCurrencies", () => {
  it("reports currencies without a rate, ignoring MWK", () => {
    const missing = missingRateCurrencies(
      [{ currency: "MWK" }, { currency: "USD" }, { currency: "EUR" }, { currency: "EUR" }],
      rates,
    );
    expect(missing).toEqual(["EUR"]);
  });
});
