/** Format a number as MWK or other currency */
export function formatCurrency(amount: number, currency = "MWK"): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Format a date as DD MMM YYYY */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculate Malawi PAYE (Pay As You Earn) for a given MONTHLY gross salary.
 *
 * Annual bands (MWK):
 *   0 – 170,000          → 0%
 *   170,001 – 1,570,000  → 30%   (next MWK 1,399,999)
 *   1,570,001 – 10,000,000 → 35% (next MWK 8,430,000)
 *   > 10,000,000          → 40%
 *
 * Monthly thresholds = annual / 12.
 */
export function calculatePAYE(monthlyGross: number): number {
  // Monthly band ceilings
  const B1 = 170_000 / 12;        // 14 166.67  → 0%
  const B2 = 1_570_000 / 12;      // 130 833.33 → 30%
  const B3 = 10_000_000 / 12;     // 833 333.33 → 35%
  //                               above B3      → 40%

  if (monthlyGross <= B1) return 0;

  let tax = 0;
  tax += (Math.min(monthlyGross, B2) - B1) * 0.30;
  if (monthlyGross > B2) tax += (Math.min(monthlyGross, B3) - B2) * 0.35;
  if (monthlyGross > B3) tax += (monthlyGross - B3) * 0.40;

  return Math.round(tax * 100) / 100;
}

/**
 * Calculate net pay after PAYE, NSSF and optional pension deductions.
 * @param pensionRate  Employee pension contribution as a percentage (default 5 %)
 * @param nssfRate     NSSF contribution rate (default 3 %)
 */
export function calculateNetPay(
  grossSalary: number,
  nssfRate = 0.03,
  pensionRate = 5
): {
  paye: number;
  nssfEmployee: number;
  nssfEmployer: number;
  pension: number;
  netPay: number;
} {
  const paye         = calculatePAYE(grossSalary);
  const nssfEmployee = Math.round(grossSalary * nssfRate * 100) / 100;
  const nssfEmployer = Math.round(grossSalary * nssfRate * 100) / 100;
  const pension      = Math.round(grossSalary * (pensionRate / 100) * 100) / 100;
  const netPay       = grossSalary - paye - nssfEmployee - pension;
  return { paye, nssfEmployee, nssfEmployer, pension, netPay };
}

/**
 * Calculate consultant withholding tax.
 * Default rate: 20% for resident consultants
 */
export function calculateWithholding(
  grossAmount: number,
  rate = 0.2
): { withholdingTax: number; netAmount: number } {
  const withholdingTax = Math.round(grossAmount * rate * 100) / 100;
  const netAmount = grossAmount - withholdingTax;
  return { withholdingTax, netAmount };
}
