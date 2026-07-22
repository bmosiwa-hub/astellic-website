import { describe, it, expect } from "vitest";
import { calculateNetPay, calculateEmployerPension, calculateWithholding, calculatePAYE, allocateRemittance } from "@/lib/finance-utils";

describe("calculateNetPay — MWK salary", () => {
  it("computes the CEO's 200,000 MWK salary correctly", () => {
    const calc = calculateNetPay(200_000, 5, 1);
    expect(calc.grossMWK).toBe(200_000);
    expect(calc.payeMWK).toBe(9_000);      // 30% of the 30,000 above threshold
    expect(calc.pensionMWK).toBe(10_000);  // 5% of gross
    expect(calc.netPayMWK).toBe(181_000);  // 200,000 − 9,000 − 10,000
    // MWK in, MWK out — native and MWK figures must match
    expect(calc.netPay).toBe(calc.netPayMWK);
  });

  it("computes a 550,000 MWK salary correctly", () => {
    const calc = calculateNetPay(550_000, 5, 1);
    expect(calc.payeMWK).toBe(114_000);
    expect(calc.pensionMWK).toBe(27_500);
    expect(calc.netPayMWK).toBe(408_500);
  });
});

describe("calculateNetPay — foreign currency salary", () => {
  it("computes PAYE on the MWK equivalent, not the native amount", () => {
    // 1,000 USD at 1,734 MWK/USD = 1,734,000 MWK gross → into the 35% band
    const calc = calculateNetPay(1_000, 5, 1_734);
    expect(calc.grossMWK).toBe(1_734_000);
    // 420,000 (30% band) + (164,000 × 35%) = 477,400 — matches the old CEO record
    expect(calc.payeMWK).toBe(477_400);
    // Employee pension: 5% of grossMWK = 86,700 MWK → 50 USD native
    expect(calc.pensionMWK).toBe(86_700);
    expect(calc.pension).toBe(50);
    // Native net pay: (1,734,000 − 477,400 − 86,700) / 1,734 ≈ 674.68 USD
    expect(calc.netPay).toBeCloseTo(674.68, 2);
  });

  it("PAYE fluctuates with the exchange rate for the same native salary", () => {
    const low  = calculateNetPay(1_000, 5, 1_500);
    const high = calculateNetPay(1_000, 5, 2_000);
    expect(high.payeMWK).toBeGreaterThan(low.payeMWK);
  });

  it("treats a zero/invalid rate as 1 rather than dividing by zero", () => {
    const calc = calculateNetPay(200_000, 5, 0);
    expect(calc.grossMWK).toBe(200_000);
    expect(Number.isFinite(calc.netPay)).toBe(true);
  });
});

describe("calculateNetPay — options", () => {
  it("skips PAYE when payeExempt", () => {
    const calc = calculateNetPay(500_000, 5, 1, { payeExempt: true });
    expect(calc.payeMWK).toBe(0);
    expect(calc.netPayMWK).toBe(500_000 - 25_000);
  });

  it("applies NSSF only when nssfApplicable", () => {
    const without = calculateNetPay(500_000, 5, 1);
    expect(without.nssfEmployeeMWK).toBe(0);
    const withNssf = calculateNetPay(500_000, 5, 1, { nssfApplicable: true, nssfEmployeeRate: 3, nssfEmployerRate: 3 });
    expect(withNssf.nssfEmployeeMWK).toBe(15_000);
    expect(withNssf.nssfEmployerMWK).toBe(15_000);
    // Employer NSSF is not deducted from the employee
    expect(withNssf.netPayMWK).toBe(without.netPayMWK - 15_000);
  });

  it("supports versioned PAYE bands", () => {
    const flatTen = [{ order: 1, fromAmount: 0, toAmount: null, rate: 10 }];
    const calc = calculateNetPay(500_000, 0, 1, { payeBands: flatTen });
    expect(calc.payeMWK).toBe(50_000);
  });
});

describe("calculateEmployerPension — statutory 10% of gross MWK", () => {
  it("is always 10% of gross when the employee contributes", () => {
    expect(calculateEmployerPension(200_000, 5)).toBe(20_000);
    expect(calculateEmployerPension(550_000, 5)).toBe(55_000);
    // Still 10% even at a non-default employee rate
    expect(calculateEmployerPension(200_000, 7)).toBe(20_000);
  });

  it("is 0 when the employee has no pension", () => {
    expect(calculateEmployerPension(200_000, 0)).toBe(0);
  });
});

describe("calculateWithholding — consultant WHT", () => {
  it("defaults to 20% resident rate", () => {
    const { withholdingTax, netAmount } = calculateWithholding(1_000_000);
    expect(withholdingTax).toBe(200_000);
    expect(netAmount).toBe(800_000);
  });

  it("accepts a custom rate", () => {
    expect(calculateWithholding(1_000_000, 0.15).withholdingTax).toBe(150_000);
  });
});

describe("calculatePAYE — legacy fallback matches banded calculation", () => {
  it("agrees with the hardcoded bands at every boundary", () => {
    for (const gross of [0, 170_000, 170_001, 1_000_000, 1_570_000, 1_570_001, 5_000_000]) {
      const legacy = calculatePAYE(gross);
      const banded = calculatePAYE(gross, [
        { order: 1, fromAmount: 0, toAmount: 170_000, rate: 0 },
        { order: 2, fromAmount: 170_000, toAmount: 1_570_000, rate: 30 },
        { order: 3, fromAmount: 1_570_000, toAmount: null, rate: 35 },
      ]);
      expect(legacy).toBe(banded);
    }
  });
});

describe("allocateRemittance — per-record running balances", () => {
  it("fully clears each record when paid covers the total", () => {
    expect(allocateRemittance([114_000, 9_000], 123_000)).toEqual([114_000, 9_000]);
  });

  it("splits a partial payment proportionally to what each still owes", () => {
    const [a, b] = allocateRemittance([100, 300], 200);
    expect(a).toBeCloseTo(50, 6);   // 100/400 * 200
    expect(b).toBeCloseTo(150, 6);  // 300/400 * 200
    expect(a + b).toBeCloseTo(200, 6);
  });

  it("never allocates more than a record's remaining balance (over-payment)", () => {
    const allocs = allocateRemittance([100, 50], 1_000);
    expect(allocs).toEqual([100, 50]); // capped at each remaining; excess ignored
  });

  it("a waiver clears every remaining balance regardless of amount", () => {
    expect(allocateRemittance([114_000, 9_000], 0, true)).toEqual([114_000, 9_000]);
  });

  it("allocates nothing when nothing is owed", () => {
    expect(allocateRemittance([0, 0], 500)).toEqual([0, 0]);
  });

  it("supports paying a residual after an earlier partial payment", () => {
    // Obligation 123,000; already remitted 100,000 → remaining 23,000; pay it off.
    expect(allocateRemittance([23_000], 23_000)).toEqual([23_000]);
  });
});
