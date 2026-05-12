import type { MetadataRoute } from "next";
import { siteConfig, siteUrl } from "@/lib/site";

const lastModified = new Date("2026-05-12T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl(siteConfig.landingPath),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
