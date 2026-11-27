import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { hpHubIndexable, publicDocumentWhere } from "./visibility";

/**
 * HP-Hub entries for the site sitemap: hub pages, live countries, themes and
 * types, and every published (non-synthetic) document. Drafts, archived and
 * restricted-only internals are never listed. Empty until HP_HUB_INDEXING=true.
 * Never throws: a database problem must not break the main site's sitemap.
 */
export async function hpHubSitemap(base: string): Promise<MetadataRoute.Sitemap> {
  if (!hpHubIndexable()) return [];
  try {
    const [countries, themes, types, docs] = await Promise.all([
      prisma.hpCountry.findMany({ where: { isActive: true }, select: { slug: true } }),
      prisma.hpTheme.findMany({ where: { isActive: true }, select: { slug: true } }),
      prisma.hpDocumentType.findMany({ select: { slug: true } }),
      prisma.hpDocument.findMany({
        where: { ...publicDocumentWhere(), isSynthetic: false },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 45000,
      }),
    ]);
    const now = new Date();
    return [
      { url: `${base}/hp-hub`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
      { url: `${base}/hp-hub/themes`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
      { url: `${base}/hp-hub/types`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
      { url: `${base}/hp-hub/about`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
      { url: `${base}/hp-hub/submit`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
      ...countries.map((c) => ({ url: `${base}/hp-hub/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
      ...themes.map((t) => ({ url: `${base}/hp-hub/themes/${t.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
      ...types.map((t) => ({ url: `${base}/hp-hub/types/${t.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.5 })),
      ...docs.map((d) => ({ url: `${base}/hp-hub/documents/${d.slug}`, lastModified: d.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ];
  } catch (err) {
    console.error("[hp-hub/sitemap] skipped HP-Hub entries", err);
    return [];
  }
}
