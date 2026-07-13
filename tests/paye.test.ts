import { describe, it, expect } from "vitest";
import { calculatePAYEFromBands, HARDCODED_BANDS } from "@/lib/paye";

describe("calculatePAYEFromBands — Malawi MRA monthly bands", () => {
  it("charges 0% at or below the 170,000 threshold", () => {
    expect(calculatePAYEFromBands(0, HARDCODED_BANDS)).toBe(0);
    expect(calculatePAYEFromBands(100_000, HARDCODED_BANDS)).toBe(0);
    expect(calculatePAYEFromBands(170_000, HARDCODED_BANDS)).toBe(0);
  });

  it("charges 30% only on the portion above 170,000", () => {
    // 200,000 gross → 30,000 taxable at 30% = 9,000 (the CEO's actual salary case)
    expect(calculatePAYEFromBands(200_000, HARDCODED_BANDS)).toBe(9_000);
    // 550,000 gross → 380,000 taxable at 30% = 114,000 (Enock Banda's case)
    expect(calculatePAYEFromBands(550_000, HARDCODED_BANDS)).toBe(114_000);
  });

  it("is exact at the top of the 30% band", () => {
    // 1,570,000 → (1,570,000 − 170,000) × 30% = 420,000
    expect(calculatePAYEFromBands(1_570_000, HARDCODED_BANDS)).toBe(420_000);
  });

  it("charges 35% on the portion above 1,570,000", () => {
    // 2,000,000 → 420,000 + (430,000 × 35%) = 570,500
    expect(calculatePAYEFromBands(2_000_000, HARDCODED_BANDS)).toBe(570_500);
  });

  it("handles out-of-order band arrays defensively", () => {
    const shuffled = [HARDCODED_BANDS[2], HARDCODED_BANDS[0], HARDCODED_BANDS[1]];
    expect(calculatePAYEFromBands(2_000_000, shuffled)).toBe(570_500);
  });
});
