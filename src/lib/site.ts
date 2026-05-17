export const siteConfig = {
  name: "Candor",
  url: "https://www.candorai.xyz",
  landingPath: "/candor",
  description:
    "Candor is a social app built around continuity, chemistry, and honest conversation before connection.",
  socialDescription:
    "No swipes. Just honest conversations. Built for continuity, chemistry, and being understood before you're seen.",
  ogImage: "/og-candor.png",
  keywords: [
    "Candor",
    "candorai",
    "social app",
    "honest conversations",
    "dating app",
    "alignment",
    "relationships",
  ],
} as const;

export const siteUrl = (path = "") => new URL(path, siteConfig.url).toString();
