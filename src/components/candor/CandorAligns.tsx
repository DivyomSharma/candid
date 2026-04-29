"use client";

import { useEffect, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import type { CandorMemory } from "@/lib/candor/types";

type TraitsResponse = {
  memory: CandorMemory;
  alignment: {
    ready: boolean;
    language: string;
  };
};

export function CandorAligns() {
  const { isLoaded, isSignedIn } = useUser();
  const [data, setData] = useState<TraitsResponse | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    fetch("/api/candor/me/traits")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: TraitsResponse | null) => setData(payload));
  }, [isSignedIn]);

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">your aligns come later</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">candor needs to know you first.</p>
          <SignInButton mode="modal">
            <Button className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90">sign in</Button>
          </SignInButton>
        </div>
      </main>
    );
  }

  const memory = data?.memory;
  const ready = data?.alignment.ready;

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-32 pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">aligns</h1>
          <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">
            {data?.alignment.language ?? "candor is still learning the shape of you."}
          </p>
        </motion.div>

        <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
          <CardContent className="flex flex-col gap-5 p-5">
            <p className="text-lg font-light leading-8 text-foreground-secondary">
              {ready
                ? "soon, this is where candor will introduce people who feel worth staying curious about."
                : "not yet. a real align should come from understanding, not a quick guess."}
            </p>
            <p className="text-sm font-light leading-6 text-foreground-secondary/80">
              {memory?.alignmentReady
                ? "there is enough signal to begin softly."
                : "keep talking. family, friends, career, fear, ambition, love, all of it matters here."}
            </p>
          </CardContent>
        </Card>
      </section>
      <BottomNav />
    </main>
  );
}
