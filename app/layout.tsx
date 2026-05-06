import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "@/index.css";
import { Providers } from "@/components/candor/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.candorai.xyz"),
  title: {
    default: "Candor",
    template: "%s | Candor",
  },
  description: "Candor is a social app for honest conversations, alignment, and quieter connection without swipes.",
  applicationName: "Candor",
  keywords: ["Candor", "candorai", "social app", "honest conversations", "dating app", "alignment", "relationships"],
  authors: [{ name: "Candor" }],
  creator: "Candor",
  publisher: "Candor",
  alternates: {
    canonical: "https://www.candorai.xyz/candor",
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
  openGraph: {
    type: "website",
    siteName: "Candor",
    url: "https://www.candorai.xyz",
    title: "Candor",
    description: "No swipes. Just honest conversations. A quieter way to connect.",
    images: [
      {
        url: "/og-candor.png",
        width: 1200,
        height: 630,
        alt: "Candor - No swipes. Just honest conversations.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Candor",
    description: "No swipes. Just honest conversations. A quieter way to connect.",
    images: ["/og-candor.png"],
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
