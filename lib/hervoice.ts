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
          "reportType" TEXT,
          "category"   TEXT,
          "district"   TEXT,
          "ta"         TEXT,
          "gvh"        TEXT,
          "village"    TEXT,
          "message"    TEXT,
          "phoneHash"  TEXT,
          "phoneTail"  TEXT,
          "status"     "HerVoiceStatus" NOT NULL DEFAULT 'NEW',
          "advocateNotified" BOOLEAN NOT NULL DEFAULT false,
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
      // Location hierarchy + advocate-notification columns (additive upgrades
      // for tables created by an earlier version of this webhook).
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "HerVoiceReport"
           ADD COLUMN IF NOT EXISTS "reportType" TEXT,
           ADD COLUMN IF NOT EXISTS "ta" TEXT,
           ADD COLUMN IF NOT EXISTS "gvh" TEXT,
           ADD COLUMN IF NOT EXISTS "village" TEXT,
           ADD COLUMN IF NOT EXISTS "advocateNotified" BOOLEAN NOT NULL DEFAULT false;`
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

// ── Location gazetteer (pilot placeholder) ───────────────────────────────────
// Malawi hierarchy: District → Traditional Authority (TA) → Group Village
// Head (GVH) → Village (VH). GVH and village names below are PLACEHOLDERS
// for the pilot demo — replace with the official NSO village register /
// district gazetteer during inception.

export const GAZETTEER: Record<string, Record<string, string[]>> = {
  Thyolo: {
    Bvumbwe: ["Mpinda", "Chikowa", "Nansato", "Maonga"],
    Changata: ["Mangunda", "Chipho", "Kalimbuka", "Naming'azi"],
    Nsabwe: ["Mbawa", "Chilenga", "Nkalo", "Masenjere"],
    Thekerani: ["Chiswe", "Makwasa", "Nachipere", "Mitengo"],
    Khonjeni: ["Khembo", "Nazombe", "Chimvu", "Matapwata"],
    Nchilamwela: ["Thomasi", "Chinyama", "Mphero", "Nankumba"],
  },
  Mzimba: {
    Mbelwa: ["Emoneni", "Luzi", "Kabekere", "Engalaweni"],
    Mzukuzuku: ["Ezondweni", "Manyamula", "Kamangilira", "Njuyu"],
    "Kampingo Sibande": ["Emcisweni", "Kapando", "Mjinge", "Vibangalala"],
    Mtwalo: ["Ekwendeni", "Engcongolweni", "Zombwe", "Emsizini"],
    Chindi: ["Euthini", "Kazomba", "Mpherembe", "Bulala"],
    Mabulabo: ["Kafukule", "Edundu", "Champhira", "Bwengu"],
  },
};

const VILLAGE_POOL = [
  "Kachere", "Mwalija", "Nkhwangwa", "Chilimba", "Mvula", "Njobvu",
  "Kaluwa", "Mphande", "Chiona", "Nyoka", "Zolokere", "Mabuka",
  "Chatha", "Kavuzi", "Msakambewa", "Thundu", "Nkhande", "Milala",
  "Chipeni", "Kambewa", "Sankhulani", "Mtambo", "Chiwaya", "Nkhonde",
];

/** Deterministic list of villages (VHs) under a given GVH. */
export function villagesForGvh(gvh: string): string[] {
  let h = 0;
  for (let i = 0; i < gvh.length; i++) h = (h * 31 + gvh.charCodeAt(i)) >>> 0;
  const start = h % VILLAGE_POOL.length;
  return Array.from({ length: 4 }, (_, i) => VILLAGE_POOL[(start + i * 5) % VILLAGE_POOL.length]);
}

// ── Advocate notification ────────────────────────────────────────────────────
// Pilot routing: one advocate duty phone per district, configured via env:
//   HERVOICE_ADVOCATE_PHONE_THYOLO / HERVOICE_ADVOCATE_PHONE_MZIMBA,
// falling back to HERVOICE_ADVOCATE_PHONE for both. At scale this becomes a
// per-TA roster table with duty schedules.
export async function notifyAdvocate(report: {
  trackingId: string;
  district: string | null;
  ta: string | null;
  gvh: string | null;
  village: string | null;
}): Promise<boolean> {
  const districtKey = (report.district ?? "").toUpperCase().replace(/\s+/g, "_");
  const to =
    process.env[`HERVOICE_ADVOCATE_PHONE_${districtKey}`] ??
    process.env.HERVOICE_ADVOCATE_PHONE;
  if (!to) return false;

  const message =
    `HerVoice! NEW CASE ${report.trackingId}\n` +
    `Village ${report.village ?? "?"}, GVH ${report.gvh ?? "?"}, TA ${report.ta ?? "?"}, ${report.district ?? "?"}.\n` +
    `Received via USSD. Please make safe contact within 24 hrs. Handle confidentially.`;
  return sendSms(to, message);
}
