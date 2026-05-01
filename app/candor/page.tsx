import type { Metadata } from "next";
import CandorLanding from "@/components/candor/CandorLanding";

export const metadata: Metadata = {
  title: "Candor",
  description: "No swipes. Just honest conversations. A space where you can be understood before you're seen.",
  alternates: {
    canonical: "https://www.candorai.xyz/candor",
  },
  openGraph: {
    url: "https://www.candorai.xyz/candor",
    title: "Candor",
    description: "No swipes. Just honest conversations. A space where you can be understood before you're seen.",
  },
  twitter: {
    title: "Candor",
    description: "No swipes. Just honest conversations. A space where you can be understood before you're seen.",
  },
};

export default function CandorPage() {
  return <CandorLanding />;
}
