"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Moon, Film, Laptop, Music, Cloud, Home } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNav } from "@/components/candor/BottomNav";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { useAuth } from "@/contexts/AuthContext";
import { buildAdaptiveHome, type CandorHomeCardSpec } from "@/lib/candor/personalization";
import { CANDOR_THREAD_ID, candorThreadStorageKey } from "@/lib/candor/thread";
import type { CandorSignal } from "@/lib/candor/scenarios";
import type { CandorMemory } from "@/lib/candor/types";

// New Layout & Cards
import { HeroCard } from "./cards/HeroCard";
import { ContinueCard } from "./cards/ContinueCard";
import { SignalCard } from "./cards/SignalCard";
import { AlignCard } from "./cards/AlignCard";
import { MemoryCard } from "@/components/candor/cards/MemoryCard";
import { OpenLoopCard } from "@/components/candor/cards/OpenLoopCard";
import { CommunityAtmosphereCard } from "@/components/candor/cards/CommunityAtmosphereCard";
import { SoundtrackCard } from "@/components/candor/cards/SoundtrackCard";
import { MovieCard } from "@/components/candor/cards/MovieCard";
import { VisualMemoryCard } from "@/components/candor/cards/VisualMemoryCard";
import { MoodCollageCard } from "@/components/candor/cards/MoodCollageCard";
import { RandomObjectCard } from "@/components/candor/cards/RandomObjectCard";
import { TruthCard } from "@/components/candor/cards/TruthCard";
import { AmbientGlyph } from "@/components/candor/art/AmbientGlyph";
import { MoonArt, ProjectorArt, CoffeeArt, PlantArt, VinylArt } from "@/components/candor/art";
import { Card } from "@/components/ui/card";

type PreviewMessage = { role: "user" | "ai"; content: string };
type AlignPreview = {
  id: string;
  username: string;
  initials: string;
  tone: string;
  resonance: string;
  insight: string;
};

const defaultInitiativeLine = "i have a feeling your algorithm knows too much about you already";
const placeholders = [
  "start with the thing you actually care about",
  "what keeps returning?",
  "what's been stuck in your head?",
  "what feels unfinished?"
];

export function CandorHome() {
  const [message, setMessage] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PreviewMessage | null>(null);
  const [signal, setSignal] = useState<CandorSignal | null>(null);
  const [isFetchingSignal, setIsFetchingSignal] = useState(false);
  const [signalAnswered, setSignalAnswered] = useState<string | null>(null);
  const [aligns, setAligns] = useState<AlignPreview[]>([]);
  const [isFetchingAligns, setIsFetchingAligns] = useState(false);
  const [reflection, setReflection] = useState("you sound lighter after midnight.");
  const [memoryPreview, setMemoryPreview] = useState<CandorMemory | null>(null);

  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      setPreview({ role: "ai", content: defaultInitiativeLine });
      return;
    }

    const saved = window.localStorage.getItem(candorThreadStorageKey(user.id));
    if (!saved) {
      setPreview(null);
      return;
    }

    try {
      const parsed = JSON.parse(saved) as PreviewMessage[];
      const lastAi = [...parsed].reverse().find((item) => item.role === "ai");
      const lastUser = [...parsed].reverse().find((item) => item.role === "user");
      setPreview(lastAi ?? lastUser ?? { role: "ai", content: defaultInitiativeLine });
    } catch {
      setPreview({ role: "ai", content: defaultInitiativeLine });
    }
  }, [isSignedIn, user?.id]);

  useEffect(() => {
    void fetchSignal();
    void fetchAligns();
    void fetchReflection();
    void fetchMemoryPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, user?.id]);

  const fetchSignal = async (excludeId?: string) => {
    setIsFetchingSignal(true);
    try {
      const url = excludeId ? `/api/candor/signals?limit=1&excludeId=${excludeId}` : "/api/candor/signals?limit=1";
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      if (data.signals?.length) {
        setSignal(data.signals[0]);
        setSignalAnswered(null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingSignal(false);
    }
  };

  const fetchAligns = async () => {
    if (!isSignedIn) return;
    setIsFetchingAligns(true);
    try {
      const res = await fetch("/api/candor/aligns");
      if (!res.ok) return;
      const data = await res.json();
      if (!data.ready || !data.aligns) return;

      const list = data.aligns.slice(0, 2).map((align: { id: string; profile: { username: string; avatarInitials: string; avatarTone: string }; score: number }) => ({
        id: align.id,
        username: align.profile.username,
        initials: align.profile.avatarInitials,
        tone: align.profile.avatarTone,
        resonance: align.score >= 13 ? "candid" : align.score >= 10 ? "magnetic" : align.score >= 7 ? "natural flow" : "familiar",
        insight: alignInsightForScore(align.score),
      }));
      setAligns(list);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingAligns(false);
    }
  };

  const fetchMemoryPreview = async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch("/api/candor/me/traits");
      if (!res.ok) return;
      const data = await res.json();
      setMemoryPreview(data.memory ?? null);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReflection = async () => {
    if (!isSignedIn) return;
    try {
      const res = await fetch("/api/candor/me/continuity");
      if (!res.ok) return;
      const data = await res.json();
      if (data.continuity?.weeklyReflection) {
        setReflection(data.continuity.weeklyReflection);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const start = async (content: string) => {
    if (!content.trim() || isStarting) return;

    if (!isSignedIn) {
      router.push(`/candor/login?next=${encodeURIComponent("/candor/home")}`);
      return;
    }

    setError("");
    setIsStarting(true);

    let success = false;
    try {
      const response = await fetch("/api/candor/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content.trim(), currentScreen: pathname }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("sign in first, then this can stay with you.");
        } else {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          setError(data.error === "missing_supabase_env" ? "database is not connected yet. add supabase keys." : "something did not open. check environment.");
        }
        return;
      }

      const data = (await response.json()) as { id: string; persisted?: boolean; message?: { id: string; role: "ai"; content: string } | null };

      if (data.persisted === false && user?.id) {
        const initialMessages = [
          { id: crypto.randomUUID(), role: "user" as const, content: content.trim() },
          ...(data.message ? [data.message] : []),
        ];
        window.localStorage.setItem(candorThreadStorageKey(user.id), JSON.stringify(initialMessages));
      }

      success = true;
      router.push(`/candor/session/${data.id || CANDOR_THREAD_ID}`);
    } catch {
      setError("the connection did not answer. try again.");
    } finally {
      if (!success) setIsStarting(false);
    }
  };

  const handleSignalAnswer = async (option: string) => {
    if (!signal) return;
    setSignalAnswered(option);

    if (!isSignedIn) return;
    try {
      await fetch("/api/candor/signals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signalId: signal.id, option }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void start(message);
  };

  const selectPrompt = (content: string) => {
    setMessage(content);
    setError("");
    void start(content);
  };

  const username = user?.firstName?.toLowerCase() || user?.email?.split("@")[0]?.toLowerCase() || "there";
  const previewTeaser = preview ? teaseLine(preview.content) : "";
  const adaptiveHome = useMemo(
    () => buildAdaptiveHome(memoryPreview, user?.id ?? username),
    [memoryPreview, user?.id, username],
  );
  const primaryAlign = aligns[0] ?? null;
  const tonightItems = buildYouTonight(memoryPreview);
  const soundtrackUrl = memoryPreview?.profileV4?.socialLinks?.spotify
    ? `https://open.spotify.com/user/${memoryPreview.profileV4.socialLinks.spotify}`
    : "https://open.spotify.com/";

  return (
    <>
      <AnimatePresence>
        {isStarting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-background"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-[250px] w-[250px] rounded-full bg-accent blur-[80px]"
              />
              <motion.div
                animate={{ filter: ["blur(4px)", "blur(0px)", "blur(4px)"], opacity: [0.4, 1, 0.4], scale: [0.97, 1, 0.97] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 text-4xl font-light tracking-[0.25em] text-foreground"
              >
                candor
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="gradient-bg grain relative min-h-screen overflow-x-hidden px-4 pb-40 pt-6 sm:px-6 md:pt-10">
        <AmbientGlow />
        
        <AmbientGlyph icon={Home} />

        <section className="relative z-10 mx-auto w-full max-w-[1600px] flex flex-col gap-10">
            <div className="flex flex-col gap-8 w-full">
              {/* HERO SECTION - Top */}
              <div className="flex flex-col md:flex-row gap-6 w-full">
                <div className="flex-1 min-w-[60%]">
                  <HeroCard question={adaptiveHome.heroPrompt} />
                </div>
                <div className="flex-none md:w-[350px] pt-4 md:pt-16">
                  <CommunityAtmosphereCard 
                    title="Tonight on Candor"
                    items={tonightItems.map(t => ({ icon: t.icon, label: t.label }))}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* CONTINUE CHAT SECTION */}
              <div className="w-full max-w-3xl mx-auto flex justify-center py-4">
                {renderHomeCard({ 
                  card: { kind: "continue", priority: 1, size: 1 }, 
                  isSignedIn, preview, previewTeaser, signal, signalAnswered, primaryAlign, adaptiveHome, memoryPreview, reflection, tonightItems, soundtrackUrl, router, fetchSignal, handleSignalAnswer, selectPrompt 
                })}
              </div>

              {/* MASONRY CARDS */}
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {[
                  { kind: "align" },
                  { kind: "memory" },
                  { kind: "signal" },
                  { kind: "soundtrack" },
                  { kind: "movie" },
                  { kind: "mood_collage" },
                  { kind: "reflection" },
                  { kind: "thought" },
                ].map((spec, i) => {
                  const cardEl = renderHomeCard({ 
                    card: { ...spec, priority: 1 } as CandorHomeCardSpec & { artType?: string }, 
                    isSignedIn, preview, previewTeaser, signal, signalAnswered, primaryAlign, adaptiveHome, memoryPreview, reflection, tonightItems, soundtrackUrl, router, fetchSignal, handleSignalAnswer, selectPrompt 
                  });
                  
                  if (!cardEl || cardEl.props.className === "hidden") return null;

                  return (
                    <motion.div 
                      key={`${spec.kind}-${i}`} 
                      className="break-inside-avoid relative group"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.5 }}
                    >
                      <div className="transition-all duration-700 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-15px_hsl(var(--accent)/0.15)] group-hover:scale-[1.01] rounded-3xl">
                        {cardEl}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {!adaptiveHome.hasSufficientData && (
              <div className="mt-12 flex justify-center w-full">
                <div className="max-w-2xl w-full">
                  <TruthCard />
                </div>
              </div>
            )}
        </section>

        {/* Input refactored: pinned above nav, luxury spacing */}
        <div className="fixed inset-x-0 bottom-28 z-[100] pointer-events-none flex justify-center px-4">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-[800px] flex-col gap-3 relative shadow-2xl shadow-black/40 rounded-full"
          >
            <div className="relative flex w-full items-center">
              <motion.input
                id="candor-home-input"
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={isInputFocused ? "" : placeholders[placeholderIndex]}
                className="h-16 w-full origin-center rounded-full glass-card border border-border/60 bg-background/60 backdrop-blur-3xl pl-8 pr-[60px] text-lg font-light text-foreground outline-none transition-all placeholder:text-foreground-secondary/50 focus:border-accent/50 focus:bg-background/80 focus:shadow-[0_0_30px_hsl(var(--accent)/0.15)] shadow-2xl"
              />

              <div className="absolute right-2 flex items-center">
                {isLoaded && isSignedIn ? (
                  <motion.button
                    type="submit"
                    disabled={!message.trim() || isStarting}
                    className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-medium text-primary-foreground transition-all hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                    whileHover={!message.trim() || isStarting ? {} : { scale: 1.05 }}
                    whileTap={!message.trim() || isStarting ? {} : { scale: 0.95 }}
                  >
                    <AnimatePresence mode="wait">
                      {isStarting ? (
                        <motion.div key="dots" className="flex items-center gap-1">
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        </motion.div>
                      ) : message.length > 0 ? (
                        <motion.div key="arrow" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center">
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ) : (
                  <button
                    type="button"
                    disabled={!isLoaded}
                    onClick={() => router.push(`/candor/login?next=${encodeURIComponent("/candor/home")}`)}
                    className="flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent/90"
                  >
                    sign in
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {error && <p className="absolute -bottom-6 right-4 text-xs font-light text-foreground-secondary">{error}</p>}
          </motion.form>
        </div>

        <BottomNav />
      </main>
    </>
  );
}

function renderHomeCard(input: {
  card: CandorHomeCardSpec;
  isSignedIn: boolean;
  preview: PreviewMessage | null;
  previewTeaser: string;
  signal: CandorSignal | null;
  signalAnswered: string | null;
  primaryAlign: AlignPreview | null;
  adaptiveHome: ReturnType<typeof buildAdaptiveHome>;
  memoryPreview: CandorMemory | null;
  reflection: string;
  tonightItems: Array<{ icon: typeof Moon; label: string }>;
  soundtrackUrl: string;
  router: ReturnType<typeof useRouter>;
  fetchSignal: (excludeId?: string) => Promise<void>;
  handleSignalAnswer: (option: string) => Promise<void>;
  selectPrompt: (content: string) => void;
}) {
  const {
    card,
    isSignedIn,
    preview,
    previewTeaser,
    signal,
    signalAnswered,
    primaryAlign,
    adaptiveHome,
    memoryPreview,
    tonightItems,
    router,
    fetchSignal,
    handleSignalAnswer,
    selectPrompt,
  } = input;

  if (card.kind === "art") {
    const artType = (card as CandorHomeCardSpec & { artType?: string }).artType;
    return (
      <Card className="glass-card overflow-hidden border border-border/40 bg-card/30 backdrop-blur-3xl transition-colors hover:border-accent/30 shadow-xl flex items-center justify-center p-8 min-h-[220px]">
        {artType === "coffee" && <CoffeeArt state={1} width={90} height={90} />}
        {artType === "projector" && <ProjectorArt state={1} width={110} height={110} />}
        {artType === "vinyl" && <VinylArt state={1} width={110} height={110} />}
        {artType === "plant" && <PlantArt state={1} width={100} height={100} />}
      </Card>
    );
  }

  if (card.kind === "continue" && preview) {
    const initiativePreview = preview.content === defaultInitiativeLine;
    return (
      <ContinueCard 
        label={initiativePreview ? "unread from candor" : "still open"}
        teaser={previewTeaser}
        onClick={() => isSignedIn && router.push(`/candor/session/${CANDOR_THREAD_ID}`)}
      />
    );
  }

  if (card.kind === "signal") {
    // If we have a real signal, map it to SignalCard
    // Otherwise fallback to something generic or the first option
    return (
      <SignalCard 
        type={signal?.title || "Hear Me Out"}
        content={signal?.prompt || "loading a signal..."}
        options={signal && !signalAnswered ? signal.options : undefined}
        onSelectOption={handleSignalAnswer}
      />
    );
  }

  if (card.kind === "align") {
    if (!isSignedIn || !primaryAlign) {
      return (
        <MemoryCard observation={!isSignedIn ? "sign in to see familiar energies." : "not enough signals yet. keep responding to find overlays."} />
      );
    }
    return (
      <AlignCard 
        username={primaryAlign.username}
        initials={primaryAlign.initials}
        tier={primaryAlign.resonance}
        observation={primaryAlign.insight}
        avatarTone={primaryAlign.tone}
        onClick={() => router.push(`/candor/aligns/${primaryAlign.id}`)}
      />
    );
  }

  if (card.kind === "tonight") {
    const tonightItems = [{ label: "music" }, { label: "late nights" }, { label: "film" }];
    return (
      <CommunityAtmosphereCard 
        ambientThought={`tonight is about ${tonightItems.map((item: { label: string }) => item.label).join(", ")}.`}
      />
    );
  }

  if (card.kind === "community") {
    return (
      <CommunityAtmosphereCard 
        ambientThought={adaptiveHome.community.line}
      />
    );
  }

  if (card.kind === "reflection") {
    return (
      <OpenLoopCard 
        topic={adaptiveHome.reflectionLine}
        onClick={() => selectPrompt(`let's talk about this pattern: "${adaptiveHome.reflectionLine}"`)}
      />
    );
  }

  if (card.kind === "soundtrack") {
    return (
      <SoundtrackCard 
        title={adaptiveHome.soundtrack.title}
        artist={adaptiveHome.soundtrack.artist}
        reason={adaptiveHome.soundtrack.note}
        coverUrl={adaptiveHome.soundtrack.coverUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80"}
        onPlay={() => window.open(input.soundtrackUrl, "_blank")}
      />
    );
  }

  if (card.kind === "movie") {
    return (
      <MovieCard 
        title={adaptiveHome.movie.title}
        reason={adaptiveHome.movie.note}
        posterUrl={adaptiveHome.movie.posterUrl || "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80"}
      />
    );
  }

  if (card.kind === "visual_memory") {
    return (
      <VisualMemoryCard 
        text={adaptiveHome.visualMemory.line}
        imageUrl={adaptiveHome.visualMemory.imageUrl}
      />
    );
  }

  if (card.kind === "mood_collage") {
    return (
      <MoodCollageCard 
        images={adaptiveHome.moodCollage.images}
      />
    );
  }

  if (card.kind === "random_object") {
    return (
      <RandomObjectCard 
        type={adaptiveHome.randomObject.type}
        imageUrl={adaptiveHome.randomObject.imageUrl}
        text={adaptiveHome.randomObject.text}
      />
    );
  }

  if (card.kind === "open_loop" && adaptiveHome.openLoop) {
    return (
      <OpenLoopCard 
        topic={adaptiveHome.openLoop.line}
        onClick={() => selectPrompt(`you mentioned this before: "${adaptiveHome.openLoop?.line}"`)}
      />
    );
  }

  if (card.kind === "memory") {
    const memoryItem = memoryPreview?.notes?.[Math.floor(Math.random() * (memoryPreview.notes.length || 1))] 
      || memoryPreview?.softSpots?.[0] 
      || `${adaptiveHome.surprise.line}. ${adaptiveHome.surprise.detail}`;
    return <MemoryCard observation={memoryItem} />;
  }

  if (card.kind === "thought") {
    const thoughts = [
      "i miss places more than people.", 
      "some cities keep living inside you.", 
      "i trust slow replies.",
      "i still reread old chats."
    ];
    const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
    return <MemoryCard observation={`"${randomThought}"`} />;
  }
  
  if (card.kind === "recommendation") {
    return <MemoryCard observation={`${adaptiveHome.recommendation.line} ${adaptiveHome.recommendation.detail}`} />;
  }

  return <div className="hidden" />;
}

function teaseLine(content: string) {
  const clean = content.replace(/\s+/g, " ").replace(/^["']|["']$/g, "").trim();
  if (clean.length <= 92) return clean;
  const clipped = clean.slice(0, 92);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, lastSpace > 0 ? lastSpace : clipped.length)}...`;
}

function alignInsightForScore(score: number) {
  if (score >= 13) return "conversation tends to stay around films, creativity, and unusually specific opinions.";
  if (score >= 10) return "you both disappear when overwhelmed, then return like nothing happened.";
  if (score >= 7) return "there is a familiar rhythm around taste, quiet ambition, and late replies.";
  return "a small overlap is forming. not loud yet, but recognizable.";
}

function buildYouTonight(memory: CandorMemory | null) {
  const current = memory?.profileV4?.currently;
  const rankedInterest = Object.entries(memory?.interactionProfile.interestSignals ?? {}).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];

  const items = [
    current?.watching ? { icon: Film, label: `watching ${current.watching}` } : null,
    current?.building ? { icon: Laptop, label: `building ${current.building}` } : null,
    current?.listening ? { icon: Music, label: `listening to ${current.listening}` } : null,
    current?.thinking ? { icon: Cloud, label: `thinking about ${current.thinking}` } : null,
  ].filter(Boolean) as Array<{ icon: typeof Moon; label: string }>;

  if (items.length >= 3) return items.slice(0, 3);

  return [
    ...items,
    { icon: Moon, label: "awake" },
    { icon: rankedInterest === "movies" ? Film : Laptop, label: rankedInterest ? `circling ${rankedInterest}` : "building" },
    { icon: Cloud, label: "thinking" },
  ].slice(0, 3);
}
