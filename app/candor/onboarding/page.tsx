import { OnboardingWizard } from "@/components/candor/onboarding/OnboardingWizard";

export const metadata = {
  title: "Welcome to Candor",
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none radial-lighting" />
      <div className="absolute inset-0 pointer-events-none film-grain" />
      
      {/* 
        This is a conversational, full-screen onboarding.
        We do not render BottomNav or other app chrome here.
      */}
      <div className="relative z-10 h-screen w-full flex flex-col">
        <OnboardingWizard />
      </div>
    </main>
  );
}
