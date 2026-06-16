"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, DoorOpen, Sparkles, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import type { PublicCandidProfile } from "@/lib/candid/matching";
import { ShelfItem } from "./ShelfItem";
import { CandidBadge } from "./CandidBadge";

type AlignProfile = {
  id: string;
  score: number;
  observation?: string;
  why?: string;
  profile: PublicCandidProfile;
  myDmOn: boolean;
  theirDmOn: boolean;
  canText: boolean;
};

export function CandidAlignProfile({ id }: { id: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [align, setAlign] = useState<AlignProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn) return;

    setIsLoading(true);
    fetch(`/api/candid/aligns/${id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: AlignProfile | null) => setAlign(payload))
      .finally(() => setIsLoading(false));
  }, [id, isSignedIn]);

  const toggleDm = async () => {
    if (!align) return;
    if (align.canText) {
      router.push(`/candid/aligns/${id}/chat`);
      return;
    }

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([10, 30, 10]);
    }

    const response = await fetch("/api/candid/aligns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alignmentId: align.id, dmOn: !align.myDmOn }),
    });

    if (!response.ok) return;
    const status = (await response.json()) as Pick<AlignProfile, "myDmOn" | "theirDmOn" | "canText">;
    const next = { ...align, ...status };
    setAlign(next);
    if (next.canText) router.push(`/candid/aligns/${id}/chat`);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 mx-auto flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">profiles open after sign in</h1>
          <Button onClick={() => router.push(`/candid/login?next=${encodeURIComponent(`/candid/aligns/${id}`)}`)} className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90">
            sign in
          </Button>
        </div>
      </main>
    );
  }

  if (isLoading || !align) {
    return (
      <main className="gradient-bg grain relative min-h-dvh overflow-x-hidden px-6 pb-40 pt-16">
        <AmbientGlow />
        <section className="relative z-10 mx-auto flex max-w-[680px] flex-col gap-7">
          <div className="h-6 w-24 rounded bg-white/5 animate-pulse" />
          <div className="h-[400px] w-full rounded-[2rem] bg-white/5 animate-pulse" />
        </section>
      </main>
    );
  }

  const p = align.profile;
  const locationText = [p.district, p.city].filter(Boolean).join(", ");
  const hasCover = !!p.coverUrl;

  return (
    <main className="bg-background grain relative min-h-dvh overflow-x-hidden pb-40">
      {/* Cover Image */}
      <div className="absolute left-0 right-0 top-0 h-[60vh] md:h-[70vh]">
        {hasCover ? (
          <>
            <Image
              src={p.coverUrl as string}
              alt="Room ambient"
              fill
              sizes="100vw"
              priority
              className="absolute inset-0 object-cover opacity-40 mix-blend-luminosity"
            />
          </>
        ) : (
          <div 
            className="h-full w-full opacity-20" 
            style={{ background: `radial-gradient(circle at top, ${p.avatarTone || 'var(--accent)'}, transparent 80%)` }} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-[680px] flex-col px-6 pt-16">
        <button
          type="button"
          onClick={() => router.push("/candid/aligns")}
          className="flex w-fit items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm font-light text-foreground-secondary backdrop-blur-md transition-colors hover:bg-black/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          back to aligns
        </button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
          className="mt-32 flex flex-col items-center text-center"
        >
          <div className="relative group shrink-0">
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-accent blur-md"
              style={{ scale: 1.15 }}
            />
            <Avatar className="relative z-10 h-24 w-24 border-2 border-border/80 bg-background/90 shadow-2xl sm:h-28 sm:w-28">
              {p.coverUrl ? (
                <Image src={p.coverUrl} className="object-cover" alt={p.username} fill sizes="(max-width: 768px) 112px, 112px" />
              ) : (
                <AvatarFallback className="bg-background/80 text-3xl font-light text-foreground shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] sm:text-4xl">
                  {p.avatarInitials}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          <h1 className="mt-6 text-4xl font-light tracking-tight text-foreground/90">
            {p.username}
            {p.age ? <span className="ml-2 text-2xl text-foreground-secondary/70">{p.age}</span> : null}
          </h1>
          {locationText && (
            <p className="mt-2 text-sm font-light tracking-widest text-foreground-secondary uppercase">
              {locationText}
            </p>
          )}

          {/* Identity Chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-[300px]">
            {(p.identityChips?.length ? p.identityChips : p.values).slice(0, 4).map((chip, i) => (
              <span
                key={i}
                className="rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-[11px] font-light lowercase tracking-wider text-foreground-secondary/90 backdrop-blur-md"
              >
                {chip}
              </span>
            ))}
          </div>

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <CandidBadge className="mt-10 w-full max-w-xs" badge={p.candidBadge as any} />
        </motion.div>

        {/* Shelf Section */}
        {p.shelfItems && p.shelfItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="mt-24"
          >
            <div className="mb-6 flex items-center gap-3 opacity-60">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-foreground/20" />
              <h2 className="text-[10px] font-light uppercase tracking-[0.3em]">the shelf</h2>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-foreground/20" />
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {p.shelfItems.map((item, i) => (
                /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                <ShelfItem key={i} item={item as any} index={i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Conversation Starters Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="mt-24"
        >
          <div className="mb-6 flex items-center gap-3 opacity-60">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-foreground/20" />
            <h2 className="text-[10px] font-light uppercase tracking-[0.3em]">starters</h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-foreground/20" />
          </div>

          <div className="grid gap-3">
            {p.conversation.slice(0, 3).map((starter, i) => (
              <button
                key={i}
                className="group flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-5 text-left backdrop-blur-md transition-all hover:bg-white/10"
              >
                <span className="text-sm font-light text-foreground/80 group-hover:text-foreground">
                  {starter}
                </span>
                <MessageCircle className="h-4 w-4 text-foreground-secondary/40 transition-colors group-hover:text-accent" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Action Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-10 left-6 right-6 z-50 mx-auto max-w-[680px]"
        >
          <Button
            onClick={toggleDm}
            className="h-14 w-full rounded-full bg-accent/90 text-lg font-light shadow-2xl backdrop-blur-xl transition-all hover:bg-accent"
          >
            <DoorOpen className="mr-3 h-5 w-5" />
            {align.canText ? "Enter Room" : align.theirDmOn ? "Walk In" : align.myDmOn ? "Door is Open" : "Open Door"}
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
