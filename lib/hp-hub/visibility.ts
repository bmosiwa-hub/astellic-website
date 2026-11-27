/**
 * What the public may see. Centralised so every public query, the sitemap and
 * the download routes apply exactly the same rule.
 */
import type { Prisma } from "@prisma/client";

/**
 * Synthetic (development test) records are never shown in production. In
 * development and preview they appear only when HP_HUB_SHOW_SYNTHETIC=true.
 */
export function showSyntheticRecords(): boolean {
  return process.env.VERCEL_ENV !== "production" && process.env.HP_HUB_SHOW_SYNTHETIC === "true";
}

/**
 * Launch switch for search engines. Until HP_HUB_INDEXING=true (set it in
 * Vercel when the repository launches), public HP-Hub pages are noindex and
 * left out of the sitemap. The pages themselves still work for anyone with
 * the link.
 */
export function hpHubIndexable(): boolean {
  return process.env.HP_HUB_INDEXING === "true";
}

export function publicDocumentWhere(extra: Prisma.HpDocumentWhereInput = {}): Prisma.HpDocumentWhereInput {
  return {
    status: "PUBLISHED",
    ...(showSyntheticRecords() ? {} : { isSynthetic: false }),
    ...extra,
  };
}

/** A file may be served publicly only for published HOSTED records with hosting rights. */
export function isPubliclyDownloadable(doc: {
  status: string;
  accessType: string;
  permissionStatus: string;
  isSynthetic: boolean;
  storagePath: string | null;
}): boolean {
  return (
    doc.status === "PUBLISHED" &&
    doc.accessType === "HOSTED" &&
    (doc.permissionStatus === "GRANTED" || doc.permissionStatus === "OPEN_LICENSE") &&
    !!doc.storagePath &&
    (!doc.isSynthetic || showSyntheticRecords())
  );
}
