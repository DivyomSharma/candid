"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/candid/BottomNav";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { useAuth } from "@/contexts/AuthContext";
import { AmbientGlyph } from "@/components/candid/art/AmbientGlyph";
import { AlignCard, type Align } from "./AlignCard";

type AlignsResponse = {
  ready: boolean;
  observation: string;
  aligns: Align[];
};

export function CandidAligns() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AlignsResponse | null>(null);
  const [isSearching, setIsSearching] = useState(true);
  const [hiddenAligns, setHiddenAligns] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!isSignedIn) return;
    setIsSearching(true);
    try {
      const response = await fetch("/api/candid/aligns");
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
    const response = await fetch("/api/candid/aligns", {
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
      <main className="gradient-bg grain relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">your aligns come later</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">candid needs to know you first.</p>
          <Button
            onClick={() => router.push(`/candid/login?next=${encodeURIComponent("/candid/aligns")}`)}
            className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90"
          >
            sign in
          </Button>
        </div>
      </main>
    );
  }

  const ready = data?.ready;
  const visibleAligns = data?.aligns.filter(a => !hiddenAligns.has(a.id)) || [];

  return (
    <main className="gradient-bg grain relative min-h-dvh overflow-x-hidden px-6 pb-40 pt-20">
      <AmbientGlow />
      
      {/* Ambient Line Art Background */}
      <AmbientGlyph icon={Sparkles} />

      <section className="relative z-10 mx-auto w-full max-w-[1200px] flex flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-4xl font-light leading-tight tracking-tight md:text-5xl">aligns</h1>
          <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-foreground-secondary">
            {isSearching ? "walking into quiet rooms." : data?.observation ?? "not enough interactions yet."}
          </p>
        </motion.div>



        {isSearching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="w-full animate-pulse rounded-[2rem] bg-card/20 border border-white/5 h-[420px]" />
            ))}
          </div>
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

        {!isSearching && ready && visibleAligns.length === 0 ? (
          <Card className="glass-card shadow-2xl bg-card/45 backdrop-blur-3xl">
            <CardContent className="p-5 text-lg font-light leading-8 text-foreground-secondary">
              the room is quiet for now. candid is waiting for someone else with enough signal.
            </CardContent>
          </Card>
        ) : null}

        {!isSearching && ready && visibleAligns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {visibleAligns.map((align, index) => (
                <motion.div
                  layout
                  key={align.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -20, filter: "blur(8px)" }}
                  transition={{ delay: index * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  <AlignCard
                    align={align}
                    onMaybeLater={() => {
                      setHiddenAligns(prev => new Set([...prev, align.id]));
                    }}
                    onToggleDm={() => {
                      if (align.canText) {
                        router.push(`/candid/aligns/${align.id}/chat`);
                      } else {
                        // Vibrate if supported
                        if (typeof navigator !== "undefined" && navigator.vibrate) {
                          navigator.vibrate([10, 30, 10]);
                        }
                        toggleDm(align);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : null}
      </section>

      <BottomNav />
    </main>
  );
}
