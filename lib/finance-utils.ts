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
 * Calculate Malawi PAYE (Pay As You Earn) for a given monthly gross salary.
 * Bands as of 2024/25:
 *   0 – 100,000     : 0%
 *   100,001 – 350,000: 25%
 *   350,001+         : 35%
 */
export function calculatePAYE(monthlySalary: number): number {
  let tax = 0;
  if (monthlySalary <= 100_000) {
    tax = 0;
  } else if (monthlySalary <= 350_000) {
    tax = (monthlySalary - 100_000) * 0.25;
  } else {
    tax = 250_000 * 0.25 + (monthlySalary - 350_000) * 0.35;
  }
  return Math.round(tax * 100) / 100;
}

/**
 * Calculate net pay after PAYE and NSSF deductions.
 * NSSF employee: 3% of gross (capped as configured)
 * NSSF employer: 3% of gross
 */
export function calculateNetPay(
  grossSalary: number,
  nssfRate = 0.03
): { paye: number; nssfEmployee: number; nssfEmployer: number; netPay: number } {
  const paye = calculatePAYE(grossSalary);
  const nssfEmployee = Math.round(grossSalary * nssfRate * 100) / 100;
  const nssfEmployer = Math.round(grossSalary * nssfRate * 100) / 100;
  const netPay = grossSalary - paye - nssfEmployee;
  return { paye, nssfEmployee, nssfEmployer, netPay };
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
