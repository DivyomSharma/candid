"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, MessageCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/candor/BottomNav";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { useAuth } from "@/contexts/AuthContext";
import { resonanceLabel } from "@/lib/candor/matching";
import { cn } from "@/lib/utils";
import { StarArt } from "@/components/candor/art";

type Align = {
  id: string;
  score: number;
  language: string;
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
  };
  myDmOn: boolean;
  theirDmOn: boolean;
  canText: boolean;
};

type AlignsResponse = {
  ready: boolean;
  language: string;
  aligns: Align[];
};

export function CandorAligns() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AlignsResponse | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    setIsSearching(true);
    try {
      const response = await fetch("/api/candor/aligns");
      const payload = response.ok ? ((await response.json()) as AlignsResponse) : null;
      setData(payload);
    } finally {
      setIsSearching(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const toggleDm = async (align: Align) => {
    const response = await fetch("/api/candor/aligns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alignmentId: align.id, dmOn: !align.myDmOn }),
    });

    if (!response.ok) return;
    const status = (await response.json()) as Pick<Align, "myDmOn" | "theirDmOn" | "canText">;
    setData((current) =>
      current
        ? { ...current, aligns: current.aligns.map((item) => (item.id === align.id ? { ...item, ...status } : item)) }
        : current,
    );
  };

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">your aligns come later</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">candor needs to know you first.</p>
          <Button
            onClick={() => router.push(`/candor/login?next=${encodeURIComponent("/candor/aligns")}`)}
            className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90"
          >
            sign in
          </Button>
        </div>
      </main>
    );
  }

  const ready = data?.ready;

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-x-hidden px-6 pb-40 pt-20">
      <AmbientGlow />
      
      {/* Ambient Line Art Background */}
      <div className="fixed top-[15%] right-[-10%] pointer-events-none z-0">
        <StarArt state={1} width={800} height={800} className="opacity-[0.03]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-[1000px] flex flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">aligns</h1>
          <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-foreground-secondary">
            {isSearching ? "looking for a rhythm that would feel natural, not forced." : data?.language ?? "not enough interactions yet."}
          </p>
        </motion.div>

        {isSearching ? (
          <Card className="glass-card shadow-2xl bg-card/45 backdrop-blur-3xl">
            <CardContent className="flex flex-col gap-5 p-5">
              <div className="flex items-center gap-2 text-lg font-light leading-8 text-foreground-secondary">
                <span>searching for a real align</span>
                <motion.span aria-hidden animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}>
                  ...
                </motion.span>
              </div>
              <div className="grid gap-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-3 rounded-full bg-foreground/10" style={{ width: `${72 - item * 14}%` }} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {!isSearching && !ready ? (
          <Card className="glass-card shadow-2xl bg-card/45 backdrop-blur-3xl">
            <CardContent className="flex flex-col gap-5 p-5">
              <p className="text-lg font-light leading-8 text-foreground-secondary">
                not yet. a real align should come from understanding, not a quick guess.
              </p>
              <p className="text-sm font-light leading-6 text-foreground-secondary/80">
                keep talking. family, friends, work, fear, ambition, love. all of it quietly changes who opens well with you.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!isSearching && ready && data?.aligns.length === 0 ? (
          <Card className="glass-card shadow-2xl bg-card/45 backdrop-blur-3xl">
            <CardContent className="p-5 text-lg font-light leading-8 text-foreground-secondary">
              candor understands you enough. it is waiting for someone else with enough signal too.
            </CardContent>
          </Card>
        ) : null}

        {!isSearching && ready ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {data?.aligns.map((align, index) => {
              const resonance = resonanceLabel(align.score);
              const atmosphere = alignAtmosphere(resonance);
              return (
                <motion.div
                  key={align.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.45 }}
                >
                  <Card className={cn("glass-card relative h-full overflow-hidden backdrop-blur-3xl transition-colors shadow-2xl", atmosphere.card)}>
                    <div className={cn("pointer-events-none absolute inset-0", atmosphere.light)} />
                    <CardContent className="relative flex h-full flex-col gap-5 p-5">
                      <button
                        type="button"
                        onClick={() => router.push(`/candor/aligns/${align.id}`)}
                        className="flex w-full items-start gap-4 text-left"
                      >
                        <Avatar className="h-20 w-20 shrink-0 border border-border/60 bg-background/70">
                          <AvatarFallback className="text-lg font-light text-foreground" style={{ background: align.profile.avatarTone }}>
                            {align.profile.avatarInitials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h2 className="truncate text-2xl font-light">{align.profile.username}</h2>
                              <p className="mt-1 truncate text-xs font-light text-foreground-secondary">{align.profile.handle}</p>
                            </div>
                            <p className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-light uppercase tracking-[0.12em]", atmosphere.badge)}>
                              {resonance}
                            </p>
                          </div>
                          <p className="mt-4 line-clamp-3 text-sm font-light leading-6 text-foreground-secondary">{align.profile.line}</p>
                        </div>
                      </button>

                      <div className="rounded-2xl border border-border/30 bg-background/18 p-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/50">
                          <Sparkles className="h-3.5 w-3.5 text-accent" />
                          why candor aligned you
                        </div>
                        <p className="mt-2 text-sm font-light leading-6 text-foreground-secondary">{align.language}</p>
                      </div>

                      <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/40 pt-4">
                        <div className="flex items-center gap-2 text-sm font-light text-foreground-secondary">
                          {align.canText ? <MessageCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          {opennessLanguage(align)}
                        </div>
                        <Button
                          type="button"
                          onClick={() => void (align.canText ? router.push(`/candor/aligns/${align.id}/chat`) : toggleDm(align))}
                          className="rounded-full bg-accent px-5 text-primary-foreground hover:bg-accent/90"
                        >
                          {align.canText ? "open conversation" : align.theirDmOn ? "let it open" : align.myDmOn ? "door open" : "open the door"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </section>

      <BottomNav />
    </main>
  );
}

function alignAtmosphere(resonance: ReturnType<typeof resonanceLabel>) {
  const styles = {
    distant: {
      card: "border-border/40 bg-card/40 shadow-[0_16px_56px_-42px_hsl(var(--foreground)/0.22)] hover:border-border/60",
      badge: "border-border/45 text-foreground-secondary",
      light: "bg-transparent",
    },
    familiar: {
      card: "border-accent/20 bg-[linear-gradient(135deg,hsl(var(--accent)/0.045),hsl(var(--card)/0.42))] shadow-[0_18px_62px_-40px_hsl(var(--accent)/0.26)] hover:border-accent/30",
      badge: "border-accent/25 text-accent/80",
      light: "bg-[radial-gradient(circle_at_18%_12%,hsl(var(--accent)/0.07),transparent_34%)]",
    },
    "natural flow": {
      card: "border-accent/30 bg-[linear-gradient(135deg,hsl(var(--accent)/0.09),hsl(var(--card)/0.48)_48%,hsl(var(--background)/0.26))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.035),0_22px_72px_-38px_hsl(var(--accent)/0.36)] hover:border-accent/40",
      badge: "border-accent/30 text-accent/90 bg-accent/5",
      light: "bg-[radial-gradient(circle_at_18%_16%,hsl(var(--accent)/0.1),transparent_36%)]",
    },
    magnetic: {
      card: "border-accent/35 bg-[linear-gradient(135deg,hsl(var(--accent)/0.13),hsl(var(--card)/0.50)_46%,hsl(var(--glow)/0.06))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.05),0_28px_86px_-38px_hsl(var(--accent)/0.50)] hover:border-accent/50",
      badge: "border-accent/45 text-accent bg-accent/8",
      light: "bg-[radial-gradient(circle_at_22%_12%,hsl(var(--accent)/0.14),transparent_34%),radial-gradient(circle_at_88%_88%,hsl(var(--glow)/0.10),transparent_30%)]",
    },
    candid: {
      card: "border-accent/45 bg-[linear-gradient(135deg,hsl(var(--accent)/0.17),hsl(var(--card)/0.52)_42%,hsl(var(--glow)/0.09))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.065),inset_0_0_42px_hsl(var(--accent)/0.04),0_34px_100px_-40px_hsl(var(--accent)/0.62)] hover:border-accent/60",
      badge: "border-accent/55 text-accent bg-accent/10 shadow-[0_0_22px_-12px_hsl(var(--accent)/0.8)]",
      light: "bg-[radial-gradient(circle_at_20%_12%,hsl(var(--accent)/0.18),transparent_35%),radial-gradient(circle_at_82%_86%,hsl(var(--glow)/0.13),transparent_32%)]",
    },
  } satisfies Record<ReturnType<typeof resonanceLabel>, { card: string; badge: string; light: string }>;

  return styles[resonance];
}

function opennessLanguage(align: Align) {
  if (align.canText) return "conversation feels emotionally open";
  if (align.theirDmOn) return "they opened the door first";
  if (align.myDmOn) return "the door is open on your side";
  return "open the door when it feels easy";
}
