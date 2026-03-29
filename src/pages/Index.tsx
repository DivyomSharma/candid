import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ChatDemo from "@/components/ChatDemo";
import UnlockSection from "@/components/UnlockSection";
import MatchReveal from "@/components/MatchReveal";
import AIChatPreview from "@/components/AIChatPreview";
import PrivacySection from "@/components/PrivacySection";
import EmotionalSection from "@/components/EmotionalSection";
import WaitlistSection from "@/components/WaitlistSection";
import DoodleArrow from "@/components/DoodleArrow";

export default function Index() {
  return (
    <div className="min-h-screen gradient-bg grain">
      {/* Decorative accent arrows */}
      <div className="fixed top-1/4 left-4 md:left-10 z-0 hidden lg:block pointer-events-none">
        <DoodleArrow direction="down" size="sm" animated />
      </div>
      <div className="fixed bottom-1/3 right-4 md:right-10 z-0 hidden lg:block pointer-events-none">
        <DoodleArrow direction="up" size="sm" animated />
      </div>

      <Navbar />
      <HeroSection />
      <ChatDemo />
      <UnlockSection />
      <MatchReveal />
      <AIChatPreview />
      <PrivacySection />
      <EmotionalSection />
      <WaitlistSection />

      <footer className="py-10 text-center text-xs text-foreground-secondary/40 font-light">
        © 2026 Candor. A quieter way to connect.
      </footer>
    </div>
  );
}
