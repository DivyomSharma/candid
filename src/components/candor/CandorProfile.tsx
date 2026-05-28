"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { ProfileSurface } from "@/components/candor/ProfileSurface";
import { PersonalProfileEditor } from "@/components/candor/PersonalProfileEditor";
import { useAuth } from "@/contexts/AuthContext";
import { buildCandorProfilePresentation } from "@/lib/candor/profile";
import type { CandorAccessState } from "@/lib/candor/access";
import type { CandorPersonalProfile } from "@/lib/candor/personal-profile";
import type { CandorMemory } from "@/lib/candor/types";

type TraitsResponse = {
  memory: CandorMemory;
  identity?: {
    username: string | null;
    handle: string | null;
  };
  personalProfile?: CandorPersonalProfile;
  access?: CandorAccessState;
};

export function CandorProfile() {
  const { isLoaded, isSignedIn, signOut, user } = useAuth();
  const router = useRouter();
  const [memory, setMemory] = useState<CandorMemory | null>(null);
  const [identity, setIdentity] = useState<{ username: string | null; handle: string | null } | null>(null);
  const [personalProfile, setPersonalProfile] = useState<CandorPersonalProfile | null>(null);
  const [access, setAccess] = useState<CandorAccessState | null>(null);
  const [hasLoadedMemory, setHasLoadedMemory] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    setHasLoadedMemory(false);

    fetch("/api/candor/me/traits")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: TraitsResponse | null) => {
        setMemory(data?.memory ?? null);
        setIdentity(data?.identity ?? null);
        setPersonalProfile(data?.personalProfile ?? null);
        setAccess(data?.access ?? null);
      })
      .finally(() => setHasLoadedMemory(true));
  }, [isSignedIn]);

  const profile = useMemo(
    () =>
      buildCandorProfilePresentation({
        memory,
        email: user?.email ?? null,
        username: identity?.username ?? undefined,
        handle: identity?.handle ?? undefined,
        personalProfile,
      }),
    [identity?.handle, identity?.username, memory, personalProfile, user?.email],
  );

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">what candor notices about you</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">it needs time with you first.</p>
          <Button
            onClick={() => router.push(`/candor/login?next=${encodeURIComponent("/candor/you")}`)}
            className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90"
          >
            sign in
          </Button>
        </div>
      </main>
    );
  }

  if (!hasLoadedMemory) {
    return (
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">your candor profile</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">reading what candor knows so far...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="gradient-bg grain relative min-h-screen overflow-hidden pb-28">
      <ProfileSurface
        profile={profile}
        heading="you, in context"
        subheading={access?.narrative ?? "small signals up front. the rest should arrive naturally, through time and conversation."}
        onEditClick={() => setEditorOpen(true)}
        actionSlot={
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await signOut();
              router.push("/candor");
            }}
            className="rounded-full border-border/50 bg-background/50 px-5 font-light backdrop-blur-md hover:bg-accent/10"
          >
            sign out
          </Button>
        }
      />

      <Sheet open={editorOpen} onOpenChange={setEditorOpen}>
        <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] rounded-t-[2rem] border-border/40 surface backdrop-blur-xl p-0">
          <div className="h-full overflow-y-auto px-6 py-8">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-2xl font-light">edit your details</SheetTitle>
            </SheetHeader>
            <PersonalProfileEditor
              profile={personalProfile}
              onSaved={(nextProfile) => {
                setPersonalProfile(nextProfile);
                setEditorOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
