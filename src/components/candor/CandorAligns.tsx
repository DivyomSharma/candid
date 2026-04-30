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
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-32 pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">aligns</h1>
          <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">
            {isSearching ? "looking for enough signal before saying anything." : data?.language ?? "candor is still learning the shape of you."}
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

        {!isSearching && !ready && (
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardContent className="flex flex-col gap-5 p-5">
              <p className="text-lg font-light leading-8 text-foreground-secondary">
                not yet. a real align should come from understanding, not a quick guess.
              </p>
              <p className="text-sm font-light leading-6 text-foreground-secondary/80">
                keep talking. family, friends, career, fear, ambition, love, all of it matters here.
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

        {!isSearching && ready && data?.aligns.map((align) => (
          <Card
            key={align.id}
            className="surface border-border/50 bg-card/45 backdrop-blur-sm transition-colors hover:border-accent/45"
          >
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
                    <p className="shrink-0 text-xs font-light text-accent/80">{Math.round(align.score * 10)}%</p>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-light leading-6 text-foreground-secondary break-words">
                    {align.profile.line}
                  </p>
                </div>
              </button>

              <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-light text-foreground-secondary">
                    {align.canText ? <MessageCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {align.canText
                      ? "both of you opened dms"
                      : align.theirDmOn
                        ? "they opened dms. accept to chat."
                        : "they will see your profile when you open dms."}
                  </div>
                  <Button
                    type="button"
                    onClick={() => (align.canText ? router.push(`/candor/aligns/${align.id}/chat`) : toggleDm(align))}
                    className="rounded-full bg-accent px-5 text-primary-foreground hover:bg-accent/90"
                  >
                    {align.canText ? "open chat" : align.theirDmOn ? "accept dms" : align.myDmOn ? "dms on" : "open dms"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      <BottomNav />
    </main>
  );
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
