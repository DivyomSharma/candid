"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Compass, RefreshCw, Sparkles, Brain, Check, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { CANDOR_THREAD_ID, candorThreadStorageKey } from "@/lib/candor/thread";
import type { CandorSignal } from "@/lib/candor/scenarios";

type PreviewMessage = { role: "user" | "ai"; content: string };
type AlignPreview = { id: string; username: string; initials: string; tone: string; resonance: string };

const defaultInitiativeLine = "i have a feeling your algorithm knows too much about you already";
const fallbackReflection = "you've been choosing certainty over novelty lately.";

export function CandorHome() {
  const [message, setMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PreviewMessage | null>(null);

  // V3 Dashboard data
  const [signal, setSignal] = useState<CandorSignal | null>(null);
  const [isFetchingSignal, setIsFetchingSignal] = useState(false);
  const [signalAnswered, setSignalAnswered] = useState<string | null>(null);
  
  const [aligns, setAligns] = useState<AlignPreview[]>([]);
  const [isFetchingAligns, setIsFetchingAligns] = useState(false);
  
  const [reflection, setReflection] = useState(fallbackReflection);
  const [isFetchingReflection, setIsFetchingReflection] = useState(false);

  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

  // Load preview message
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

  // Load signal, aligns, reflection
  useEffect(() => {
    fetchSignal();
    fetchAligns();
    fetchReflection();
  }, [isSignedIn, user?.id]);

  const fetchSignal = async (excludeId?: string) => {
    setIsFetchingSignal(true);
    try {
      const url = excludeId ? `/api/candor/signals?limit=1&excludeId=${excludeId}` : "/api/candor/signals?limit=1";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.signals && data.signals.length > 0) {
          setSignal(data.signals[0]);
          setSignalAnswered(null);
        }
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
      if (res.ok) {
        const data = await res.json();
        if (data.ready && data.aligns) {
          const list = data.aligns.slice(0, 2).map((a: any) => ({
            id: a.id,
            username: a.profile.username,
            initials: a.profile.avatarInitials,
            tone: a.profile.avatarTone,
            resonance: a.score >= 13 ? "candid" : a.score >= 10 ? "magnetic" : a.score >= 7 ? "natural flow" : "familiar"
          }));
          setAligns(list);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingAligns(false);
    }
  };

  const fetchReflection = async () => {
    if (!isSignedIn) return;
    setIsFetchingReflection(true);
    try {
      const res = await fetch("/api/candor/me/continuity");
      if (res.ok) {
        const data = await res.json();
        if (data.continuity?.weeklyReflection) {
          setReflection(data.continuity.weeklyReflection);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingReflection(false);
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
        body: JSON.stringify({ message: content.trim() }),
      });

      if (response.ok) {
        const data = (await response.json()) as {
          id: string;
          persisted?: boolean;
          warning?: string;
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
        return;
      }

      if (response.status === 401) {
        setError("sign in first, then this can stay with you.");
      } else {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        if (data.error === "missing_supabase_env") {
          setError("database is not connected yet. add supabase keys.");
        } else {
          setError("something did not open. check environment.");
        }
      }
    } catch {
      setError("the connection did not answer. try again.");
    } finally {
      if (!success) {
        setIsStarting(false);
      }
    }
  };

  const selectPrompt = (content: string) => {
    setMessage(content);
    setError("");
    void start(content);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void start(message);
  };

  const handleSignalAnswer = async (option: string) => {
    if (!signal) return;
    setSignalAnswered(option);

    if (isSignedIn) {
      try {
        await fetch("/api/candor/signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalId: signal.id, option })
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const isInitiativePreview = preview?.content === defaultInitiativeLine;
  const username = user?.firstName?.toLowerCase() || user?.email?.split("@")[0]?.toLowerCase() || "there";

  return (
    <>
      <AnimatePresence>
        {isStarting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.25, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-[250px] w-[250px] rounded-full bg-accent blur-[80px]"
              />
              <motion.div
                animate={{ 
                  filter: ["blur(4px)", "blur(0px)", "blur(4px)"],
                  opacity: [0.4, 1, 0.4],
                  scale: [0.97, 1, 0.97]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 text-4xl font-light tracking-[0.25em] text-foreground"
              >
                candor
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="gradient-bg grain relative flex min-h-screen flex-col overflow-x-hidden px-6 pb-44 pt-20">
        <AmbientGlow />
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[12%] top-24 h-48 w-48 rounded-full bg-[hsl(var(--glow)/0.08)] blur-3xl" />
          <div className="absolute bottom-28 right-[10%] h-56 w-56 rounded-full bg-[hsl(var(--accent)/0.07)] blur-3xl" />
        </div>
        
        <section className="relative z-10 mx-auto flex w-full max-w-[600px] flex-1 flex-col gap-6">
          {/* 1. HERO */}
          <motion.div 
            initial={{ opacity: 0, y: 18 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-2"
          >
            <p className="mb-2.5 text-xs uppercase tracking-[0.15em] font-light text-foreground-secondary/70">
              {isSignedIn ? `hey ${username}` : "the thread continues quietly"}
            </p>
            <h1 className="text-3xl font-light tracking-tight md:text-[3.2rem] leading-[1.05]">
              what feels alive tonight?
            </h1>
          </motion.div>

          {/* 2. CONTINUE WITH CANDOR */}
          {preview ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="surface soft-shadow relative overflow-hidden border-accent/20 bg-[linear-gradient(135deg,hsl(var(--accent)/0.06),hsl(var(--card)/0.45))] backdrop-blur-md">
                <CardContent className="flex flex-col gap-3.5 p-5">
                  <div className="flex items-center justify-between gap-4 text-xs font-light text-foreground-secondary">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-accent/80 shadow-[0_0_14px_hsl(var(--accent)/0.65)] animate-[candor-breathe_3.2s_ease-in-out_infinite]" />
                      {isInitiativePreview ? "unread from candor" : "still open between you two"}
                    </span>
                    {isSignedIn ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/candor/session/${CANDOR_THREAD_ID}`)}
                        className="text-foreground transition-colors hover:text-accent flex items-center gap-1 hover:underline"
                      >
                        continue <ArrowRight className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>
                  <p className="max-w-[34rem] text-sm font-light leading-6 text-foreground-secondary break-words">
                    {preview.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          {/* 3. SIGNALS PREVIEW */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md min-h-[160px] flex flex-col justify-between">
              <CardContent className="p-5 flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-light uppercase tracking-[0.2em] text-accent">
                    ✨ {signal?.title || "signal"}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (signal) fetchSignal(signal.id);
                    }}
                    className="p-1 text-foreground-secondary hover:text-foreground hover:bg-background/40 rounded-full transition-colors"
                    title="Next signal"
                    disabled={isFetchingSignal}
                  >
                    <RefreshCw className={`h-3 w-3 ${isFetchingSignal ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div 
                  className="cursor-pointer group flex-1"
                  onClick={() => router.push("/candor/signals")}
                >
                  <p className="text-base font-light text-foreground leading-6 pr-4 hover:text-foreground/90 transition-colors">
                    {signal?.prompt || "loading a signal..."}
                  </p>
                </div>

                {signal && (
                  <div className="mt-3">
                    {!signalAnswered ? (
                      <div className="flex flex-wrap gap-2">
                        {signal.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleSignalAnswer(opt)}
                            className="rounded-full border border-border/50 bg-background/20 px-3.5 py-1.5 text-xs font-light text-foreground-secondary transition-all hover:bg-accent/10 hover:border-accent/40 hover:text-foreground active:scale-[0.98]"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2.5 animate-fadeIn">
                        {/* Results reveal based on outcome type */}
                        {signal.outcomeType === "community_reveal" && signal.communitySplit ? (
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs font-light text-foreground-secondary mb-1">
                              <span>community split</span>
                              <span className="text-accent">see all signals →</span>
                            </div>
                            <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/20">
                              <div 
                                className="bg-accent transition-all duration-1000" 
                                style={{ width: `${signal.communitySplit[0]}%` }} 
                              />
                              <div 
                                className="bg-foreground-secondary/40 transition-all duration-1000" 
                                style={{ width: `${100 - signal.communitySplit[0]}%` }} 
                              />
                            </div>
                            <div className="flex justify-between text-[11px] font-light text-foreground-secondary/70">
                              <span>{signal.communitySplit[0]}% chose "{signal.options[0]}"</span>
                              <span>{100 - signal.communitySplit[0]}% chose "{signal.options[1]}"</span>
                            </div>
                          </div>
                        ) : signal.outcomeType === "candor_learns" ? (
                          <div className="flex items-center gap-1.5 text-xs font-light text-accent/80">
                            <Check className="h-3.5 w-3.5" />
                            <span>added to your rhythm</span>
                          </div>
                        ) : signal.outcomeType === "conversation_worthy" ? (
                          <div className="flex flex-col gap-2">
                            <p className="text-xs font-light text-accent">i didn't expect that answer.</p>
                            <button
                              onClick={() => selectPrompt(`[system: user answered "${signalAnswered}" to "${signal.prompt}"]`)}
                              className="self-start rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-accent/90 transition-colors flex items-center gap-1"
                            >
                              continue with candor <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          // TYPE A: quick_answer
                          <div className="text-xs font-light text-foreground-secondary/70 flex items-center justify-between">
                            <span>saved.</span>
                            <button 
                              onClick={() => router.push("/candor/signals")}
                              className="text-accent hover:underline flex items-center gap-1"
                            >
                              see all signals <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 4. ALIGNS PREVIEW */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
              <CardContent className="p-5 flex flex-col gap-3.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-accent" />
                    familiar energies
                  </span>
                  <button 
                    onClick={() => router.push("/candor/aligns")}
                    className="text-xs font-light text-foreground-secondary hover:text-accent transition-colors hover:underline"
                  >
                    see all →
                  </button>
                </div>

                {!isSignedIn ? (
                  <p className="text-sm font-light text-foreground-secondary/60">
                    your aligns come later. sign in to see familiar energies.
                  </p>
                ) : isFetchingAligns ? (
                  <div className="space-y-2 py-1">
                    <div className="h-4 w-32 rounded bg-foreground/10 animate-pulse" />
                    <div className="h-4 w-40 rounded bg-foreground/10 animate-pulse" />
                  </div>
                ) : aligns.length > 0 ? (
                  <div className="space-y-2.5">
                    {aligns.map((a) => (
                      <div 
                        key={a.id} 
                        onClick={() => router.push(`/candor/aligns/${a.id}`)}
                        className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-lg hover:bg-background/25 transition-colors"
                      >
                        <Avatar className="h-7 w-7 border border-border/60">
                          <AvatarFallback className="text-[10px] font-light" style={{ background: a.tone }}>
                            {a.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 items-center justify-between gap-2">
                          <span className="text-sm font-light text-foreground group-hover:text-accent transition-colors">
                            {a.username}
                          </span>
                          <span className="text-[10px] font-light border border-border/40 rounded-full px-2 py-0.5 text-foreground-secondary/80">
                            {a.resonance}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-light text-foreground-secondary/60">
                    not enough signals yet. keep responding to signals to find overlays.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* 5. CANDOR REFLECTION */}
          {isSignedIn && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="surface soft-shadow relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md border-l-2 border-l-accent/70">
                <CardContent className="p-5 flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/60">
                    <Brain className="h-3.5 w-3.5 text-accent" />
                    weekly reflection
                  </div>
                  
                  <p className="text-sm font-light leading-6 text-foreground pr-8">
                    "candor noticed: {reflection}"
                  </p>

                  <button
                    onClick={() => selectPrompt(`let's discuss what you noticed about me: "${reflection}"`)}
                    className="self-start text-xs font-light text-accent hover:underline flex items-center gap-1 mt-1"
                  >
                    see reflection <ArrowRight className="h-3 w-3" />
                  </button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </section>

        {/* 6. QUICK INPUT */}
        <div className="fixed inset-x-6 bottom-24 z-[100] pointer-events-none">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex w-full max-w-[600px] flex-col gap-3 pointer-events-auto"
          >
            <div className="relative flex w-full items-center">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,hsl(var(--foreground)/0.03),transparent)]" />
              <motion.input
                id="candor-home-input"
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="start with the thing you actually care about"
                animate={{ paddingRight: message.length > 0 || isStarting ? 60 : 160 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className="h-14 w-full rounded-full border border-border/50 bg-background/45 pl-6 text-base font-light text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-accent/40 focus:ring-1 focus:ring-accent/40 text-ellipsis overflow-hidden whitespace-nowrap"
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
                    }}
                    whileHover={(!message.trim() || isStarting) ? {} : { scale: 1.03 }}
                    whileTap={(!message.trim() || isStarting) ? {} : { scale: 0.97 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    className="h-11 rounded-full bg-accent flex items-center justify-center text-sm font-medium text-primary-foreground transition-colors hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
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
                          className="flex items-center justify-center"
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
                    className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-primary-foreground hover:bg-accent/90 transition-colors flex items-center gap-1"
                  >
                    sign in
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            {error && <p className="text-right text-xs font-light leading-5 text-foreground-secondary">{error}</p>}
          </motion.form>
        </div>
        
        <BottomNav />
      </main>
    </>
  );
}
