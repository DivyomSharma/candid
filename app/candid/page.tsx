import type { Metadata } from "next";
import CandidLanding from "@/components/candid/CandidLanding";
import { siteConfig, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: siteConfig.name,
  },
  description: siteConfig.socialDescription,
  alternates: {
    canonical: siteUrl(siteConfig.landingPath),
  },
  openGraph: {
    url: siteUrl(siteConfig.landingPath),
    title: siteConfig.name,
    description: siteConfig.socialDescription,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Candid - No swipes. Just honest conversations.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.socialDescription,
    images: [siteConfig.ogImage],
  },
};

export default function CandidPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "SocialNetworkingApplication",
    operatingSystem: "Web",
    url: siteUrl(siteConfig.landingPath),
    description: siteConfig.description,
    image: siteUrl(siteConfig.ogImage),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CandidLanding />
    </>
  );
}
