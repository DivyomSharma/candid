export const siteConfig = {
  name: "Candor",
  url: "https://www.candorai.xyz",
  landingPath: "/candor",
  description:
    "Candor is a social app for honest conversations, alignment, and quieter connection without swipes.",
  socialDescription:
    "No swipes. Just honest conversations. A space where you can be understood before you're seen.",
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
