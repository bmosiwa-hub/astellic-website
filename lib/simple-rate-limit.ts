/**
 * Best-effort in-memory rate limiter for public endpoints.
 *
 * Caveat: on Vercel each lambda instance has its own memory, so this is a
 * per-instance limit, not a global one. It still blunts naive abuse (loops
 * hitting a warm instance). For a hard global limit, back this with Upstash
 * Redis or a Vercel WAF rule.
 */
const buckets = new Map<string, number[]>();

export function rateLimitOk(
  key: string,
  limit = 5,
  windowMs = 10 * 60 * 1000,
): boolean {
  const now  = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  // Opportunistic cleanup so the map doesn't grow unbounded
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Allowed upload types for public application forms. */
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXT = /\.(pdf|docx?|PDF|DOCX?)$/;

export function isAllowedDocument(file: File): boolean {
  return ALLOWED_MIME.has(file.type) || ALLOWED_EXT.test(file.name);
}
