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
 *
 * When the employee's salary is quoted in a foreign currency, pass `middleRate`
 * (MWK per 1 unit of that currency, e.g. 1734 for USD).  The function:
 *   1. Converts grossSalary → MWK equivalent
 *   2. Calculates PAYE, NSSF, pension on the MWK figure
 *   3. Converts deductions and net back to the original currency
 *
 * If `middleRate` is omitted or 1, the salary is assumed to be in MWK and no
 * conversion step is applied.
 *
 * @param grossSalary  Gross monthly salary in the employee's quoted currency
 * @param nssfRate     NSSF employee contribution rate (default 3 %)
 * @param pensionRate  Employee pension contribution as a percentage (default 5 %)
 * @param middleRate   MWK per 1 unit of the salary currency (default 1 = MWK)
 */
export function calculateNetPay(
  grossSalary: number,
  nssfRate = 0.03,
  pensionRate = 5,
  middleRate = 1
): {
  // Amounts in the employee's quoted currency
  paye: number;
  nssfEmployee: number;
  nssfEmployer: number;
  pension: number;
  netPay: number;
  // MWK equivalents (always populated; same as above when middleRate === 1)
  grossMWK: number;
  payeMWK: number;
  nssfEmployeeMWK: number;
  nssfEmployerMWK: number;
  pensionMWK: number;
  netPayMWK: number;
} {
  const rate = middleRate > 0 ? middleRate : 1;

  // Step 1: convert to MWK
  const grossMWK = Math.round(grossSalary * rate * 100) / 100;

  // Step 2: compute deductions on MWK equivalent
  const payeMWK         = calculatePAYE(grossMWK);
  const nssfEmployeeMWK = Math.round(grossMWK * nssfRate * 100) / 100;
  const nssfEmployerMWK = Math.round(grossMWK * nssfRate * 100) / 100;
  const pensionMWK      = Math.round(grossMWK * (pensionRate / 100) * 100) / 100;
  const netPayMWK       = grossMWK - payeMWK - nssfEmployeeMWK - pensionMWK;

  // Step 3: convert back to original currency
  const r = (mwk: number) => Math.round((mwk / rate) * 100) / 100;

  return {
    paye:           r(payeMWK),
    nssfEmployee:   r(nssfEmployeeMWK),
    nssfEmployer:   r(nssfEmployerMWK),
    pension:        r(pensionMWK),
    netPay:         r(netPayMWK),
    grossMWK,
    payeMWK,
    nssfEmployeeMWK,
    nssfEmployerMWK,
    pensionMWK,
    netPayMWK,
  };
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
