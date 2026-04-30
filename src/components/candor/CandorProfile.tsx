"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import type { CandorMemory } from "@/lib/candor/types";

type TraitsResponse = {
  memory: CandorMemory;
};

export function CandorProfile() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const router = useRouter();
  const [memory, setMemory] = useState<CandorMemory | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/candor/me/traits")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: TraitsResponse | null) => setMemory(data?.memory ?? null));
  }, [isSignedIn]);

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

  const insights = memory
    ? [
        ...prefix(memory.values, "you seem to care about"),
        ...prefix(memory.communicationNeeds, "you open better with"),
        ...prefix(memory.appreciatesInPeople, "you notice"),
      ].slice(0, 5)
    : ["candor is still listening"];
  const patterns = memory
    ? [...memory.relationalPatterns, ...memory.lifeThemes].slice(0, 5)
    : ["the shape is still forming"];
  const snapshots = memory
    ? [...memory.softSpots, ...memory.notes].slice(0, 5)
    : ["this will get more specific as you talk"];

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-32 pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">what candor notices about you</h1>
          <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">
            private, evolving, and never shown to other people raw.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await signOut();
              router.push("/candor");
            }}
            className="mt-6 rounded-full border-border/50 bg-background/45 px-5 font-light hover:bg-accent/10"
          >
            sign out
          </Button>
        </motion.div>

        <ProfileSection title="insights" items={fallback(insights, ["you reach for honesty, but not exposure"])} />
        <ProfileSection title="patterns" items={fallback(patterns, ["the pattern is still quiet"])} />
        <ProfileSection title="memory snapshots" items={fallback(snapshots, ["this feels familiar somehow"])} />
      </section>
      <BottomNav />
    </main>
  );
}

function ProfileSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-base font-light tracking-wide">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5 p-5 pt-3">
        {items.map((item) => (
          <p key={item} className="text-lg font-light leading-8 text-foreground-secondary">
            {item}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}

function prefix(items: string[], text: string) {
  return items.map((item) => `${text} ${item}`);
}

function fallback(items: string[], backup: string[]) {
  return items.length ? items : backup;
}
