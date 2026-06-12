"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Lock, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { resonanceLabel } from "@/lib/candor/matching";
import { cn } from "@/lib/utils";

type AlignProfile = {
  id: string;
  score: number;
  profile: {
    username: string;
    handle: string;
    avatarInitials: string;
    avatarTone: string;
    line: string;
    title: string;
    about: string;
    values: string[];
    conversation: string[];
    storySignal: string;
    situation: {
      title: string;
      setup: string;
      response: string;
    };
  };
  myDmOn: boolean;
  theirDmOn: boolean;
  canText: boolean;
};

export function CandorAlignProfile({ id }: { id: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [align, setAlign] = useState<AlignProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    setIsLoading(true);
    fetch(`/api/candor/aligns/${id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: AlignProfile | null) => setAlign(payload))
      .finally(() => setIsLoading(false));
  }, [id, isSignedIn]);

  const toggleDm = async () => {
    if (!align) return;

    const response = await fetch("/api/candor/aligns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alignmentId: align.id, dmOn: !align.myDmOn }),
    });

    if (!response.ok) return;
    const status = (await response.json()) as Pick<AlignProfile, "myDmOn" | "theirDmOn" | "canText">;
    const next = { ...align, ...status };
    setAlign(next);
    if (next.canText) router.push(`/candor/aligns/${id}/chat`);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 mx-auto flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">profiles open after sign in</h1>
          <Button onClick={() => router.push(`/candor/login?next=${encodeURIComponent(`/candor/aligns/${id}`)}`)} className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90">
            sign in
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="gradient-bg grain relative min-h-dvh overflow-x-hidden px-6 pb-40 pt-16">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[680px] flex-col gap-7">
        <button type="button" onClick={() => router.push("/candor/aligns")} className="flex w-fit items-center gap-2 text-sm font-light text-foreground-secondary transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          aligns
        </button>

        {isLoading || !align ? (
          <Card className="glass-card shadow-2xl bg-card/45 backdrop-blur-3xl">
            <CardContent className="grid gap-4 p-5">
              <div className="h-24 rounded-2xl bg-foreground/10" />
              <div className="h-3 w-2/3 rounded-full bg-foreground/10" />
              <div className="h-3 w-1/2 rounded-full bg-foreground/10" />
            </CardContent>
          </Card>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <Card className={cn("glass-card overflow-hidden backdrop-blur-3xl shadow-2xl", profileAtmosphere(resonanceLabel(align.score)))}>
                <div className="h-32" style={{ background: align.profile.avatarTone }} />
                <CardContent className="flex flex-col gap-6 p-5">
                  <div className="-mt-16 flex items-end justify-between gap-4">
                    <Avatar className="h-24 w-24 border border-border/60 bg-background/70">
                      <AvatarFallback className="text-2xl font-light text-foreground" style={{ background: align.profile.avatarTone }}>
                        {align.profile.avatarInitials}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      onClick={() => (align.canText ? router.push(`/candor/aligns/${id}/chat`) : toggleDm())}
                      className="mb-1 rounded-full bg-accent px-5 text-primary-foreground hover:bg-accent/90"
                    >
                      {align.canText ? "open conversation" : align.theirDmOn ? "let it open" : align.myDmOn ? "door open" : "open the door"}
                    </Button>
                  </div>

                  <div>
                    <p className="text-xs font-light text-accent/75">{align.profile.handle}</p>
                    <h1 className="mt-2 text-4xl font-light tracking-tight">{align.profile.username}</h1>
                    <p className="mt-3 text-base font-light leading-7 text-foreground-secondary break-words">{align.profile.line}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-light text-foreground-secondary">
                    {align.canText ? <MessageCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {align.canText ? "there's a real ease forming here" : align.theirDmOn ? "they opened the door first" : "open the door when it feels natural"}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card className="glass-card shadow-2xl bg-card/45 backdrop-blur-3xl">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-base font-light tracking-wide">profile</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-5 p-5 pt-3">
                <div>
                  <h2 className="text-2xl font-light leading-8 break-words">{align.profile.title}</h2>
                  <p className="mt-3 text-sm font-light leading-6 text-foreground-secondary break-words">{align.profile.about}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {align.profile.values.map((value) => (
                    <span key={value} className="rounded-full border border-border/50 px-3 py-1 text-xs font-light text-foreground-secondary">
                      {value}
                    </span>
                  ))}
                </div>
                <div className="grid gap-2">
                  {align.profile.conversation.map((line) => (
                    <p key={line} className="text-sm font-light leading-6 text-foreground-secondary break-words">
                      {line}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-2xl bg-card/45 backdrop-blur-3xl">
              <CardContent className="grid gap-6 p-5 md:grid-cols-[1.5fr_1fr]">
                <div>
                  <p className="text-xs font-light uppercase tracking-[0.2em] text-foreground-secondary/70">keeps returning to</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {["late trains", "coffee", "indie films", "rainy cities"].map((item) => (
                      <span key={item} className="rounded-full border border-border/40 bg-background/25 px-3.5 py-1.5 text-sm font-light text-foreground-secondary">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-background/35 p-5 flex flex-col justify-center">
                  <p className="text-xs font-light uppercase tracking-[0.2em] text-foreground-secondary/70">shared shelf</p>
                  <div className="mt-4 space-y-3">
                     <div className="flex items-center gap-3">
                       <div className="h-4 w-4 rounded-full bg-accent/20 flex items-center justify-center"><span className="h-1.5 w-1.5 bg-accent rounded-full" /></div>
                       <span className="text-sm font-light text-foreground">Dune: Part Two</span>
                     </div>
                     <div className="flex items-center gap-3">
                       <div className="h-4 w-4 rounded-full bg-accent/20 flex items-center justify-center"><span className="h-1.5 w-1.5 bg-accent rounded-full" /></div>
                       <span className="text-sm font-light text-foreground">Blonde - Frank Ocean</span>
                     </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </section>
      <BottomNav />
    </main>
  );
}

function profileAtmosphere(resonance: ReturnType<typeof resonanceLabel>) {
  if (resonance === "candid") {
    return "border-accent/46 bg-[linear-gradient(135deg,hsl(var(--accent)/0.16),hsl(var(--card)/0.52)_46%,hsl(var(--glow)/0.08))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06),0_34px_100px_-42px_hsl(var(--accent)/0.6)]";
  }
  if (resonance === "magnetic") {
    return "border-accent/36 bg-[linear-gradient(135deg,hsl(var(--accent)/0.12),hsl(var(--card)/0.50)_48%,hsl(var(--background)/0.24))] shadow-[0_28px_86px_-40px_hsl(var(--accent)/0.48)]";
  }
  if (resonance === "natural flow") {
    return "border-accent/28 bg-[linear-gradient(135deg,hsl(var(--accent)/0.09),hsl(var(--card)/0.48))] shadow-[0_22px_72px_-40px_hsl(var(--accent)/0.34)]";
  }
  if (resonance === "familiar") {
    return "border-accent/20 bg-[linear-gradient(135deg,hsl(var(--accent)/0.045),hsl(var(--card)/0.42))] shadow-[0_18px_62px_-42px_hsl(var(--accent)/0.24)]";
  }
  return "border-border/42 bg-card/36 shadow-[0_16px_56px_-42px_hsl(var(--foreground)/0.22)]";
}
