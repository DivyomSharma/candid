"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Film, Heart, Sparkles, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import type { CandorMemory } from "@/lib/candor/types";

type TraitsResponse = {
  memory: CandorMemory;
};

type ProfileDetail = {
  username: string;
  handle: string;
  initials: string;
  bio: string;
  bannerTone: string;
  closestCharacter: string;
  storyTaste: string;
  situation: {
    title: string;
    setup: string;
    response: string;
  };
  quietStrengths: string[];
  needs: string[];
  signals: Array<{ label: string; value: string; meter: number }>;
};

export function CandorProfile() {
  const { isLoaded, isSignedIn, signOut, user } = useAuth();
  const router = useRouter();
  const [memory, setMemory] = useState<CandorMemory | null>(null);
  const [hasLoadedMemory, setHasLoadedMemory] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;
    setHasLoadedMemory(false);

    fetch("/api/candor/me/traits")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: TraitsResponse | null) => setMemory(data?.memory ?? null))
      .finally(() => setHasLoadedMemory(true));
  }, [isSignedIn]);

  const profile = useMemo(() => buildProfile(memory, user?.email ?? null), [memory, user?.email]);

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

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-4 pb-32 pt-16 sm:px-6 sm:pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[680px] flex-col gap-6 sm:gap-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">your candor profile</h1>
          <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">
            a softened version of what candor understands. not the raw thing.
          </p>
        </motion.div>

        {!hasLoadedMemory ? (
          <ProfileLoading />
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="contents">
        <Card className="surface overflow-hidden border-border/50 bg-card/45 backdrop-blur-sm">
          <div className="relative h-36" style={{ background: profile.bannerTone }}>
            <div className="absolute inset-0 bg-background/10" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
              <Avatar className="h-24 w-24 border border-border/60 bg-background/70 shadow-sm">
                <AvatarFallback className="bg-background/70 text-2xl font-light text-foreground">
                  {profile.initials}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  await signOut();
                  router.push("/candor");
                }}
                className="mb-1 rounded-full border-border/50 bg-background/50 px-5 font-light backdrop-blur-md hover:bg-accent/10"
              >
                sign out
              </Button>
            </div>
          </div>

          <CardContent className="flex flex-col gap-6 p-5 pt-7">
            <div>
              <p className="text-xs font-light uppercase tracking-[0.24em] text-accent/70">{profile.handle}</p>
              <h2 className="mt-2 text-3xl font-light tracking-tight">{profile.username}</h2>
              <p className="mt-3 text-base font-light leading-7 text-foreground-secondary break-words">{profile.bio}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {profile.signals.map((signal) => (
                <SignalCard key={signal.label} {...signal} />
              ))}
            </div>
          </CardContent>
        </Card>

        <DetailGrid profile={profile} memory={memory} />
          </motion.div>
        )}
      </section>
      <BottomNav />
    </main>
  );
}

function ProfileLoading() {
  return (
    <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
      <CardContent className="flex flex-col gap-5 p-5">
        <p className="text-lg font-light leading-8 text-foreground-secondary">reading what candor knows so far...</p>
        <div className="grid gap-3">
          <div className="h-24 rounded-2xl bg-foreground/10" />
          <div className="h-3 w-3/4 rounded-full bg-foreground/10" />
          <div className="h-3 w-1/2 rounded-full bg-foreground/10" />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailGrid({ profile, memory }: { profile: ProfileDetail; memory: CandorMemory | null }) {
  const values = cleanProfileList(fallback(memory?.values, ["honesty", "emotional safety"]), 4);
  const softSpots = cleanProfileList(fallback(memory?.softSpots, ["feeling unseen"]), 4);
  const patterns = cleanProfileList(
    fallback(memory ? [...memory.relationalPatterns, ...memory.lifeThemes] : [], ["the pattern is still forming"]),
    4,
  );

  return (
    <>
      <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
            <UserRound className="h-4 w-4 text-accent" />
            the shape of you
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 pt-3 sm:grid-cols-2">
          <TextBlock title="values" items={values.map((item) => `cares about ${item}`)} />
          <TextBlock title="soft spots" items={softSpots.map((item) => `tender around ${item}`)} />
          <TextBlock title="patterns" items={patterns.slice(0, 4)} />
          <TextBlock title="what helps" items={profile.needs} />
        </CardContent>
      </Card>

      <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
        <CardContent className="grid gap-6 p-5 md:grid-cols-[1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2 text-sm font-light text-accent">
              <Film className="h-4 w-4" />
              closest story signal
            </div>
            <h3 className="mt-4 text-2xl font-light leading-8 break-words">{profile.closestCharacter}</h3>
            <p className="mt-3 text-sm font-light leading-6 text-foreground-secondary break-words">{profile.storyTaste}</p>
          </div>
          <div className="rounded-2xl border border-border/50 bg-background/35 p-5">
            <p className="text-xs font-light uppercase tracking-[0.22em] text-foreground-secondary">situation read</p>
            <h4 className="mt-3 text-xl font-light">{profile.situation.title}</h4>
            <p className="mt-3 text-sm font-light leading-6 text-foreground-secondary break-words">{profile.situation.setup}</p>
            <p className="mt-4 text-base font-light leading-7 break-words">{profile.situation.response}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
        <CardHeader className="p-5 pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
            <Sparkles className="h-4 w-4 text-accent" />
            quiet strengths
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 p-5 pt-3">
          {profile.quietStrengths.map((strength) => (
            <p key={strength} className="rounded-2xl border border-border/40 bg-background/25 px-4 py-3 text-sm font-light leading-6 text-foreground-secondary break-words">
              {strength}
            </p>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

function SignalCard({ label, value, meter }: { label: string; value: string; meter: number }) {
  const width = clamp(meter, 8, 100);

  return (
    <div className="min-w-0 rounded-2xl border border-border/45 bg-background/30 p-4">
      <p className="text-[11px] font-light uppercase tracking-[0.2em] text-foreground-secondary">{label}</p>
      <p className="mt-2 min-h-10 text-sm font-light leading-5 break-words">{value}</p>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border/50">
        <div className="h-full rounded-full bg-accent/70" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function TextBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-xs font-light uppercase tracking-[0.2em] text-foreground-secondary">
        <Heart className="h-3.5 w-3.5 text-accent" />
        {title}
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <p key={item} className="text-sm font-light leading-6 text-foreground-secondary break-words">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function buildProfile(memory: CandorMemory | null, email: string | null): ProfileDetail {
  const baseName = email?.split("@")[0]?.replace(/[^\w.]+/g, ".").replace(/\.+/g, ".") || "someone";
  const username = titleCase(baseName.replace(/[._-]+/g, " "));
  const values = cleanProfileList(fallback(memory?.values, ["honesty"]), 5);
  const needs = cleanProfileList(fallback(memory?.communicationNeeds, ["gentle directness"]), 4);
  const softSpots = cleanProfileList(fallback(memory?.softSpots, ["feeling unseen"]), 4);
  const themes = fallback(memory?.lifeThemes, ["quiet pressure"]);
  const appreciates = fallback(memory?.appreciatesInPeople, ["follow-through"]);
  const turnCount = memory?.turnCount ?? 0;
  const hasSignal = turnCount >= 3 || values.length + needs.length + softSpots.length > 4;

  return {
    username,
    handle: `@${baseName.toLowerCase()}`,
    initials: initialsFrom(username),
    bio: hasSignal
      ? `someone who seems to care about ${values[0]}, opens better with ${needs[0]}, and notices ${appreciates[0]} in people.`
      : "a profile that will become more specific as candor hears more from you.",
    bannerTone: bannerFrom(values[0]),
    closestCharacter: hasSignal ? closestCharacter(memory) : "not enough signal for a character read yet",
    storyTaste: hasSignal ? storyTaste(memory) : "candor needs more of your actual words before guessing at story taste.",
    situation: hasSignal ? situationFrom(memory) : earlySituation(),
    quietStrengths: [
      `they may not say everything quickly, but they tend to notice what changes in the room.`,
      `they seem to respect ${values[0]} more than performance.`,
      `they are likely drawn to people who show ${appreciates[0]} without making it loud.`,
    ],
    needs: [
      `opens better with ${needs[0]}`,
      `may get quiet around ${softSpots[0]}`,
      `needs room to be precise before being seen`,
    ],
    signals: [
      { label: "known", value: turnCount > 7 ? "candor has a real outline" : "still becoming clear", meter: clamp(turnCount * 9, 18, 92) },
      { label: "core", value: values[0], meter: clamp(values.length * 18 + 28, 24, 96) },
      { label: "pace", value: needs[0], meter: clamp(needs.length * 18 + 34, 24, 96) },
    ],
  };
}

function earlySituation(): ProfileDetail["situation"] {
  return {
    title: "still forming",
    setup: "there is not enough history here for candor to describe a specific situation honestly.",
    response: "keep talking in the messy version. this part should earn its confidence slowly.",
  };
}

function closestCharacter(memory: CandorMemory | null) {
  const values = memory?.values ?? [];
  const themes = memory?.lifeThemes ?? [];
  const softSpots = memory?.softSpots ?? [];

  if (themes.includes("career pressure")) return "amy from little women, if ambition had a quieter private room";
  if (softSpots.includes("feeling unseen")) return "joel from eternal sunshine, the part that remembers before it speaks";
  if (values.includes("honesty")) return "nora from normal people, careful with truth and closeness";
  if (values.includes("emotional safety")) return "chihiro from spirited away, soft but braver than expected";
  return "the person in the indie film who notices the thing everyone else missed";
}

function storyTaste(memory: CandorMemory | null) {
  const themes = memory?.lifeThemes ?? [];
  if (themes.includes("family")) return "probably drawn to stories where love is complicated by home, silence, and old roles.";
  if (themes.includes("career pressure")) return "probably drawn to characters trying to become someone without losing themselves.";
  if (themes.includes("friendships")) return "probably drawn to slow shifts, almost-losses, and the ache inside changing friendships.";
  return "probably drawn to quiet stories where memory, longing, and small choices matter more than spectacle.";
}

function situationFrom(memory: CandorMemory | null): ProfileDetail["situation"] {
  const need = memory?.communicationNeeds[0] ?? "gentle directness";
  const softSpot = memory?.softSpots[0] ?? "being misunderstood";

  return {
    title: "when something feels off",
    setup: `someone they care about changes tone, but nothing has technically happened.`,
    response: `they may first study the silence, then look for ${need}. if it touches ${softSpot}, they might need time before saying the exact thing.`,
  };
}

function bannerFrom(seed: string) {
  if (seed.includes("honest")) {
    return "linear-gradient(135deg, hsl(var(--accent) / 0.38), hsl(var(--background) / 0.2)), radial-gradient(circle at 20% 30%, hsl(var(--foreground) / 0.16), transparent 34%)";
  }
  if (seed.includes("safe")) {
    return "linear-gradient(135deg, hsl(var(--glow) / 0.28), hsl(var(--surface-secondary))), radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.28), transparent 32%)";
  }
  return "linear-gradient(135deg, hsl(var(--surface-secondary)), hsl(var(--accent) / 0.28)), radial-gradient(circle at 70% 30%, hsl(var(--foreground) / 0.12), transparent 36%)";
}

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ") || "Someone";
}

function fallback(items: string[] | undefined, backup: string[]) {
  return items?.length ? items : backup;
}

function cleanProfileList(items: string[], limit: number) {
  const seen = new Set<string>();
  const normalized = items
    .map((item) => item.trim().toLowerCase().replace(/\s+/g, " "))
    .filter(Boolean)
    .filter((item) => {
      const key = item
        .replace(/\b(feeling|being|need for|a need for)\b/g, "")
        .replace(/\bmisunderstood\b/g, "unseen")
        .trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return normalized.slice(0, limit);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
