import { OnboardingWizard, OnboardingData } from "@/components/candid/onboarding/OnboardingWizard";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SyncAndRedirect } from "./SyncAndRedirect";

export const metadata = {
  title: "Welcome to Candid",
};

export default async function OnboardingPage(props: { searchParams: Promise<{ edit?: string }> }) {
  const searchParams = await props.searchParams;
  const isEditing = searchParams.edit === "true";

  const { userId: clerkId } = await auth();

  let initialData: OnboardingData | undefined = undefined;

  if (clerkId) {
    const supabase = getSupabaseAdmin();
    const { data: userRow } = await supabase
      .from("candid_users")
      .select("id")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (userRow) {
      const { data: profile } = await supabase
        .from("candid_profiles")
        .select("*")
        .eq("user_id", userRow.id)
        .maybeSingle();

      if (profile) {
        if (profile.onboarding_completed && !isEditing) {
          // User is already onboarded in the DB but lacks the local Edge cookie!
          // Sync the cookie silently and route them to /candid/home
          return <SyncAndRedirect />;
        }

        initialData = {
          name: profile.first_name || "",
          username: profile.username || "",
          birthday: profile.birthday || "",
          city: profile.city || "",
          gender: profile.gender || "",
          lookingFor: profile.looking_for || [],
          identityChoices: profile.identity_choices || {},
          coverUrl: profile.cover_url || "",
        };
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
        <OnboardingWizard initialData={initialData} />
      </div>
    </main>
  );
}
