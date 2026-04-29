"use client";

import { SignInButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";

const insights = ["you reach for honesty, but not exposure", "you notice shifts before you can name them", "you open up better when nothing is demanded"];
const patterns = ["returns to unfinished conversations", "softens when there is room", "prefers warmth with a little edge"];
const snapshots = ["this feels familiar somehow", "you keep circling the almost-said thing", "the quiet parts are becoming clearer"];

export function CandorProfile() {
  const { isLoaded, isSignedIn } = useUser();

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">what candor notices about you</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">it needs time with you first.</p>
          <SignInButton mode="modal">
            <Button className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90">sign in</Button>
          </SignInButton>
        </div>
      </main>
    );
  }

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-32 pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">what candor notices about you</h1>
        </motion.div>

        <ProfileSection title="insights" items={insights} />
        <ProfileSection title="patterns" items={patterns} />
        <ProfileSection title="memory snapshots" items={snapshots} />
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
