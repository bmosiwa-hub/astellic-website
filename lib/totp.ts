/**
 * 2FA cookie helpers — Edge Runtime safe.
 * Uses only Web Crypto (crypto.subtle), which runs in both middleware (Edge)
 * and Node.js server actions.
 *
 * TOTP generation/verification lives in lib/totp-server.ts (Node.js only).
 */

export const COOKIE_NAME = "tfa_ok";

const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours — matches JWT session maxAge

// ── Internal helpers ──────────────────────────────────────────────────────────

function bufToB64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64url");
}

function b64ToBuf(b64: string): ArrayBuffer {
  const bytes = Buffer.from(b64, "base64url");
  // Slice to get a plain ArrayBuffer (not a SharedArrayBuffer slice)
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

async function importKey(): Promise<CryptoKey> {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    // Never fall back to a guessable key — a missing secret must fail closed,
    // otherwise every 2FA cookie could be forged.
    throw new Error("NEXTAUTH_SECRET is not set — cannot sign/verify 2FA cookies");
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Build a signed 2FA cookie value.
 * Format: `<expiresAt>.<userId>.<hmac-base64url>`
 */
export async function sign2faCookie(userId: string): Promise<string> {
  const expiresAt = Date.now() + TTL_MS;
  const data      = `${expiresAt}.${userId}`;
  const key       = await importKey();
  const sig       = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return `${data}.${bufToB64(sig)}`;
}

/**
 * Verify a 2FA cookie value for `userId`.
 * Returns true only if signature is valid and cookie has not expired.
 */
export async function verify2faCookie(cookieValue: string, userId: string): Promise<boolean> {
  try {
    const parts = cookieValue.split(".");
    if (parts.length !== 3) return false;
    const [expiresAtStr, cookieUserId, sigB64] = parts;

    if (cookieUserId !== userId)         return false;
    if (Date.now() > parseInt(expiresAtStr)) return false;

    const data = `${expiresAtStr}.${userId}`;
    const key  = await importKey();
    return crypto.subtle.verify(
      "HMAC",
      key,
      b64ToBuf(sigB64),
      new TextEncoder().encode(data),
    );
  } catch {
    return false;
  }
}
