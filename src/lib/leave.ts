export function calculateDays(startDate: string | Date, endDate: string | Date) {
  const s = new Date(startDate);
  const e = new Date(endDate);
  // Normalize to midnight UTC to avoid timezone issues
  const sUtc = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
  const eUtc = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((eUtc - sUtc) / msPerDay) + 1; // inclusive days
}

export function rangesOverlap(aStart: string | Date, aEnd: string | Date, bStart: string | Date, bEnd: string | Date) {
  const aS = new Date(aStart).getTime();
  const aE = new Date(aEnd).getTime();
  const bS = new Date(bStart).getTime();
  const bE = new Date(bEnd).getTime();
  return aS <= bE && bS <= aE;
}
