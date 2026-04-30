import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "lenis/dist/lenis.css";
import "@/index.css";
import { Providers } from "@/components/candor/Providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.candorai.xyz"),
  title: {
    default: "Candor",
    template: "%s | Candor",
  },
  description: "No swipes. Just honest conversations. A quieter way to connect.",
  applicationName: "Candor",
  keywords: ["Candor", "social app", "honest conversations", "alignment", "relationships"],
  authors: [{ name: "Candor" }],
  creator: "Candor",
  publisher: "Candor",
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
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
