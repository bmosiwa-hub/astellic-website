/**
 * Privacy-conscious download tracking.
 *
 *  - No IP address, cookie or user identifier is stored.
 *  - A visitor hash (HMAC of IP + user agent + document + UTC day, keyed with
 *    a server secret) lets us count one download per visitor per document per
 *    day. Because the key includes the day, hashes can't be linked across days.
 *  - Known bots, crawlers, link previewers and scripted clients are ignored.
 *  - Country comes from Vercel's edge geolocation header (country level only).
 */
import { createHmac } from "crypto";
import { prisma } from "@/lib/prisma";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|archiver|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|skype|slack|discord|curl|wget|python|httpclient|okhttp|java\/|go-http|node-fetch|axios|headless|phantom|puppeteer|playwright|lighthouse|pagespeed|monitor|uptime|scan/i;

export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.length < 20) return true;
  return BOT_PATTERN.test(userAgent);
}

export function utcDay(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function visitorHash(parts: { ip: string; userAgent: string; documentId: string; day: string }): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "hp-hub-dev-secret";
  return createHmac("sha256", secret)
    .update(`${parts.day}|${parts.ip}|${parts.userAgent}|${parts.documentId}`)
    .digest("hex")
    .slice(0, 32);
}

export function referrerHost(referer: string | null, ownHost: string | null): string | null {
  if (!referer) return null;
  try {
    const host = new URL(referer).hostname.toLowerCase();
    if (ownHost && host === ownHost.toLowerCase().split(":")[0]) return null; // internal navigation
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

export type DownloadMethod = "DOWNLOAD" | "EXTERNAL_SOURCE";

/**
 * Records a download/source visit. Returns true when it was counted (new,
 * human, not a same-day repeat). Never throws — analytics must not break the
 * download itself.
 */
export async function recordDownload(req: Request, documentId: string, method: DownloadMethod): Promise<boolean> {
  try {
    const ua = req.headers.get("user-agent");
    if (isLikelyBot(ua)) return false;
    // Prefetches and range continuations are not new downloads.
    const purpose = req.headers.get("purpose") ?? req.headers.get("sec-purpose");
    if (purpose?.includes("prefetch")) return false;
    const range = req.headers.get("range");
    if (range && !/^bytes=0-/.test(range)) return false;

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const day = utcDay();
    const country = req.headers.get("x-vercel-ip-country")?.slice(0, 2).toUpperCase() || null;

    const { count } = await prisma.hpDownloadEvent.createMany({
      data: [
        {
          documentId,
          method,
          day,
          country,
          referrerHost: referrerHost(req.headers.get("referer"), req.headers.get("host")),
          visitorHash: visitorHash({ ip, userAgent: ua ?? "", documentId, day }),
        },
      ],
      skipDuplicates: true,
    });
    if (count === 1 && method === "DOWNLOAD") {
      await prisma.hpDocument.update({ where: { id: documentId }, data: { downloadCount: { increment: 1 } } });
    }
    return count === 1;
  } catch (err) {
    console.error("[hp-hub/analytics] failed to record download", err);
    return false;
  }
}
