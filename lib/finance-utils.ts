/** Format a number as MWK or other currency */
export function formatCurrency(amount: number, currency = "MWK"): string {
  return new Intl.NumberFormat("en-MW", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/** Turn a "YYYY-MM" period into a readable month (e.g. "July 2026"). Leaves
 *  anything else (e.g. "CIT 2026", already-formatted labels) untouched. */
export function fmtPeriod(period: string): string {
  const m = /^(\d{4})-(\d{2})$/.exec((period ?? "").trim());
  if (!m) return period;
  return new Date(Number(m[1]), Number(m[2]) - 1, 1)
    .toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/** Format a comma-separated list of periods readably. */
export function fmtPeriodList(label: string): string {
  return (label ?? "").split(",").map((p) => fmtPeriod(p.trim())).join(", ");
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
 * Accepts an optional `bands` array (from lib/paye.ts PAYEBandData[]).
 * When `bands` is omitted the hardcoded 2024 MRA rates are used — this keeps
 * all existing call-sites working unchanged.
 *
 * Monthly bands (MWK) — these ARE monthly figures, not annual:
 *   MWK 0 – 170,000          → 0%
 *   MWK 170,001 – 1,570,000  → 30%
 *   Above MWK 1,570,000      → 35%
 */
export function calculatePAYE(
  monthlyGross: number,
  bands?: Array<{ fromAmount: number; toAmount: number | null; rate: number; order: number }>,
): number {
  // If versioned bands are supplied, use them
  if (bands && bands.length > 0) {
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

  // Legacy hardcoded fallback
  const B1 = 170_000;    // 0% up to here
  const B2 = 1_570_000;  // 30% up to here, 35% above

  if (monthlyGross <= B1) return 0;

  let tax = 0;
  tax += (Math.min(monthlyGross, B2) - B1) * 0.30;
  if (monthlyGross > B2) tax += (monthlyGross - B2) * 0.35;

  return Math.round(tax * 100) / 100;
}

/**
 * Calculate net pay after PAYE, pension, and optional NSSF deductions.
 *
 * When the employee's salary is quoted in a foreign currency, pass `middleRate`
 * (MWK per 1 unit of that currency, e.g. 1734 for USD).  The function:
 *   1. Converts grossSalary → MWK equivalent
 *   2. Calculates PAYE, pension, and NSSF on the MWK figure
 *   3. Converts deductions and net back to the original currency
 *
 * If `middleRate` is omitted or 1, the salary is assumed to be in MWK.
 *
 * @param grossSalary       Gross monthly salary in the employee's quoted currency
 * @param pensionRate       Employee pension contribution as a percentage (default 5 %)
 * @param middleRate        MWK per 1 unit of the salary currency (default 1 = MWK)
 * @param options.payeExempt         Skip PAYE (default false)
 * @param options.nssfApplicable     Apply NSSF contributions (default false)
 * @param options.nssfEmployeeRate   NSSF employee % (default 3)
 * @param options.nssfEmployerRate   NSSF employer % (default 3)
 */
export function calculateNetPay(
  grossSalary: number,
  pensionRate = 5,
  middleRate = 1,
  options: {
    payeExempt?: boolean;
    nssfApplicable?: boolean;
    nssfEmployeeRate?: number;
    nssfEmployerRate?: number;
    /** Versioned PAYE bands from lib/paye.ts — omit to use hardcoded fallback */
    payeBands?: Array<{ fromAmount: number; toAmount: number | null; rate: number; order: number }>;
  } = {}
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
  const {
    payeExempt       = false,
    nssfApplicable   = false,
    nssfEmployeeRate = 3,
    nssfEmployerRate = 3,
    payeBands,
  } = options;

  // Step 1: convert to MWK
  const grossMWK = Math.round(grossSalary * rate * 100) / 100;

  // Step 2: compute deductions on MWK equivalent
  const payeMWK         = payeExempt ? 0 : calculatePAYE(grossMWK, payeBands);
  const nssfEmployeeMWK = nssfApplicable ? Math.round(grossMWK * (nssfEmployeeRate / 100) * 100) / 100 : 0;
  const nssfEmployerMWK = nssfApplicable ? Math.round(grossMWK * (nssfEmployerRate / 100) * 100) / 100 : 0;
  const pensionMWK      = Math.round(grossMWK * (pensionRate / 100) * 100) / 100;
  // Net = gross minus employee-side deductions only (employer NSSF is a cost to employer, not deducted from employee)
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
 * Calculate employer pension contribution (Malawi: 10% of gross MWK).
 * Returns 0 when pensionRate === 0 (pension not applicable for the employee).
 */
export function calculateEmployerPension(grossMWK: number, employeePensionRate: number): number {
  if (employeePensionRate <= 0) return 0;
  return Math.round(grossMWK * 0.10 * 100) / 100; // employer always contributes 10%
}

/**
 * Split a remittance `paid` across records in proportion to how much each still
 * owes (`remainings`). A waiver clears each record's full remaining balance.
 * Each allocation is capped at that record's remaining, so an over-payment never
 * allocates more than is owed. Returns the amount applied to each record.
 */
export function allocateRemittance(
  remainings: number[],
  paid: number,
  waived = false,
): number[] {
  if (waived) return remainings.map((r) => Math.max(0, r));
  const total = remainings.reduce((s, r) => s + Math.max(0, r), 0);
  if (total <= 0) return remainings.map(() => 0);
  return remainings.map((r) => {
    const rem = Math.max(0, r);
    return Math.min(rem, (paid * rem) / total);
  });
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
