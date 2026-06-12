"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { CandorLoading } from "@/components/candor/CandorLoading";
import { ProfileSurface } from "@/components/candor/ProfileSurface";
import { useAuth } from "@/contexts/AuthContext";
import { buildCandorProfilePresentation } from "@/lib/candor/profile";
import { LogOut } from "lucide-react";
import type { CandorAccessState } from "@/lib/candor/access";
import type { CandorPersonalProfile } from "@/lib/candor/personal-profile";
import type { CandorMemory, CandorProfileV4 } from "@/lib/candor/types";

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
      <main className="gradient-bg grain relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
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
    return <CandorLoading />;
  }

  return (
    <div className="gradient-bg grain relative min-h-dvh overflow-x-hidden pb-40">
      <ProfileSurface
        profile={profile}
        heading="you, in context"
        subheading={access?.narrative ?? (memory?.turnCount === 0 ? "waiting for your first interaction" : "not enough interactions yet.")}
        onEditClick={() => router.push("/candor/onboarding?edit=true")}
        actionSlot={
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await signOut();
              router.push("/candor");
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full border-border/50 bg-background/50 p-0 backdrop-blur-md transition-all hover:scale-105 hover:bg-accent/10"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        }
      />

    </div>
  );
}
