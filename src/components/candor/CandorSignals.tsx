"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowRight, Brain, Check, RefreshCw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BottomNav } from "@/components/candor/BottomNav";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { useAuth } from "@/contexts/AuthContext";
import { CANDOR_THREAD_ID, candorThreadStorageKey } from "@/lib/candor/thread";
import type { CandorSignal } from "@/lib/candor/scenarios";

export function CandorSignals() {
  const { isSignedIn, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [signals, setSignals] = useState<CandorSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startingChatId, setStartingChatId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetchSignals();
  }, [isSignedIn]);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/candor/signals?limit=12");
      if (!res.ok) return;
      const data = await res.json();
      if (data.signals?.length) {
        setSignals(data.signals);
        setAnswers({});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (signal: CandorSignal, option: string) => {
    setAnsweringId(signal.id);
    setAnswers((prev) => ({ ...prev, [signal.id]: option }));

    if (isSignedIn) {
      try {
        const res = await fetch("/api/candor/signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalId: signal.id, option }),
        });

        if (res.ok && signal.outcomeType === "candor_learns") {
          showToast("added to your rhythm");
        }
      } catch (e) {
        console.error(e);
      }
    } else if (signal.outcomeType === "candor_learns") {
      showToast("choice captured locally");
    }

    setAnsweringId(null);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleContinueWithCandor = async (signal: CandorSignal, option: string) => {
    if (!isSignedIn) {
      router.push(`/candor/login?next=${encodeURIComponent("/candor/signals")}`);
      return;
    }

    setStartingChatId(signal.id);
    const context = `[system: user responded "${option}" to "${signal.prompt}"]`;

    try {
      const response = await fetch("/api/candor/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: context, currentScreen: pathname }),
      });

      if (!response.ok) return;
      const data = await response.json();
      if (data.persisted === false && user?.id) {
        const initialMessages = [
          { id: crypto.randomUUID(), role: "user" as const, content: context },
          ...(data.message ? [data.message] : []),
        ];
        window.localStorage.setItem(candorThreadStorageKey(user.id), JSON.stringify(initialMessages));
      }
      router.push(`/candor/session/${data.id || CANDOR_THREAD_ID}`);
    } catch (e) {
      console.error(e);
    } finally {
      setStartingChatId(null);
    }
  };

  const orderedSignals = useMemo(
    () => [...signals].sort((a, b) => weightSignal(b) - weightSignal(a)),
    [signals],
  );

  return (
    <>
      <main className="gradient-bg grain relative min-h-screen overflow-x-hidden px-6 pb-40 pt-20">
        <AmbientGlow />
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[15%] top-24 h-48 w-48 rounded-full bg-[hsl(var(--glow)/0.08)] blur-3xl" />
          <div className="absolute bottom-28 right-[15%] h-56 w-56 rounded-full bg-[hsl(var(--accent)/0.06)] blur-3xl" />
        </div>

        <section className="relative z-10 mx-auto flex max-w-[1400px] flex-col gap-8">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">signals</h1>
            <p className="mt-3 max-w-2xl text-sm font-light leading-6 text-foreground-secondary">
              not a feed. a wall of prompt energy. candor should keep surfacing the kinds of questions that actually belong near you.
            </p>
          </motion.div>

          <AnimatePresence>
            {toastMessage ? (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed left-1/2 top-6 z-[150] -translate-x-1/2 rounded-full border border-accent/30 bg-card/70 px-4 py-2.5 text-xs font-light text-accent shadow-lg backdrop-blur-md"
              >
                {toastMessage}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="candor-desktop-wall">
            {orderedSignals.map((signal, index) => {
              const answeredOption = answers[signal.id];
              return (
                <motion.div
                  key={signal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.45 }}
                  className="candor-wall-card"
                >
                  <Card className={`surface overflow-hidden border border-border/40 bg-card/30 backdrop-blur-md transition-colors hover:border-accent/20 ${signalCardHeight(signal)}`}>
                    <CardContent className="flex h-full flex-col gap-4 p-5">
                      <div className="flex items-center justify-between text-[10px] font-light uppercase tracking-[0.2em] text-accent">
                        <span>{signal.title}</span>
                        <span className="text-[9px] text-foreground-secondary/40">{signal.category}</span>
                      </div>

                      <p className={`font-light text-foreground ${signalTextSize(signal)}`}>
                        {signal.prompt}
                      </p>

                      <div className="mt-auto">
                        {!answeredOption ? (
                          <div className="flex flex-wrap gap-3">
                            {signal.options.map((option) => (
                              <button
                                key={option}
                                disabled={answeringId === signal.id}
                                onClick={() => void handleSelectOption(signal, option)}
                                className="min-h-11 rounded-full border border-border/50 bg-background/25 px-5 py-2.5 text-sm font-light text-foreground-secondary transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                            {signal.outcomeType === "community_reveal" && signal.communitySplit ? (
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
                            ) : signal.outcomeType === "candor_learns" ? (
                              <div className="flex items-center gap-1.5 text-xs font-light text-accent/90">
                                <Check className="h-4 w-4" />
                                <span>added to your rhythm profile</span>
                              </div>
                            ) : signal.outcomeType === "conversation_worthy" ? (
                              <div className="flex flex-col gap-2.5">
                                <p className="flex items-center gap-1 text-xs font-light text-accent">
                                  <Brain className="h-3.5 w-3.5" /> i didn't expect that answer.
                                </p>
                                <button
                                  disabled={startingChatId === signal.id}
                                  onClick={() => void handleContinueWithCandor(signal, answeredOption)}
                                  className="self-start rounded-full bg-accent px-4 py-2 text-xs font-medium text-primary-foreground transition-all hover:bg-accent/90 active:scale-[0.98] disabled:opacity-50"
                                >
                                  {startingChatId === signal.id ? "connecting thread..." : "continue with candor"}
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs font-light text-foreground-secondary/70">
                                <Check className="h-3.5 w-3.5 text-accent" />
                                <span>saved.</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {!loading && orderedSignals.length === 0 ? (
            <Card className="surface border border-border/40 bg-card/30 backdrop-blur-md">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-sm font-light text-foreground-secondary">
                <AlertCircle className="h-6 w-6 text-accent/60" />
                no signals available right now. check back later.
              </CardContent>
            </Card>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-6 text-xs font-light text-foreground-secondary">
              <RefreshCw className="h-4 w-4 animate-spin text-accent" />
              generating new signals...
            </div>
          ) : orderedSignals.length > 0 ? (
            <div className="flex justify-center pt-2 pb-4">
              <button
                onClick={() => void fetchSignals()}
                className="flex items-center gap-2 rounded-full border border-border/50 bg-background/30 px-5 py-2.5 text-xs font-light text-foreground-secondary transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-foreground active:scale-[0.98]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                new signals
              </button>
            </div>
          ) : null}
        </section>

        <BottomNav />
      </main>
    </>
  );
}

function weightSignal(signal: CandorSignal) {
  const titleWeight = signal.title.includes("too real") ? 6 : signal.title.includes("hear me out") ? 5 : 3;
  const categoryWeight = signal.category === "emotional" ? 5 : signal.category === "flirty" ? 4 : signal.category === "funny" ? 3 : 2;
  return titleWeight + categoryWeight + signal.options.length;
}

function signalCardHeight(signal: CandorSignal) {
  if (signal.outcomeType === "conversation_worthy" || signal.options.length >= 4) return "min-h-[290px]";
  if (signal.category === "emotional" || signal.category === "deep") return "min-h-[260px]";
  return "min-h-[220px]";
}

function signalTextSize(signal: CandorSignal) {
  if (signal.category === "emotional" || signal.category === "deep") return "text-[1.2rem] leading-8";
  return "text-lg leading-8";
}
