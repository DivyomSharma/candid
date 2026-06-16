export const siteConfig = {
  name: "Candid",
  url: "https://www.candidai.xyz",
  landingPath: "/candid",
  description:
    "Candid is a social app built around continuity, chemistry, and honest conversation before connection.",
  socialDescription:
    "No swipes. Just honest conversations. Built for continuity, chemistry, and being understood before you're seen.",
  ogImage: "/og-candid.png",
  keywords: [
    "Candid",
    "candidai",
    "social app",
    "honest conversations",
    "dating app",
    "alignment",
    "relationships",
  ],
} as const;

export const siteUrl = (path = "") => new URL(path, siteConfig.url).toString();
