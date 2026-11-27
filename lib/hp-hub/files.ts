/**
 * File-type rules for HP-Hub uploads. Pure functions (no I/O), shared by the
 * upload-token route, the server-side post-upload check and the client UI.
 */

export const MB = 1024 * 1024;

export const ADMIN_MAX_BYTES = 100 * MB;
export const PUBLIC_MAX_BYTES = 25 * MB;
export const EVIDENCE_MAX_BYTES = 25 * MB;

type Kind = "pdf" | "ooxml" | "ole";

const TYPES: Record<string, { ext: string[]; kind: Kind }> = {
  "application/pdf": { ext: ["pdf"], kind: "pdf" },
  "application/msword": { ext: ["doc"], kind: "ole" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: ["docx"], kind: "ooxml" },
  "application/vnd.ms-excel": { ext: ["xls"], kind: "ole" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { ext: ["xlsx"], kind: "ooxml" },
  "application/vnd.ms-powerpoint": { ext: ["ppt"], kind: "ole" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { ext: ["pptx"], kind: "ooxml" },
};

export const ADMIN_MIME_TYPES = Object.keys(TYPES);
export const PUBLIC_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ADMIN_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx";
export const PUBLIC_ACCEPT = ".pdf,.doc,.docx";

export function extensionOf(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  return i >= 0 ? fileName.slice(i + 1).toLowerCase() : "";
}

/** Resolves a MIME type from the declared type or, failing that, the extension. */
export function resolveMime(fileName: string, declared?: string | null): string | null {
  if (declared && TYPES[declared]) return declared;
  const ext = extensionOf(fileName);
  for (const [mime, t] of Object.entries(TYPES)) if (t.ext.includes(ext)) return mime;
  return null;
}

export function checkFileMeta(
  file: { name: string; size: number; type?: string | null },
  opts: { allowed: string[]; maxBytes: number },
): { ok: true; mime: string } | { ok: false; error: string } {
  const mime = resolveMime(file.name, file.type);
  if (!mime || !opts.allowed.includes(mime)) {
    return { ok: false, error: "This file type isn't accepted. Upload a PDF or Microsoft Office document." };
  }
  const ext = extensionOf(file.name);
  if (!TYPES[mime].ext.includes(ext)) {
    return { ok: false, error: "The file extension doesn't match its type." };
  }
  if (file.size <= 0) return { ok: false, error: "The file is empty." };
  if (file.size > opts.maxBytes) {
    return { ok: false, error: `The file is larger than the ${Math.round(opts.maxBytes / MB)} MB limit.` };
  }
  return { ok: true, mime };
}

/**
 * Checks a file's leading bytes against its claimed type, so a renamed
 * executable or HTML page can't be stored as a "PDF".
 */
export function magicBytesMatch(mime: string, head: Uint8Array): boolean {
  const t = TYPES[mime];
  if (!t || head.length < 8) return false;
  const startsWith = (sig: number[]) => sig.every((b, i) => head[i] === b);
  switch (t.kind) {
    case "pdf": {
      // "%PDF-" may be preceded by a little junk; the spec allows it within 1 KB.
      const text = new TextDecoder("latin1").decode(head.subarray(0, 1024));
      return text.includes("%PDF-");
    }
    case "ooxml":
      return startsWith([0x50, 0x4b, 0x03, 0x04]); // ZIP container
    case "ole":
      return startsWith([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
  }
}

/** Safe filename for Content-Disposition and storage paths. */
export function safeFileName(name: string): string {
  const ext = extensionOf(name);
  const base = name
    .slice(0, name.length - (ext ? ext.length + 1 : 0))
    .normalize("NFKD")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 100)
    .replace(/^[-.]+|[-.]+$/g, "");
  return `${base || "document"}${ext ? `.${ext}` : ""}`;
}
