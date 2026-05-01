import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.astellic.com";

  const routes = [
    { url: "/", priority: 1.0, changeFrequency: "monthly" },
    { url: "/about", priority: 0.9, changeFrequency: "monthly" },
    { url: "/approach", priority: 0.8, changeFrequency: "monthly" },
    { url: "/thematic-areas", priority: 0.8, changeFrequency: "monthly" },
    { url: "/our-projects", priority: 0.8, changeFrequency: "monthly" },
    { url: "/resources", priority: 0.8, changeFrequency: "weekly" },
    { url: "/why-astellic", priority: 0.8, changeFrequency: "monthly" },
    { url: "/work-with-us", priority: 0.9, changeFrequency: "weekly" },
    { url: "/join-our-roster", priority: 0.8, changeFrequency: "monthly" },
    { url: "/propose-partnership", priority: 0.8, changeFrequency: "monthly" },
    { url: "/contact", priority: 0.7, changeFrequency: "yearly" },
  ] as const;

  return routes.map((route) => ({
    url: `${base}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
