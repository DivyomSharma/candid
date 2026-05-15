"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { ProfileSurface } from "@/components/candor/ProfileSurface";
import { useAuth } from "@/contexts/AuthContext";
import { buildCandorProfilePresentation } from "@/lib/candor/profile";
import type { CandorMemory } from "@/lib/candor/types";

type TraitsResponse = {
  memory: CandorMemory;
  identity?: {
    username: string | null;
    handle: string | null;
  };
};

export function CandorProfile() {
  const { isLoaded, isSignedIn, signOut, user } = useAuth();
  const router = useRouter();
  const [memory, setMemory] = useState<CandorMemory | null>(null);
  const [identity, setIdentity] = useState<{ username: string | null; handle: string | null } | null>(null);
  const [hasLoadedMemory, setHasLoadedMemory] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    setHasLoadedMemory(false);

    fetch("/api/candor/me/traits")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: TraitsResponse | null) => {
        setMemory(data?.memory ?? null);
        setIdentity(data?.identity ?? null);
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
      }),
    [identity?.handle, identity?.username, memory, user?.email],
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
    <ProfileSurface
      profile={profile}
      heading="your candor profile"
      subheading="identity-rich, soft-edged, and shareable without giving too much away."
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
  );
}
