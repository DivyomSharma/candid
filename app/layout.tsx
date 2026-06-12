import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "lenis/dist/lenis.css";
import "@/index.css";
import { Providers } from "@/components/candor/Providers";
import { siteConfig, siteUrl } from "@/lib/site";
import { OfflineBanner } from "@/components/candor/OfflineBanner";
import { ViewTransitions } from "next-view-transitions";

export const viewport: Viewport = {
  themeColor: "#171311",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: siteUrl(siteConfig.landingPath),
  },
  category: "social networking",
  classification: "social networking",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    url: siteUrl(siteConfig.landingPath),
    title: siteConfig.name,
    description: siteConfig.socialDescription,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "Candor - No swipes. Just honest conversations.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.socialDescription,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="radial-lighting">
          <ViewTransitions>
            <div className="film-grain" />
          <Providers>
            <OfflineBanner />
            {children}
          </Providers>
          </ViewTransitions>
        </body>
      </html>
    </ClerkProvider>
  );
}
