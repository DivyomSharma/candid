import Link from "next/link";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import InteractivePreview from "@/components/InteractivePreview";
import MatchReveal from "@/components/MatchReveal";
import UnderstandingSection from "@/components/UnderstandingSection";
import ChemistrySection from "@/components/ChemistrySection";
import PrivacySection from "@/components/PrivacySection";
import ContinuityTrialSection from "@/components/ContinuityTrialSection";
import SubscriptionSection from "@/components/SubscriptionSection";
import WaitlistSection from "@/components/WaitlistSection";

export default function Index() {
  return (
    <div className="landing-page min-h-screen">
      <Navbar />
      <HeroSection />

      <InteractivePreview />
      <UnderstandingSection />
      <ChemistrySection />
      <MatchReveal />
      <ContinuityTrialSection />
      <SubscriptionSection />
      <PrivacySection />
      <WaitlistSection />

      <footer className="space-y-4 py-10 text-center text-xs text-foreground-secondary/40 font-light">
        <div>© 2026 Candor. A quieter way to connect.</div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-[0.16em] text-foreground-secondary/55">
          <Link href="/about" className="transition hover:text-foreground">
            about
          </Link>
          <Link href="/privacy" className="transition hover:text-foreground">
            privacy
          </Link>
          <Link href="/terms" className="transition hover:text-foreground">
            terms
          </Link>
          <Link href="/safety" className="transition hover:text-foreground">
            safety
          </Link>
          <Link href="/community-guidelines" className="transition hover:text-foreground">
            community
          </Link>
          <Link href="/data-memory" className="transition hover:text-foreground">
            data & memory
          </Link>
          <Link href="/memory-controls" className="transition hover:text-foreground">
            memory controls
          </Link>
          <Link href="/support" className="transition hover:text-foreground">
            support
          </Link>
        </div>
      </footer>
    </div>
  );
}
