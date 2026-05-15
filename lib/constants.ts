/**
 * Astellic launch date constants.
 * All date inputs across the system use these values as minimum/default
 * to prevent records from being backdated before the company launch.
 */

/** ISO date string — used as `min` and `defaultValue` on date inputs */
export const LAUNCH_DATE = "2026-06-01";

/** Numeric year — used for year selectors (e.g. utilisation report) */
export const LAUNCH_YEAR = 2026;

/** YYYY-MM string — used as `min` on `type="month"` inputs (e.g. payroll period) */
export const LAUNCH_PERIOD = "2026-06";
