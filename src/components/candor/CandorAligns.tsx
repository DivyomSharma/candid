"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { resonanceLabel } from "@/lib/candor/matching";
import { cn } from "@/lib/utils";

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

const resonanceProgression = ["distant", "familiar", "natural flow", "magnetic", "candid"] as const;

export function CandorAligns() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AlignsResponse | null>(null);
  const [isSearching, setIsSearching] = useState(true);

  const refresh = useCallback(() => {
    if (!isSignedIn) return;
    setIsSearching(true);

    fetch("/api/candor/aligns")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: AlignsResponse | null) => {
        setData(payload);
      })
      .finally(() => setIsSearching(false));
  }, [isSignedIn]);

  useEffect(() => {
    refresh();
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
        ? {
            ...current,
            aligns: current.aligns.map((item) => (item.id === align.id ? { ...item, ...status } : item)),
          }
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
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">aligns</h1>
          <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">
            {isSearching ? "looking for a rhythm that would feel natural, not forced." : data?.language ?? "not enough interactions yet."}
          </p>
        </motion.div>

        {isSearching && (
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardContent className="flex flex-col gap-5 p-5">
              <SearchingLine />
              <div className="grid gap-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-3 rounded-full bg-foreground/10" style={{ width: `${72 - item * 14}%` }} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {!isSearching && ready ? <AlignTierProgression aligns={data?.aligns ?? []} /> : null}

        {!isSearching && !ready && (
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardContent className="flex flex-col gap-5 p-5">
              <p className="text-lg font-light leading-8 text-foreground-secondary">
                not yet. a real align should come from understanding, not a quick guess.
              </p>
              <p className="text-sm font-light leading-6 text-foreground-secondary/80">
                keep talking. family, friends, work, fear, ambition, love, all of it quietly changes who opens well with you.
              </p>
            </CardContent>
          </Card>
        )}

        {!isSearching && ready && data?.aligns.length === 0 && (
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardContent className="p-5 text-lg font-light leading-8 text-foreground-secondary">
              candor understands you enough. it is waiting for someone else with enough signal too.
            </CardContent>
          </Card>
        )}

        {!isSearching && ready && data?.aligns.map((align) => {
          const resonance = resonanceLabel(align.score);
          const atmosphere = alignAtmosphere(resonance);
          return (
          <Card
            key={align.id}
            className={cn(
              "surface relative overflow-hidden border backdrop-blur-sm transition-colors",
              atmosphere.card,
            )}
          >
            <div className={cn("pointer-events-none absolute inset-0", atmosphere.light)} />
            <CardContent className="flex flex-col gap-5 p-5">
              <button
                type="button"
                onClick={() => router.push(`/candor/aligns/${align.id}`)}
                className="flex w-full items-center gap-4 text-left"
              >
                <Avatar className="h-16 w-16 shrink-0 border border-border/60 bg-background/70">
                  <AvatarFallback className="text-base font-light text-foreground" style={{ background: align.profile.avatarTone }}>
                    {align.profile.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-light">{align.profile.username}</h2>
                      <p className="mt-1 truncate text-xs font-light text-foreground-secondary">{align.profile.handle}</p>
                    </div>
                    <p className={cn("shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-light", atmosphere.badge)}>
                      {resonance}
                    </p>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-light leading-6 text-foreground-secondary break-words">
                    {align.profile.line}
                  </p>
                </div>
              </button>

              <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
                <p className="text-sm font-light leading-6 text-foreground-secondary">{align.language}</p>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-light text-foreground-secondary">
                    {align.canText ? <MessageCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {opennessLanguage(align)}
                  </div>
                  <Button
                    type="button"
                    onClick={() => (align.canText ? router.push(`/candor/aligns/${align.id}/chat`) : toggleDm(align))}
                    className="rounded-full bg-accent px-5 text-primary-foreground hover:bg-accent/90"
                  >
                    {align.canText ? "open conversation" : align.theirDmOn ? "let it open" : align.myDmOn ? "door open" : "open the door"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </section>
      <BottomNav />
    </main>
  );
}

function alignAtmosphere(resonance: ReturnType<typeof resonanceLabel>) {
  const styles = {
    distant: {
      card: "border-border/42 bg-card/36 shadow-[0_16px_56px_-42px_hsl(var(--foreground)/0.22)] hover:border-border/60",
      badge: "border-border/45 text-foreground-secondary",
      light: "bg-transparent",
    },
    familiar: {
      card: "border-accent/20 bg-[linear-gradient(135deg,hsl(var(--accent)/0.045),hsl(var(--card)/0.42))] shadow-[0_18px_62px_-40px_hsl(var(--accent)/0.26)] hover:border-accent/34",
      badge: "border-accent/25 text-accent/78",
      light: "bg-[radial-gradient(circle_at_18%_12%,hsl(var(--accent)/0.07),transparent_34%)]",
    },
    "natural flow": {
      card: "border-accent/28 bg-[linear-gradient(135deg,hsl(var(--accent)/0.09),hsl(var(--card)/0.48)_48%,hsl(var(--background)/0.26))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.035),0_22px_72px_-38px_hsl(var(--accent)/0.36)] hover:border-accent/42",
      badge: "border-accent/34 text-accent/88 bg-accent/5",
      light: "bg-[radial-gradient(circle_at_18%_16%,hsl(var(--accent)/0.1),transparent_36%)]",
    },
    magnetic: {
      card: "border-accent/36 bg-[linear-gradient(135deg,hsl(var(--accent)/0.13),hsl(var(--card)/0.50)_46%,hsl(var(--glow)/0.06))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.05),0_28px_86px_-38px_hsl(var(--accent)/0.50)] hover:border-accent/52",
      badge: "border-accent/45 text-accent bg-accent/8",
      light: "bg-[radial-gradient(circle_at_22%_12%,hsl(var(--accent)/0.14),transparent_34%),radial-gradient(circle_at_88%_88%,hsl(var(--glow)/0.10),transparent_30%)]",
    },
    candid: {
      card: "border-accent/46 bg-[linear-gradient(135deg,hsl(var(--accent)/0.17),hsl(var(--card)/0.52)_42%,hsl(var(--glow)/0.09))] shadow-[inset_0_1px_0_hsl(var(--foreground)/0.065),inset_0_0_42px_hsl(var(--accent)/0.04),0_34px_100px_-40px_hsl(var(--accent)/0.62)] hover:border-accent/62",
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

function AlignTierProgression({ aligns }: { aligns: Align[] }) {
  const highest = aligns.reduce<ReturnType<typeof resonanceLabel>>((current, align) => {
    const next = resonanceLabel(align.score);
    return resonanceProgression.indexOf(next) > resonanceProgression.indexOf(current) ? next : current;
  }, "distant");

  return (
    <Card className="surface relative overflow-hidden border-border/45 bg-card/40 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background)/0.12),hsl(var(--accent)/0.08),hsl(var(--glow)/0.07))]" />
      <CardContent className="relative flex flex-col gap-5 p-5">
        <div>
          <p className="text-xs font-light uppercase tracking-[0.18em] text-foreground-secondary">align atmosphere</p>
          <p className="mt-2 text-sm font-light leading-6 text-foreground-secondary">
            candor lets stronger connections feel warmer over time, without turning them into scores.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {resonanceProgression.map((tier, index) => {
            const active = resonanceProgression.indexOf(highest) >= index;
            const current = highest === tier;
            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: active ? 1 : 0.42, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className={`rounded-2xl border px-3 py-4 ${
                  current
                    ? "border-accent/45 bg-accent/10 shadow-[0_0_34px_-20px_hsl(var(--accent)/0.8)]"
                    : active
                      ? "border-accent/25 bg-background/20"
                      : "border-border/35 bg-background/10"
                }`}
              >
                <p className="text-sm font-light text-foreground">{tier}</p>
                <p className="mt-3 text-xs font-light leading-5 text-foreground-secondary">
                  {tierAtmosphere(tier)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function tierAtmosphere(tier: ReturnType<typeof resonanceLabel>) {
  if (tier === "candid") return "lived-in, precise, unusually easy";
  if (tier === "magnetic") return "warmth gathers around the thread";
  if (tier === "natural flow") return "conversation can move without pushing";
  if (tier === "familiar") return "a quiet pattern is recognizable";
  return "a first signal, still at a distance";
}

function SearchingLine() {
  return (
    <div className="flex items-center gap-2 text-lg font-light leading-8 text-foreground-secondary">
      <span>searching for a real align</span>
      <motion.span
        aria-hidden
        animate={{ opacity: [0.25, 1, 0.25] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        ...
      </motion.span>
    </div>
  );
}
