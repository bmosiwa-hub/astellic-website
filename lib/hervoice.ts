// HerVoice! — shared helpers for the Africa's Talking SMS & USSD webhooks.
//
// Privacy by design: the reporter's phone number is never stored — only a
// SHA-256 hash (for STATUS lookups) and the last three digits.

import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

// ── Self-provisioning table ──────────────────────────────────────────────────
// Production applies schema by different paths in different environments, so
// the webhook guarantees its own (fully additive) table instead of depending
// on a migration having run. Everything is IF NOT EXISTS; no existing object
// is ever altered.
let ensured: Promise<void> | null = null;

export function ensureHerVoiceTable(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "HerVoiceChannel" AS ENUM ('SMS', 'USSD');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      `);
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          CREATE TYPE "HerVoiceStatus" AS ENUM ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "HerVoiceReport" (
          "id"         TEXT NOT NULL,
          "trackingId" TEXT NOT NULL,
          "channel"    "HerVoiceChannel" NOT NULL,
          "category"   TEXT,
          "district"   TEXT,
          "message"    TEXT,
          "phoneHash"  TEXT,
          "phoneTail"  TEXT,
          "status"     "HerVoiceStatus" NOT NULL DEFAULT 'NEW',
          "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "HerVoiceReport_pkey" PRIMARY KEY ("id")
        );
      `);
      await prisma.$executeRawUnsafe(
        `CREATE UNIQUE INDEX IF NOT EXISTS "HerVoiceReport_trackingId_key" ON "HerVoiceReport"("trackingId");`
      );
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "HerVoiceReport_status_idx" ON "HerVoiceReport"("status");`
      );
      await prisma.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "HerVoiceReport_phoneHash_idx" ON "HerVoiceReport"("phoneHash");`
      );
    })().catch((e) => {
      ensured = null; // allow retry on next request
      throw e;
    });
  }
  return ensured;
}

// ── Utilities ────────────────────────────────────────────────────────────────
export function hashPhone(phone: string): string {
  return createHash("sha256").update(phone.trim()).digest("hex");
}

export function phoneTail(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-3);
}

export function newTrackingId(): string {
  return `CMP-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function normaliseTrackingId(raw: string): string | null {
  const m = raw.toUpperCase().match(/CMP[\s-]?(\d{4,6})/);
  return m ? `CMP-${m[1]}` : null;
}

export const CATEGORIES = [
  "Service denied",
  "Medicine stockout",
  "Delayed care",
  "Police misconduct",
  "Advocate unavailable",
  "Other",
] as const;

export function guessCategory(text: string): string {
  const t = text.toLowerCase();
  if (/(medicine|drug|stock|pill|pep|contracept)/.test(t)) return "Medicine stockout";
  if (/(denied|refus|turned away|sent back|chased)/.test(t)) return "Service denied";
  if (/(wait|delay|slow|hours|queue|ambulance)/.test(t)) return "Delayed care";
  if (/(police|officer|vsu|bribe)/.test(t)) return "Police misconduct";
  if (/(advocate|nkhoswe|volunteer)/.test(t)) return "Advocate unavailable";
  return "Other";
}

export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: "RECEIVED - awaiting assignment",
    ASSIGNED: "ASSIGNED to a district officer",
    IN_PROGRESS: "IN PROGRESS",
    ESCALATED: "ESCALATED to the regional office",
    RESOLVED: "RESOLVED",
  };
  return map[status] ?? status;
}

// ── Shared-secret check (optional hardening) ─────────────────────────────────
// If HERVOICE_WEBHOOK_TOKEN is set in the environment, the callback URL must
// include ?token=<value>. If unset, requests are accepted (pilot mode).
export function tokenOk(url: URL): boolean {
  const expected = process.env.HERVOICE_WEBHOOK_TOKEN;
  if (!expected) return true;
  return url.searchParams.get("token") === expected;
}

// ── Outbound SMS via Africa's Talking ────────────────────────────────────────
// Requires AT_USERNAME and AT_API_KEY env vars. Uses the sandbox host when
// AT_USERNAME is "sandbox". If unconfigured, sending is skipped silently —
// reports are still stored, so the webhook works before credentials are set.
export async function sendSms(to: string, message: string): Promise<boolean> {
  const username = process.env.AT_USERNAME;
  const apiKey = process.env.AT_API_KEY;
  if (!username || !apiKey) return false;

  const host =
    username === "sandbox"
      ? "https://api.sandbox.africastalking.com"
      : "https://api.africastalking.com";

  const body = new URLSearchParams({ username, to, message });
  const from = process.env.AT_SHORTCODE;
  if (from) body.set("from", from);

  try {
    const res = await fetch(`${host}/version1/messaging`, {
      method: "POST",
      headers: {
        apiKey,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
