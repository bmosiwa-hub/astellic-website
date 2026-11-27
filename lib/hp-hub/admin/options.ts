/** Select-list data for admin forms. */
import { prisma } from "@/lib/prisma";
import { blobAccess, storageConfigured, uploadPrefix, type UploadArea } from "../storage";

export async function taxonomyOptions() {
  const [countries, types, publishers, themes] = await Promise.all([
    prisma.hpCountry.findMany({ orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }], select: { id: true, name: true } }),
    prisma.hpDocumentType.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    prisma.hpPublisher.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, acronym: true } }),
    prisma.hpTheme.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
  ]);
  return { countries, types, publishers, themes };
}

export function uploadConfig(area: UploadArea): { prefix: string; access: "private" | "public" } | null {
  return storageConfigured() ? { prefix: uploadPrefix(area), access: blobAccess() } : null;
}
