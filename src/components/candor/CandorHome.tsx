"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Check,
  Cloud,
  Film,
  Laptop,
  Moon,
  Music,
  Quote,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/candor/BottomNav";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { useAuth } from "@/contexts/AuthContext";
import { buildAdaptiveHome, type CandorHomeCardSpec } from "@/lib/candor/personalization";
import { CANDOR_THREAD_ID, candorThreadStorageKey } from "@/lib/candor/thread";
import type { CandorSignal } from "@/lib/candor/scenarios";
import type { CandorMemory } from "@/lib/candor/types";

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

export function CandorHome() {
  const [message, setMessage] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
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

      const list = data.aligns.slice(0, 2).map((align: {
        id: string;
        profile: { username: string; avatarInitials: string; avatarTone: string };
        score: number;
      }) => ({
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

      const data = (await response.json()) as {
        id: string;
        persisted?: boolean;
        message?: { id: string; role: "ai"; content: string } | null;
      };

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
  const primaryMoodCard = adaptiveHome.cards.find((card) => card.kind === "community" || card.kind === "soundtrack");

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

      <main className="gradient-bg grain relative min-h-screen overflow-x-hidden px-6 pb-44 pt-20">
        <AmbientGlow />
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[12%] top-24 h-48 w-48 rounded-full bg-[hsl(var(--glow)/0.08)] blur-3xl" />
          <div className="absolute bottom-28 right-[10%] h-56 w-56 rounded-full bg-[hsl(var(--accent)/0.07)] blur-3xl" />
        </div>

        <section className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.6fr)]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[2rem] border border-border/35 bg-[linear-gradient(135deg,hsl(var(--card)/0.36),hsl(var(--background)/0.18))] px-6 py-7 backdrop-blur-md sm:px-8"
            >
              <motion.div
                aria-hidden
                animate={{ x: [0, 26, 0], opacity: [0.24, 0.4, 0.24] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-10 -top-8 h-32 w-32 rounded-full bg-[hsl(var(--accent)/0.12)] blur-3xl"
              />
              <p className="mb-3 text-xs font-light uppercase tracking-[0.18em] text-foreground-secondary/70">
                {isSignedIn ? `hey ${username}` : "the thread continues quietly"}
              </p>
              <h1 className="max-w-3xl text-4xl font-light leading-[1.02] tracking-tight sm:text-5xl xl:text-[4.25rem]">
                {adaptiveHome.heroPrompt}
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-foreground-secondary">
                desktop should feel like a quiet place you leave open. the wall adjusts as candor learns what belongs near you.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="surface soft-shadow relative h-full overflow-hidden border-border/35 bg-card/30 backdrop-blur-md">
                <motion.div
                  aria-hidden
                  animate={{ opacity: [0.08, 0.18, 0.08], x: [-8, 8, -8] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-0 right-0 h-24 w-40 rounded-full bg-[hsl(var(--accent)/0.16)] blur-3xl"
                />
                <CardContent className="relative flex h-full flex-col gap-3 p-5 sm:p-6">
                  <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
                    {primaryMoodCard?.kind === "soundtrack" ? <Music className="h-3.5 w-3.5 text-accent" /> : <Users className="h-3.5 w-3.5 text-accent" />}
                    {primaryMoodCard?.kind === "soundtrack" ? "tonight's soundtrack" : adaptiveHome.community.label}
                  </div>
                  {primaryMoodCard?.kind === "soundtrack" ? (
                    <>
                      <p className="text-2xl font-light leading-8 text-foreground">{adaptiveHome.soundtrack.title}</p>
                      <p className="text-sm font-light text-foreground-secondary">{adaptiveHome.soundtrack.artist}</p>
                      <p className="max-w-sm text-sm font-light leading-6 text-foreground-secondary">{adaptiveHome.soundtrack.note}</p>
                      <a
                        href={soundtrackUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-auto inline-flex items-center gap-1 text-sm font-light text-accent hover:underline"
                      >
                        open spotify <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-light leading-8 text-foreground">{adaptiveHome.community.line}</p>
                      <p className="max-w-sm text-sm font-light leading-6 text-foreground-secondary">{adaptiveHome.community.detail}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="candor-desktop-wall">
            {adaptiveHome.cards.map((card, index) => (
              <motion.div
                key={`${card.kind}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="candor-wall-card"
              >
                {renderHomeCard({
                  card,
                  isSignedIn,
                  isFetchingAligns,
                  isFetchingSignal,
                  preview,
                  previewTeaser,
                  signal,
                  signalAnswered,
                  primaryAlign,
                  adaptiveHome,
                  reflection,
                  tonightItems,
                  soundtrackUrl,
                  router,
                  fetchSignal,
                  handleSignalAnswer,
                  selectPrompt,
                })}
              </motion.div>
            ))}
          </div>
        </section>

        <div className="fixed inset-x-6 bottom-24 z-[100] pointer-events-none">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto mx-auto flex w-full max-w-[900px] flex-col gap-3"
          >
            <div className="relative flex w-full items-center">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,hsl(var(--foreground)/0.03),transparent)]" />
              <motion.input
                id="candor-home-input"
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder={isInputFocused ? "what's been stuck in your head?" : "start with the thing you actually care about"}
                animate={{ paddingRight: message.length > 0 || isStarting ? 60 : 160, scaleX: isInputFocused ? 1.01 : 1 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="h-14 w-full origin-center rounded-full border border-border/50 bg-background/45 pl-6 text-base font-light text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:border-accent/40 focus:ring-1 focus:ring-accent/40"
              />

              <div className="absolute right-1.5 flex items-center">
                {isLoaded && isSignedIn ? (
                  <motion.button
                    type="submit"
                    disabled={!message.trim() || isStarting}
                    animate={{
                      width: message.length > 0 || isStarting ? 44 : "auto",
                      paddingLeft: message.length > 0 || isStarting ? 0 : 20,
                      paddingRight: message.length > 0 || isStarting ? 0 : 20,
                      scale: message.length > 0 ? 0.96 : 1,
                    }}
                    whileHover={!message.trim() || isStarting ? {} : { scale: 1.03 }}
                    whileTap={!message.trim() || isStarting ? {} : { scale: 0.97 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="flex h-11 items-center justify-center overflow-hidden rounded-full bg-accent text-sm font-medium text-primary-foreground transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {isStarting ? (
                        <motion.div
                          key="dots"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1"
                        >
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                        </motion.div>
                      ) : message.length > 0 ? (
                        <motion.div
                          key="arrow"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.15 }}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="text"
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 5 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center whitespace-nowrap"
                        >
                          {preview ? "keep it going" : "open the thread"}
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ) : (
                  <button
                    type="button"
                    disabled={!isLoaded}
                    onClick={() => router.push(`/candor/login?next=${encodeURIComponent("/candor/home")}`)}
                    className="flex h-11 items-center gap-1 rounded-full bg-accent px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent/90"
                  >
                    sign in
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {error ? <p className="text-right text-xs font-light leading-5 text-foreground-secondary">{error}</p> : null}
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
  isFetchingAligns: boolean;
  isFetchingSignal: boolean;
  preview: PreviewMessage | null;
  previewTeaser: string;
  signal: CandorSignal | null;
  signalAnswered: string | null;
  primaryAlign: AlignPreview | null;
  adaptiveHome: ReturnType<typeof buildAdaptiveHome>;
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
    isFetchingAligns,
    isFetchingSignal,
    preview,
    previewTeaser,
    signal,
    signalAnswered,
    primaryAlign,
    adaptiveHome,
    tonightItems,
    soundtrackUrl,
    router,
    fetchSignal,
    handleSignalAnswer,
    selectPrompt,
  } = input;

  if (card.kind === "continue" && preview) {
    const initiativePreview = preview.content === defaultInitiativeLine;
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-accent/20 bg-[linear-gradient(135deg,hsl(var(--accent)/0.07),hsl(var(--card)/0.42))] backdrop-blur-md">
        <motion.div
          aria-hidden
          animate={{ opacity: [0.18, 0.34, 0.18] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-accent/20 blur-2xl"
        />
        <CardContent className="relative flex flex-col gap-2.5 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-4 text-xs font-light text-foreground-secondary">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent/80 shadow-[0_0_14px_hsl(var(--accent)/0.65)] animate-[candor-breathe_3.2s_ease-in-out_infinite]" />
              {initiativePreview ? "unread from candor" : "still open"}
            </span>
            {isSignedIn ? (
              <button
                type="button"
                onClick={() => router.push(`/candor/session/${CANDOR_THREAD_ID}`)}
                className="flex items-center gap-1 text-foreground transition-colors hover:text-accent hover:underline"
              >
                continue <ArrowRight className="h-3 w-3" />
              </button>
            ) : null}
          </div>
          <p className="line-clamp-2 max-w-[32rem] text-[15px] font-light leading-6 text-foreground">{previewTeaser}</p>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "signal") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <motion.div
          aria-hidden
          animate={{ rotate: [0, 2, 0], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-[hsl(var(--glow)/0.5)] blur-3xl"
        />
        <CardContent className="relative flex flex-col gap-5 p-5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-light uppercase tracking-[0.22em] text-accent">{signal?.title || "signal"}</span>
            <button
              onClick={() => {
                if (signal) void fetchSignal(signal.id);
              }}
              className="rounded-full p-2 text-foreground-secondary transition-colors hover:bg-background/40 hover:text-foreground"
              title="Next signal"
              disabled={isFetchingSignal}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetchingSignal ? "animate-spin" : ""}`} />
            </button>
          </div>

          <button type="button" className="text-left" onClick={() => router.push("/candor/signals")}>
            <p className="pr-2 text-[1.35rem] font-light leading-8 text-foreground">{signal?.prompt || "loading a signal..."}</p>
          </button>

          {signal ? (
            <div className="mt-1">
              {!signalAnswered ? (
                <div className="flex flex-wrap gap-3">
                  {signal.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => void handleSignalAnswer(option)}
                      className="min-h-11 rounded-full border border-border/50 bg-background/25 px-5 py-2.5 text-sm font-light text-foreground-secondary transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-foreground active:scale-[0.98]"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : signal.outcomeType === "conversation_worthy" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-light text-accent">i didn't expect that answer.</p>
                  <button
                    onClick={() => selectPrompt(`[system: user answered "${signalAnswered}" to "${signal.prompt}"]`)}
                    className="self-start rounded-full bg-accent px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-accent/90"
                  >
                    continue with candor
                  </button>
                </div>
              ) : signal.outcomeType === "community_reveal" && signal.communitySplit ? (
                <div className="space-y-2">
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/20">
                    <div className="bg-accent transition-all duration-1000" style={{ width: `${signal.communitySplit[0]}%` }} />
                    <div className="bg-foreground-secondary/30 transition-all duration-1000" style={{ width: `${100 - signal.communitySplit[0]}%` }} />
                  </div>
                  <div className="flex justify-between text-xs font-light text-foreground-secondary/80">
                    <span>{signal.communitySplit[0]}% chose "{signal.options[0]}"</span>
                    <span>{100 - signal.communitySplit[0]}% chose "{signal.options[1]}"</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-light text-accent/90">
                  <Check className="h-4 w-4" />
                  <span>{signal.outcomeType === "candor_learns" ? "added to your rhythm" : "saved."}</span>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "align") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
              <Sparkles className="h-3 w-3 text-accent" />
              aligns nearby
            </span>
            <button
              onClick={() => router.push("/candor/aligns")}
              className="text-xs font-light text-foreground-secondary transition-colors hover:text-accent hover:underline"
            >
              see all
            </button>
          </div>
          {!isSignedIn ? (
            <p className="text-sm font-light text-foreground-secondary/60">your aligns come later. sign in to see familiar energies.</p>
          ) : isFetchingAligns ? (
            <div className="space-y-2 py-1">
              <div className="h-4 w-32 animate-pulse rounded bg-foreground/10" />
              <div className="h-4 w-40 animate-pulse rounded bg-foreground/10" />
            </div>
          ) : primaryAlign ? (
            <button
              type="button"
              onClick={() => router.push(`/candor/aligns/${primaryAlign.id}`)}
              className="group flex w-full items-center gap-4 rounded-xl p-1.5 text-left transition-colors hover:bg-background/20"
            >
              <motion.div
                animate={{ opacity: [0.72, 1, 0.72], scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Avatar className="h-14 w-14 border border-accent/25 shadow-[0_0_28px_-16px_hsl(var(--accent)/0.9)]">
                  <AvatarFallback className="text-sm font-light" style={{ background: primaryAlign.tone }}>
                    {primaryAlign.initials}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-base font-light text-foreground transition-colors group-hover:text-accent">{primaryAlign.username}</p>
                  <span className="shrink-0 rounded-full border border-accent/25 px-2.5 py-1 text-[10px] font-light uppercase tracking-[0.12em] text-accent/85">
                    {primaryAlign.resonance}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-light leading-6 text-foreground-secondary">{primaryAlign.insight}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-foreground-secondary transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
            </button>
          ) : (
            <p className="text-sm font-light text-foreground-secondary/60">not enough signals yet. keep responding to signals to find overlays.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "tonight") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
            <Moon className="h-3.5 w-3.5 text-accent" />
            tonight
          </div>
          <div className="flex flex-col gap-2.5">
            {tonightItems.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm font-light text-foreground-secondary">
                <item.icon className="h-3.5 w-3.5 text-accent/80" />
                <span className="truncate text-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "community") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <motion.div
          aria-hidden
          animate={{ opacity: [0.08, 0.2, 0.08], x: [-8, 8, -8] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-0 h-24 w-40 rounded-full bg-[hsl(var(--accent)/0.18)] blur-3xl"
        />
        <CardContent className="relative flex flex-col gap-3 p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
            <Users className="h-3.5 w-3.5 text-accent" />
            {adaptiveHome.community.label}
          </div>
          <p className="text-xl font-light leading-8 text-foreground">{adaptiveHome.community.line}</p>
          <p className="text-sm font-light leading-6 text-foreground-secondary">{adaptiveHome.community.detail}</p>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "reflection") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-l-2 border-l-accent/60 border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
            <Brain className="h-3.5 w-3.5 text-accent" />
            {adaptiveHome.reflectionLabel}
          </div>
          <p className="pr-6 text-base font-light leading-7 text-foreground">{adaptiveHome.reflectionLine}</p>
          <button
            onClick={() => selectPrompt(`let's talk about this pattern: "${adaptiveHome.reflectionLine}"`)}
            className="mt-1 flex items-center gap-1 self-start text-xs font-light text-accent hover:underline"
          >
            open <ArrowRight className="h-3 w-3" />
          </button>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "soundtrack") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
            <Music className="h-3.5 w-3.5 text-accent" />
            tonight's soundtrack
          </div>
          <p className="text-2xl font-light leading-8 text-foreground">{adaptiveHome.soundtrack.title}</p>
          <p className="text-sm font-light text-foreground-secondary">{adaptiveHome.soundtrack.artist}</p>
          <p className="text-sm font-light leading-6 text-foreground-secondary">{adaptiveHome.soundtrack.note}</p>
          <a href={soundtrackUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm font-light text-accent hover:underline">
            play <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "movie") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
            <Film className="h-3.5 w-3.5 text-accent" />
            {adaptiveHome.movie.context}
          </div>
          <p className="text-xl font-light leading-8 text-foreground">{adaptiveHome.movie.title}</p>
          <p className="text-sm font-light leading-6 text-foreground-secondary">{adaptiveHome.movie.note}</p>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "open_loop" && adaptiveHome.openLoop) {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">{adaptiveHome.openLoop.label}</div>
          <p className="text-lg font-light leading-8 text-foreground">"{adaptiveHome.openLoop.line}"</p>
          <button
            onClick={() => selectPrompt(`you mentioned this before: "${adaptiveHome.openLoop?.line}"`)}
            className="inline-flex items-center gap-1 self-start text-sm font-light text-accent hover:underline"
          >
            continue <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "memory") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
            <Quote className="h-3.5 w-3.5 text-accent" />
            memory
          </div>
          <p className="text-lg font-light leading-8 text-foreground">{adaptiveHome.surprise.line}</p>
          <p className="text-xs font-light leading-5 text-foreground-secondary/70">{adaptiveHome.surprise.detail}</p>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "thought") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">{adaptiveHome.surprise.label}</div>
          <p className="text-lg font-light leading-8 text-foreground">{adaptiveHome.surprise.line}</p>
          <p className="text-xs font-light leading-5 text-foreground-secondary/70">{adaptiveHome.surprise.detail}</p>
        </CardContent>
      </Card>
    );
  }

  if (card.kind === "recommendation") {
    return (
      <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
        <CardContent className="flex flex-col gap-3 p-5">
          <div className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">{adaptiveHome.recommendation.label}</div>
          <p className="text-lg font-light leading-8 text-foreground">{adaptiveHome.recommendation.line}</p>
          <p className="text-sm font-light leading-6 text-foreground-secondary">{adaptiveHome.recommendation.detail}</p>
        </CardContent>
      </Card>
    );
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
  const rankedInterest = Object.entries(memory?.interactionProfile.interestSignals ?? {}).sort(([, a], [, b]) => b - a)[0]?.[0];

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
