/**
 * Read-only data for the public HP-Hub pages. Every figure shown publicly comes
 * from here, i.e. from live database queries — nothing is hard-coded.
 */
import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { publicDocumentWhere, showSyntheticRecords } from "./visibility";

export const listInclude = {
  country: { select: { name: true, slug: true } },
  documentType: { select: { name: true, slug: true } },
  publisher: { select: { name: true, slug: true, acronym: true } },
  themes: { select: { theme: { select: { name: true, slug: true } } }, take: 4 },
} satisfies Prisma.HpDocumentInclude;

export type ListDocument = Prisma.HpDocumentGetPayload<{ include: typeof listInclude }>;

export const getCountryBySlug = cache(async (slug: string) =>
  prisma.hpCountry.findUnique({ where: { slug } }),
);

export const getActiveCountries = cache(async () =>
  prisma.hpCountry.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
);

export async function getRecentDocuments(take = 6, countryId?: string): Promise<ListDocument[]> {
  return prisma.hpDocument.findMany({
    where: publicDocumentWhere(countryId ? { countryId } : {}),
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take,
    include: listInclude,
  });
}

export async function getFeaturedDocuments(take = 4, countryId?: string): Promise<ListDocument[]> {
  return prisma.hpDocument.findMany({
    where: publicDocumentWhere({ isFeatured: true, ...(countryId ? { countryId } : {}) }),
    orderBy: [{ publicationYear: "desc" }, { createdAt: "desc" }],
    take,
    include: listInclude,
  });
}

export async function getMostDownloaded(take = 5, countryId?: string): Promise<ListDocument[]> {
  return prisma.hpDocument.findMany({
    where: publicDocumentWhere({ downloadCount: { gt: 0 }, ...(countryId ? { countryId } : {}) }),
    orderBy: [{ downloadCount: "desc" }, { title: "asc" }],
    take,
    include: listInclude,
  });
}

export async function countPublicDocuments(countryId?: string): Promise<number> {
  return prisma.hpDocument.count({ where: publicDocumentWhere(countryId ? { countryId } : {}) });
}

function syntheticSql(): Prisma.Sql {
  return showSyntheticRecords() ? Prisma.empty : Prisma.sql`AND d."isSynthetic" = false`;
}

function countrySql(countryId?: string): Prisma.Sql {
  return countryId ? Prisma.sql`AND d."countryId" = ${countryId}` : Prisma.empty;
}

export interface CountedItem {
  id: string;
  slug: string;
  name: string;
  count: number;
}

/** All active themes with their published-document counts (zero included). */
export async function getThemesWithCounts(countryId?: string): Promise<CountedItem[]> {
  const rows = await prisma.$queryRaw<{ id: string; slug: string; name: string; count: bigint }[]>`
    SELECT t."id", t."slug", t."name", count(d."id") AS count
    FROM "HpTheme" t
    LEFT JOIN "HpDocumentTheme" dt ON dt."themeId" = t."id"
    LEFT JOIN "HpDocument" d ON d."id" = dt."documentId" AND d."status" = 'PUBLISHED' ${syntheticSql()} ${countrySql(countryId)}
    WHERE t."isActive" = true
    GROUP BY t."id", t."slug", t."name", t."sortOrder"
    ORDER BY t."sortOrder", t."name"`;
  return rows.map((r) => ({ ...r, count: Number(r.count) }));
}

export async function getTypesWithCounts(countryId?: string): Promise<CountedItem[]> {
  const rows = await prisma.$queryRaw<{ id: string; slug: string; name: string; count: bigint }[]>`
    SELECT ty."id", ty."slug", ty."name", count(d."id") AS count
    FROM "HpDocumentType" ty
    LEFT JOIN "HpDocument" d ON d."documentTypeId" = ty."id" AND d."status" = 'PUBLISHED' ${syntheticSql()} ${countrySql(countryId)}
    GROUP BY ty."id", ty."slug", ty."name", ty."sortOrder"
    ORDER BY ty."sortOrder", ty."name"`;
  return rows.map((r) => ({ ...r, count: Number(r.count) }));
}

/** Publishers that have at least one published document. */
export async function getPublishersWithCounts(countryId?: string, take = 50): Promise<(CountedItem & { acronym: string | null })[]> {
  const rows = await prisma.$queryRaw<{ id: string; slug: string; name: string; acronym: string | null; count: bigint }[]>`
    SELECT p."id", p."slug", p."name", p."acronym", count(d."id") AS count
    FROM "HpPublisher" p
    JOIN "HpDocument" d ON d."publisherId" = p."id" AND d."status" = 'PUBLISHED' ${syntheticSql()} ${countrySql(countryId)}
    GROUP BY p."id", p."slug", p."name", p."acronym"
    ORDER BY count(d."id") DESC, p."name"
    LIMIT ${take}`;
  return rows.map((r) => ({ ...r, count: Number(r.count) }));
}

export async function getYearsWithCounts(countryId?: string): Promise<{ year: number; count: number }[]> {
  const rows = await prisma.$queryRaw<{ year: number; count: bigint }[]>`
    SELECT d."publicationYear" AS year, count(*) AS count
    FROM "HpDocument" d
    WHERE d."status" = 'PUBLISHED' AND d."publicationYear" IS NOT NULL ${syntheticSql()} ${countrySql(countryId)}
    GROUP BY d."publicationYear"
    ORDER BY d."publicationYear" DESC`;
  return rows.map((r) => ({ year: Number(r.year), count: Number(r.count) }));
}

/** Languages of published documents, for the filter panel. */
export async function getLanguagesWithCounts(): Promise<{ language: string; count: number }[]> {
  const rows = await prisma.$queryRaw<{ language: string; count: bigint }[]>`
    SELECT d."language" AS language, count(*) AS count
    FROM "HpDocument" d
    WHERE d."status" = 'PUBLISHED' ${syntheticSql()}
    GROUP BY d."language"
    ORDER BY count(*) DESC`;
  return rows.map((r) => ({ language: r.language, count: Number(r.count) }));
}

/**
 * Everything the "Find documents" panel needs, loaded once per request and
 * shared by the layout (the panel appears on every public HP-Hub page).
 */
export const getFilterPanelData = cache(async () => {
  const [countries, themes, types, years, languages] = await Promise.all([
    getCountriesWithCounts(),
    getThemesWithCounts(),
    getTypesWithCounts(),
    getYearsWithCounts(),
    getLanguagesWithCounts(),
  ]);
  return { countries, themes, types, years, languages };
});

/** Published counts per active country, for the hub's "Browse by country". */
export async function getCountriesWithCounts(): Promise<(CountedItem & { isoCode: string; intro: string | null })[]> {
  const rows = await prisma.$queryRaw<{ id: string; slug: string; name: string; isoCode: string; intro: string | null; count: bigint }[]>`
    SELECT c."id", c."slug", c."name", c."isoCode", c."intro", count(d."id") AS count
    FROM "HpCountry" c
    LEFT JOIN "HpDocument" d ON d."countryId" = c."id" AND d."status" = 'PUBLISHED' ${syntheticSql()}
    WHERE c."isActive" = true
    GROUP BY c."id", c."slug", c."name", c."isoCode", c."intro", c."sortOrder"
    ORDER BY c."sortOrder", c."name"`;
  return rows.map((r) => ({ ...r, count: Number(r.count) }));
}

/** Curated collections = themes with the most featured documents (data-driven). */
export async function getFeaturedCollections(take = 4): Promise<(CountedItem & { description: string | null })[]> {
  const rows = await prisma.$queryRaw<{ id: string; slug: string; name: string; description: string | null; count: bigint }[]>`
    SELECT t."id", t."slug", t."name", t."description", count(d."id") AS count
    FROM "HpTheme" t
    JOIN "HpDocumentTheme" dt ON dt."themeId" = t."id"
    JOIN "HpDocument" d ON d."id" = dt."documentId" AND d."status" = 'PUBLISHED' AND d."isFeatured" = true ${syntheticSql()}
    WHERE t."isActive" = true
    GROUP BY t."id", t."slug", t."name", t."description", t."sortOrder"
    ORDER BY count(d."id") DESC, t."sortOrder"
    LIMIT ${take}`;
  return rows.map((r) => ({ ...r, count: Number(r.count) }));
}

export const documentPageInclude = {
  country: true,
  documentType: true,
  publisher: true,
  primaryTheme: { select: { name: true, slug: true } },
  themes: { include: { theme: { select: { name: true, slug: true } } } },
  keywords: { include: { keyword: { select: { name: true } } } },
  supersededBy: { select: { title: true, slug: true, status: true, isSynthetic: true } },
  supersedes: { select: { title: true, slug: true, status: true, isSynthetic: true } },
  related: { include: { related: { include: listInclude } } },
} satisfies Prisma.HpDocumentInclude;

export type DocumentPageData = Prisma.HpDocumentGetPayload<{ include: typeof documentPageInclude }>;

export const getPublicDocument = cache(async (slug: string) =>
  prisma.hpDocument.findFirst({ where: publicDocumentWhere({ slug }), include: documentPageInclude }),
);

/**
 * Related documents: curated links first, then documents sharing the most
 * themes in the same country.
 */
export async function getRelatedDocuments(doc: DocumentPageData, take = 4): Promise<ListDocument[]> {
  const curated = doc.related
    .map((r) => r.related)
    .filter((r) => r.status === "PUBLISHED" && (!r.isSynthetic || showSyntheticRecords()));
  if (curated.length >= take) return curated.slice(0, take);

  const themeIds = doc.themes.map((t) => t.themeId);
  const exclude = [doc.id, ...curated.map((c) => c.id)];
  const similar = themeIds.length
    ? await prisma.hpDocument.findMany({
        where: publicDocumentWhere({
          id: { notIn: exclude },
          countryId: doc.countryId,
          themes: { some: { themeId: { in: themeIds } } },
        }),
        orderBy: [{ publicationYear: "desc" }],
        take: take - curated.length,
        include: listInclude,
      })
    : [];
  return [...curated, ...similar];
}
