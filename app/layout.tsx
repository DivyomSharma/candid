import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "@/index.css";
import { Providers } from "@/components/candor/Providers";

export const metadata: Metadata = {
  title: "Candor",
  description: "A quieter way to connect.",
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
