import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private systems and machine endpoints. HP-Hub search result pages
        // also carry noindex; documents are reached through the sitemap.
        disallow: ["/api/", "/astelfin_26", "/hp-hub/admin", "/hp-hub/search", "/hp-hub/documents/*/download", "/hp-hub/documents/*/source"],
      },
    ],
    sitemap: "https://www.astellic.com/sitemap.xml",
  };
}
