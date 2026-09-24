import { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { siteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...projects.map((p) => ({ url: `${siteUrl}/projects/${p.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.9 })),
    { url: `${siteUrl}/playground`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];
}
