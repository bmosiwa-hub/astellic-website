/**
 * TOTP generation and verification — Node.js server only.
 * Uses `crypto` from Node.js — DO NOT import this from middleware (Edge Runtime).
 *
 * Implements RFC 6238 (TOTP) + RFC 4226 (HOTP) from scratch,
 * with no external dependencies beyond Node.js built-ins.
 */

import { createHmac, randomBytes } from "crypto";
import bcrypt from "bcryptjs";

// ── Base32 (RFC 4648) ─────────────────────────────────────────────────────────

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Buffer {
  const str = input.toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  const out: number[] = [];
  let bits = 0, val = 0;
  for (const ch of str) {
    const idx = B32.indexOf(ch);
    if (idx < 0) continue;
    val  = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) { out.push((val >>> (bits - 8)) & 0xff); bits -= 8; }
  }
  return Buffer.from(out);
}

function base32Encode(buf: Buffer): string {
  let result = "", bits = 0, val = 0;
  for (const byte of buf) {
    val   = (val << 8) | byte;
    bits += 8;
    while (bits >= 5) { result += B32[(val >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) result += B32[(val << (5 - bits)) & 31];
  return result;
}

// ── HOTP (RFC 4226) ───────────────────────────────────────────────────────────

function hotp(secretBuf: Buffer, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac  = createHmac("sha1", secretBuf).update(msg).digest();
  const off   = hmac[hmac.length - 1] & 0xf;
  const code  = ((hmac[off] & 0x7f) << 24) | (hmac[off + 1] << 16) | (hmac[off + 2] << 8) | hmac[off + 3];
  return String(code % 1_000_000).padStart(6, "0");
}

// ── TOTP (RFC 6238) ───────────────────────────────────────────────────────────

function totpAt(secret: string, timeStep?: number): string {
  const step = timeStep ?? Math.floor(Date.now() / 30_000);
  return hotp(base32Decode(secret), step);
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Generate a cryptographically random 20-byte base32 TOTP secret. */
export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

/** Build the otpauth:// URI for QR code generation. */
export function buildOtpAuthUri(secret: string, accountEmail: string, issuer = "Astelfin IMS"): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits:    "6",
    period:    "30",
  });
  const account = encodeURIComponent(`${issuer}:${accountEmail}`);
  return `otpauth://totp/${account}?${params.toString()}`;
}

/**
 * Verify a 6-digit TOTP token.
 * Accepts codes from ±1 time step (±30 s) to handle clock drift.
 */
export function verifyTotpToken(secret: string, token: string): boolean {
  const code = token.replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  const step = Math.floor(Date.now() / 30_000);
  for (const drift of [-1, 0, 1]) {
    if (totpAt(secret, step + drift) === code) return true;
  }
  return false;
}

// ── Backup codes ──────────────────────────────────────────────────────────────

const BACKUP_CODE_COUNT  = 8;
const BACKUP_CODE_LENGTH = 10; // characters (alphanumeric, hyphenated as XXXXX-XXXXX)
const BACKUP_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous I/1/0/O

function randomBackupCode(): string {
  const half = (len: number) =>
    Array.from({ length: len }, () => BACKUP_CHARS[randomBytes(1)[0] % BACKUP_CHARS.length]).join("");
  return `${half(5)}-${half(5)}`;
}

/**
 * Generate 8 one-time backup codes.
 * Returns `{ plainCodes, hashedCodes }` — store hashed, show plain ONCE.
 */
export async function generateBackupCodes(): Promise<{ plainCodes: string[]; hashedCodes: string[] }> {
  const plainCodes = Array.from({ length: BACKUP_CODE_COUNT }, randomBackupCode);
  const hashedCodes = await Promise.all(plainCodes.map((c) => bcrypt.hash(c.replace("-", ""), 10)));
  return { plainCodes, hashedCodes };
}

/**
 * Try to consume a backup code.
 * Returns the index of the matched code (so the caller can remove it), or -1 if no match.
 * Comparison ignores the hyphen and is case-insensitive.
 */
export async function consumeBackupCode(
  input: string,
  hashedCodes: string[],
): Promise<number> {
  const normalised = input.replace(/[-\s]/g, "").toUpperCase();
  for (let i = 0; i < hashedCodes.length; i++) {
    const match = await bcrypt.compare(normalised, hashedCodes[i]);
    if (match) return i;
  }
  return -1;
}
