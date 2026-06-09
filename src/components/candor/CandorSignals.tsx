"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { Sparkles, Compass, RefreshCw, Check, ArrowRight, Brain, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { CANDOR_THREAD_ID, candorThreadStorageKey } from "@/lib/candor/thread";
import type { CandorSignal } from "@/lib/candor/scenarios";

export function CandorSignals() {
  const { isSignedIn, isLoaded, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [signals, setSignals] = useState<CandorSignal[]>([]);
  const [loading, setLoading] = useState(false);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startingChatId, setStartingChatId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSignals = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/candor/signals?limit=3`);
      if (res.ok) {
        const data = await res.json();
        if (data.signals && data.signals.length > 0) {
          setSignals(data.signals);
          setAnswers({});
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
  }, [isSignedIn]);

  const handleSelectOption = async (signal: CandorSignal, option: string) => {
    setAnsweringId(signal.id);
    setAnswers((prev) => ({ ...prev, [signal.id]: option }));

    if (isSignedIn) {
      try {
        const res = await fetch("/api/candor/signals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signalId: signal.id, option })
        });
        
        if (res.ok) {
          if (signal.outcomeType === "candor_learns") {
            showToast("✓ added to your rhythm");
          }
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      if (signal.outcomeType === "candor_learns") {
        showToast("✓ choice captured locally");
      }
    }
    setAnsweringId(null);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
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

      if (response.ok) {
        const data = await response.json();
        if (data.persisted === false && user?.id) {
          const initialMessages = [
            { id: crypto.randomUUID(), role: "user" as const, content: context },
            ...(data.message ? [data.message] : []),
          ];
          window.localStorage.setItem(candorThreadStorageKey(user.id), JSON.stringify(initialMessages));
        }
        router.push(`/candor/session/${data.id || CANDOR_THREAD_ID}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStartingChatId(null);
    }
  };

  return (
    <>
      <main className="gradient-bg grain relative min-h-screen overflow-x-hidden px-6 pb-40 pt-20">
        <AmbientGlow />
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[15%] top-24 h-48 w-48 rounded-full bg-[hsl(var(--glow)/0.08)] blur-3xl" />
          <div className="absolute bottom-28 right-[15%] h-56 w-56 rounded-full bg-[hsl(var(--accent)/0.06)] blur-3xl" />
        </div>

        <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl flex items-center gap-2">
              signals
            </h1>
            <p className="mt-3 text-sm font-light leading-6 text-foreground-secondary">
              candor's social playground. small reveals, values, and humor.
            </p>
          </motion.div>

          {/* Toast Notification */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-[150] surface border border-accent/30 bg-card/70 px-4 py-2.5 rounded-full text-xs font-light text-accent shadow-lg backdrop-blur-md"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Signals Feed */}
          <div className="flex flex-col gap-4">
            {signals.map((signal) => {
              const answeredOption = answers[signal.id];

              return (
                <div key={signal.id}>
                  <Card className="surface border border-border/40 bg-card/30 backdrop-blur-md transition-colors hover:border-accent/20">
                    <CardContent className="p-5 flex flex-col gap-4">
                      {/* Top label */}
                      <div className="flex items-center justify-between text-[10px] font-light uppercase tracking-[0.2em] text-accent">
                        <span>{signal.title}</span>
                        <span className="text-foreground-secondary/40 text-[9px]">{signal.category}</span>
                      </div>

                      {/* Question */}
                      <p className="text-base font-light leading-7 text-foreground">
                        {signal.prompt}
                      </p>

                      {/* Interaction Area */}
                      <div className="mt-1">
                        {!answeredOption ? (
                          <div className="flex flex-wrap gap-2">
                            {signal.options.map((opt) => (
                              <button
                                key={opt}
                                disabled={answeringId === signal.id}
                                onClick={() => handleSelectOption(signal, opt)}
                                className="rounded-full border border-border/50 bg-background/25 px-4 py-2 text-xs font-light text-foreground-secondary transition-all hover:bg-accent/10 hover:border-accent/40 hover:text-foreground active:scale-[0.98] disabled:opacity-50"
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="space-y-3"
                          >
                            {/* Outcome Reveals */}
                            {signal.outcomeType === "community_reveal" && signal.communitySplit ? (
                              <div className="space-y-2">
                                <div className="flex h-2 w-full overflow-hidden rounded-full bg-border/20">
                                  <div 
                                    className="bg-accent transition-all duration-1000" 
                                    style={{ width: `${signal.communitySplit[0]}%` }} 
                                  />
                                  <div 
                                    className="bg-foreground-secondary/30 transition-all duration-1000" 
                                    style={{ width: `${100 - signal.communitySplit[0]}%` }} 
                                  />
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
                                <p className="text-xs font-light text-accent flex items-center gap-1">
                                  <Brain className="h-3.5 w-3.5" /> i didn't expect that answer.
                                </p>
                                <button
                                  disabled={startingChatId === signal.id}
                                  onClick={() => handleContinueWithCandor(signal, answeredOption)}
                                  className="self-start rounded-full bg-accent px-4 py-2 text-xs font-medium text-primary-foreground hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1"
                                >
                                  {startingChatId === signal.id ? "connecting thread..." : "continue with candor"}
                                  <ArrowRight className="h-3 w-3" />
                                </button>
                              </div>
                            ) : (
                              // TYPE A: quick_answer
                              <div className="text-xs font-light text-foreground-secondary/70 flex items-center gap-1">
                                <Check className="h-3.5 w-3.5 text-accent" />
                                <span>saved.</span>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}

            {/* Empty State */}
            {!loading && signals.length === 0 && (
              <Card className="surface border border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-5 text-center text-foreground-secondary font-light text-sm py-12 flex flex-col items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-accent/60" />
                  No signals available right now. Check back later!
                </CardContent>
              </Card>
            )}

            {/* Refresh / Loading */}
            {loading ? (
              <div className="flex justify-center items-center py-6 text-foreground-secondary font-light text-xs gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-accent" />
                generating new signals...
              </div>
            ) : signals.length > 0 ? (
              <div className="flex justify-center pt-2 pb-4">
                <button
                  onClick={() => fetchSignals()}
                  className="flex items-center gap-2 rounded-full border border-border/50 bg-background/30 px-5 py-2.5 text-xs font-light text-foreground-secondary transition-all hover:bg-accent/10 hover:border-accent/40 hover:text-foreground active:scale-[0.98]"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  new signals
                </button>
              </div>
            ) : null}
          </div>
        </section>
        
        <BottomNav />
      </main>
    </>
  );
}
