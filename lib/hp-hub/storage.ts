/**
 * HP-Hub file storage, behind a small interface so the provider can be swapped
 * (S3, R2, Azure…) by adding another implementation of `StorageProvider`.
 *
 * Current provider: Vercel Blob.
 *  - Files are uploaded directly from the browser with a short-lived token
 *    issued by /api/hp-hub/upload (which checks permissions, type and size),
 *    so large PDFs don't pass through a serverless function body.
 *  - Downloads are always streamed through our own routes, which check the
 *    document's access type first. Blob URLs are never sent to browsers.
 *
 * Environment:
 *  - HP_HUB_BLOB_TOKEN   optional; a dedicated store's read-write token.
 *                        Falls back to BLOB_READ_WRITE_TOKEN.
 *  - HP_HUB_BLOB_ACCESS  "private" (default) or "public". Use "public" only
 *                        if the store doesn't support private blobs; files
 *                        are then reachable by anyone holding the (random,
 *                        never-published) blob URL.
 */
// Server-only module: it reads storage credentials from the environment.
import { del, get, head } from "@vercel/blob";
import { magicBytesMatch } from "./files";

export const STORAGE_PROVIDER = "vercel-blob";

export function blobToken(): string | undefined {
  return process.env.HP_HUB_BLOB_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || undefined;
}

export function blobAccess(): "private" | "public" {
  return process.env.HP_HUB_BLOB_ACCESS === "public" ? "public" : "private";
}

export function storageConfigured(): boolean {
  return !!blobToken();
}

/** Environment segment keeps development uploads apart from production files. */
function envSegment(): string {
  return process.env.VERCEL_ENV === "production" ? "prod" : process.env.VERCEL_ENV === "preview" ? "preview" : "dev";
}

export type UploadArea = "documents" | "submissions" | "evidence";

export function uploadPrefix(area: UploadArea): string {
  return `hp-hub/${envSegment()}/${area}/`;
}

export interface StoredFile {
  provider: string;
  path: string; // provider key (for Vercel Blob: the blob URL)
  size: number;
  contentType: string;
}

/**
 * Confirms that a client-reported upload really exists in our store, sits in
 * the expected area, is within the size limit and has the right file
 * signature. Returns its canonical metadata, or an error message.
 */
export async function verifyUpload(
  url: string,
  opts: { area: UploadArea; mime: string; maxBytes: number },
): Promise<{ ok: true; file: StoredFile } | { ok: false; error: string }> {
  const token = blobToken();
  if (!token) return { ok: false, error: "File storage is not configured." };
  try {
    const meta = await head(url, { token });
    if (!meta.pathname.startsWith(uploadPrefix(opts.area))) {
      return { ok: false, error: "The upload is not in the expected location." };
    }
    if (meta.size > opts.maxBytes) return { ok: false, error: "The file is too large." };

    // useCache:false (read from origin) is only valid for private blobs.
    const access = blobAccess();
    const res = await get(url, access === "private" ? { access, token, useCache: false } : { access, token });
    if (!res || res.statusCode !== 200) return { ok: false, error: "The uploaded file could not be read." };
    const reader = res.stream.getReader();
    const { value } = await reader.read();
    await reader.cancel().catch(() => {});
    if (!value || !magicBytesMatch(opts.mime, value)) {
      await del(url, { token }).catch(() => {});
      return { ok: false, error: "The file's contents don't match its type, so it was rejected." };
    }
    return { ok: true, file: { provider: STORAGE_PROVIDER, path: meta.url, size: meta.size, contentType: opts.mime } };
  } catch (err) {
    console.error("[hp-hub/storage] verifyUpload failed", err);
    return { ok: false, error: "The uploaded file could not be verified. Please try again." };
  }
}

/** Opens a stored file for streaming to the client. */
export async function openFile(
  provider: string,
  path: string,
): Promise<{ stream: ReadableStream<Uint8Array>; size: number; contentType: string } | null> {
  if (provider !== STORAGE_PROVIDER) throw new Error(`Unknown storage provider: ${provider}`);
  const token = blobToken();
  if (!token) return null;
  const res = await get(path, { access: blobAccess(), token });
  if (!res || res.statusCode !== 200) return null;
  return { stream: res.stream, size: res.blob.size, contentType: res.blob.contentType };
}

/** Deletes a stored file. Failures are logged, not thrown: metadata stays authoritative. */
export async function deleteFile(provider: string | null, path: string | null): Promise<void> {
  if (!provider || !path) return;
  if (provider !== STORAGE_PROVIDER) return;
  try {
    await del(path, { token: blobToken() });
  } catch (err) {
    console.error("[hp-hub/storage] delete failed", err);
  }
}
