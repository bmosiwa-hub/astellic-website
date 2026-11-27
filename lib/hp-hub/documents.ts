/**
 * Writes to repository documents. All paths that create or change a document
 * (admin form, CSV import, accepted submissions) go through here so slugs,
 * publishers, keywords, themes and the search index stay consistent.
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { DocumentInput } from "./validation";
import { parseDateOnly } from "./validation";
import { slugify } from "./text";

type Tx = Prisma.TransactionClient;

// A save touches several tables; allow for database round-trip latency.
const TX_OPTIONS = { maxWait: 10_000, timeout: 30_000 };

export async function uniqueDocumentSlug(tx: Tx, title: string, year: number | null, excludeId?: string): Promise<string> {
  const base = slugify(`${title}${year ? ` ${year}` : ""}`, 90) || "document";
  let slug = base;
  for (let i = 2; i < 500; i++) {
    const clash = await tx.hpDocument.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!clash) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Finds a publisher by name/acronym (case-insensitive) or creates it. */
export async function findOrCreatePublisher(tx: Tx, name: string, countryId?: string | null): Promise<string> {
  const clean = name.trim().replace(/\s+/g, " ");
  const existing = await tx.hpPublisher.findFirst({
    where: { OR: [{ name: { equals: clean, mode: "insensitive" } }, { acronym: { equals: clean, mode: "insensitive" } }] },
    select: { id: true },
  });
  if (existing) return existing.id;
  let slug = slugify(clean, 80) || "publisher";
  for (let i = 2; await tx.hpPublisher.findUnique({ where: { slug }, select: { id: true } }); i++) {
    slug = `${slugify(clean, 75)}-${i}`;
  }
  const created = await tx.hpPublisher.create({ data: { name: clean, slug, countryId: countryId ?? null } });
  return created.id;
}

async function keywordIds(tx: Tx, keywords: string[]): Promise<string[]> {
  if (!keywords.length) return [];
  await tx.hpKeyword.createMany({ data: keywords.map((name) => ({ name })), skipDuplicates: true });
  const rows = await tx.hpKeyword.findMany({ where: { name: { in: keywords } }, select: { id: true } });
  return rows.map((r) => r.id);
}

export async function refreshSearchIndex(tx: Tx | typeof prisma, documentId: string): Promise<void> {
  await tx.$executeRaw`SELECT hp_document_refresh_search(${documentId})`;
}

export interface FileFields {
  storageProvider: string;
  storagePath: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

function scalarData(input: DocumentInput) {
  return {
    title: input.title,
    countryId: input.countryId,
    documentTypeId: input.documentTypeId,
    primaryThemeId: input.primaryThemeId,
    authors: input.authors,
    publicationYear: input.publicationYear,
    publicationDate: parseDateOnly(input.publicationDate),
    startYear: input.startYear,
    endYear: input.endYear,
    description: input.description,
    abstract: input.abstract,
    language: input.language,
    version: input.version,
    edition: input.edition,
    sourceUrl: input.sourceUrl,
    citationText: input.citationText,
    notes: input.notes,
    accessType: input.accessType,
    permissionStatus: input.permissionStatus,
    rightsHolder: input.rightsHolder,
    rightsStatement: input.rightsStatement,
    verificationStatus: input.verificationStatus,
    verificationNotes: input.verificationNotes,
    isFeatured: input.isFeatured,
  };
}

/** Validates that referenced taxonomy rows exist (ids come from the client). */
async function assertReferences(tx: Tx, input: DocumentInput): Promise<void> {
  const [country, type, themes, publisher] = await Promise.all([
    tx.hpCountry.count({ where: { id: input.countryId } }),
    tx.hpDocumentType.count({ where: { id: input.documentTypeId } }),
    input.themeIds.length ? tx.hpTheme.count({ where: { id: { in: input.themeIds } } }) : Promise.resolve(0),
    input.publisherId ? tx.hpPublisher.count({ where: { id: input.publisherId } }) : Promise.resolve(1),
  ]);
  if (!country) throw new Error("The selected country no longer exists.");
  if (!type) throw new Error("The selected document type no longer exists.");
  if (themes !== input.themeIds.length) throw new Error("One of the selected themes no longer exists.");
  if (!publisher) throw new Error("The selected publisher no longer exists.");
}

export async function createDocument(
  input: DocumentInput,
  opts: { createdById: string | null; file?: FileFields | null; status?: "DRAFT" | "PENDING_REVIEW"; isSynthetic?: boolean },
): Promise<{ id: string; slug: string }> {
  return prisma.$transaction(async (tx) => {
    await assertReferences(tx, input);
    const publisherId = input.publisherId ?? (await findOrCreatePublisher(tx, input.newPublisherName!, input.countryId));
    const slug = await uniqueDocumentSlug(tx, input.title, input.publicationYear);
    const kw = await keywordIds(tx, input.keywords);
    const doc = await tx.hpDocument.create({
      data: {
        ...scalarData(input),
        slug,
        publisherId,
        status: opts.status ?? "DRAFT",
        isSynthetic: opts.isSynthetic ?? false,
        createdById: opts.createdById,
        ...(opts.file ?? {}),
        themes: { create: input.themeIds.map((themeId) => ({ themeId })) },
        keywords: { create: kw.map((keywordId) => ({ keywordId })) },
      },
      select: { id: true, slug: true },
    });
    await refreshSearchIndex(tx, doc.id);
    return doc;
  }, TX_OPTIONS);
}

export async function updateDocument(
  id: string,
  input: DocumentInput,
  opts: { replacedById: string | null; newFile?: FileFields | null; removeFile?: boolean; versionNote?: string | null },
): Promise<{ id: string; slug: string; previousFile: FileFields | null }> {
  return prisma.$transaction(async (tx) => {
    await assertReferences(tx, input);
    const existing = await tx.hpDocument.findUniqueOrThrow({ where: { id } });
    const publisherId = input.publisherId ?? (await findOrCreatePublisher(tx, input.newPublisherName!, input.countryId));
    const kw = await keywordIds(tx, input.keywords);

    let previousFile: FileFields | null = null;
    let fileData: Partial<FileFields> | Record<string, null> = {};
    if ((opts.newFile || opts.removeFile) && existing.storagePath && existing.storageProvider) {
      previousFile = {
        storageProvider: existing.storageProvider,
        storagePath: existing.storagePath,
        fileName: existing.fileName ?? "file",
        fileType: existing.fileType ?? "application/octet-stream",
        fileSize: existing.fileSize ?? 0,
      };
      // Preserve the old file as a version instead of deleting it.
      await tx.hpDocumentVersion.create({
        data: {
          documentId: id,
          versionLabel: existing.version,
          ...previousFile,
          note: opts.versionNote ?? null,
          replacedById: opts.replacedById,
        },
      });
    }
    if (opts.newFile) fileData = opts.newFile;
    else if (opts.removeFile) fileData = { storageProvider: null, storagePath: null, fileName: null, fileType: null, fileSize: null };

    await tx.hpDocumentTheme.deleteMany({ where: { documentId: id } });
    await tx.hpDocumentKeyword.deleteMany({ where: { documentId: id } });
    const doc = await tx.hpDocument.update({
      where: { id },
      data: {
        ...scalarData(input),
        publisherId,
        ...fileData,
        themes: { create: input.themeIds.map((themeId) => ({ themeId })) },
        keywords: { create: kw.map((keywordId) => ({ keywordId })) },
      },
      select: { id: true, slug: true },
    });
    await refreshSearchIndex(tx, id);
    return { ...doc, previousFile };
  }, TX_OPTIONS);
}

/** Snapshot used for audit "before/after" values (no internal storage paths). */
export async function auditSnapshot(id: string) {
  const d = await prisma.hpDocument.findUnique({
    where: { id },
    include: { themes: { select: { themeId: true } }, keywords: { include: { keyword: true } } },
  });
  if (!d) return null;
  const { storagePath: _p, ...rest } = d;
  return {
    ...rest,
    themes: d.themes.map((t) => t.themeId),
    keywords: d.keywords.map((k) => k.keyword.name),
  };
}
