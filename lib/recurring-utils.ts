import type { RecurringFrequency } from "@prisma/client";

export function addFrequency(date: Date, frequency: RecurringFrequency): Date {
  const d = new Date(date);
  switch (frequency) {
    case "WEEKLY":      d.setDate(d.getDate() + 7);          break;
    case "FORTNIGHTLY": d.setDate(d.getDate() + 14);         break;
    case "MONTHLY":     d.setMonth(d.getMonth() + 1);        break;
    case "QUARTERLY":   d.setMonth(d.getMonth() + 3);        break;
    case "SEMI_ANNUAL": d.setMonth(d.getMonth() + 6);        break;
    case "ANNUAL":      d.setFullYear(d.getFullYear() + 1);  break;
  }
  return d;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

/** Generate all due dates from startDate up to endDate or 24 occurrences */
export function generateDueDates(
  startDate: Date,
  frequency: RecurringFrequency,
  endDate: Date | null,
  maxOccurrences = 24
): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);
  const cutoff = endDate ?? addYears(startDate, 2);

  while (current <= cutoff && dates.length < maxOccurrences) {
    dates.push(new Date(current));
    current = addFrequency(current, frequency);
  }
  return dates;
}
