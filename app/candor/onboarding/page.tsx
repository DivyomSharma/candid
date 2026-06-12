import { OnboardingWizard } from "@/components/candor/onboarding/OnboardingWizard";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { SyncAndRedirect } from "./SyncAndRedirect";

export const metadata = {
  title: "Welcome to Candor",
};

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();

  if (clerkId) {
    const supabase = await createSupabaseServer();
    const { data: userRow } = await supabase
      .from("candor_users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (userRow) {
      const { data: profile } = await supabase
        .from("candor_profiles")
        .select("onboarding_completed")
        .eq("user_id", userRow.id)
        .single();

      if (profile?.onboarding_completed) {
        // User is already onboarded in the DB but lacks the local Edge cookie!
        // Sync the cookie silently and route them to /candor/home
        return <SyncAndRedirect />;
      }
    }
  }

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
