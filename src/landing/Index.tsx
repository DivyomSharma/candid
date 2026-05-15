import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import InteractivePreview from "@/components/InteractivePreview";
import ChatDemo from "@/components/ChatDemo";
import UnlockSection from "@/components/UnlockSection";
import MatchReveal from "@/components/MatchReveal";
import AIChatPreview from "@/components/AIChatPreview";
import CandorPhilosophySection from "@/components/CandorPhilosophySection";
import PrivacySection from "@/components/PrivacySection";
import EmotionalSection from "@/components/EmotionalSection";
import WaitlistSection from "@/components/WaitlistSection";

export default function Index() {
  return (
    <div className="landing-page min-h-screen">
      <Navbar />
      <HeroSection />
      <InteractivePreview />
      <ChatDemo />
      <UnlockSection />
      <MatchReveal />
      <AIChatPreview />
      <CandorPhilosophySection />
      <PrivacySection />
      <EmotionalSection />
      <WaitlistSection />

      <footer className="py-10 text-center text-xs text-foreground-secondary/40 font-light">
        © 2026 Candor. A quieter way to connect.
      </footer>
    </div>
  );
}
