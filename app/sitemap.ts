import type { MetadataRoute } from "next";
import { siteConfig, siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl(siteConfig.landingPath),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
