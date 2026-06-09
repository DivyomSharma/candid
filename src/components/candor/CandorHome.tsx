"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { ScenarioPanel } from "@/components/candor/ScenarioPanel";
import { useAuth } from "@/contexts/AuthContext";
import { CANDOR_THREAD_ID, candorThreadPresenceStorageKey, candorThreadStorageKey } from "@/lib/candor/thread";

type PreviewMessage = { role: "user" | "ai"; content: string };

const defaultInitiativeLine = "i have a feeling your algorithm knows too much about you already";

export function CandorHome() {
  const [message, setMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<PreviewMessage | null>(null);
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

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
    // Initiatives (random uninitiated messages) are disabled based on feedback
  }, [isSignedIn, user?.id]);

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
          setError("database is not connected yet. add supabase keys in vercel.");
        } else {
          setError("something did not open. check the deployment env.");
        }
      }
    } catch {
      setError("the connection did not answer. try again in a moment.");
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

  const handlePrefill = (stem: string) => {
    setMessage(stem);
    const inputEl = document.getElementById("candor-home-input");
    if (inputEl) inputEl.focus();
  };

  const isInitiativePreview = preview?.content === defaultInitiativeLine;

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
              {/* Silky, highly diffused breathing orb */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.25, 0.1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-[250px] w-[250px] rounded-full bg-accent blur-[80px]"
              />
              
              {/* Cinematic text breathing with blur */}
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
        <section className="relative z-10 mx-auto flex w-full max-w-[600px] flex-1 flex-col justify-center gap-10">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="relative">
            <p className="mb-4 text-sm font-light text-foreground-secondary">
              {isSignedIn
                ? `hey ${user?.firstName?.toLowerCase() || user?.email?.split("@")[0]?.toLowerCase() || "there"}`
                : "the thread continues quietly"}
            </p>
            <h1 className="max-w-[11ch] text-4xl font-light leading-[0.96] tracking-tight md:text-[4.5rem]">
              what feels alive tonight?
            </h1>
          </motion.div>

          {preview ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="surface soft-shadow relative overflow-hidden border-accent/30 bg-[linear-gradient(135deg,hsl(var(--accent)/0.13),hsl(var(--card)/0.48)_42%,hsl(var(--background)/0.34))] backdrop-blur-md shadow-[inset_0_1px_0_hsl(var(--foreground)/0.08),inset_0_0_34px_hsl(var(--accent)/0.045),0_22px_80px_-36px_hsl(var(--accent)/0.55)]">
                <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[hsl(var(--accent)/0.13)] blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 right-8 h-16 w-32 rounded-full bg-[hsl(var(--glow)/0.08)] blur-2xl" />
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-4 text-xs font-light text-foreground-secondary">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-accent/80 shadow-[0_0_14px_hsl(var(--accent)/0.65)] animate-[candor-breathe_3.2s_ease-in-out_infinite]" />
                      {isInitiativePreview ? "unread from candor" : "still open between you two"}
                    </span>
                    {isSignedIn ? (
                      <button
                        type="button"
                        onClick={() => router.push(`/candor/session/${CANDOR_THREAD_ID}`)}
                        className="text-foreground transition-colors hover:text-accent"
                      >
                        continue
                      </button>
                    ) : null}
                  </div>
                  <p className="max-w-[34rem] text-base font-light leading-7 text-foreground break-words">
                    {preview.content}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : null}

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ScenarioPanel isSignedIn={isSignedIn} onScenarioSelect={selectPrompt} onScenarioPrefill={handlePrefill} />
          </motion.div>
        </section>

        <div className="fixed inset-x-6 bottom-24 z-[100] pointer-events-none">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto flex w-full max-w-[600px] flex-col gap-3 pointer-events-auto"
          >
            <div className="relative flex w-full items-center">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,hsl(var(--foreground)/0.03),transparent)]" />
              <input
                id="candor-home-input"
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="start with the thing you actually care about"
                className="h-14 w-full rounded-full border border-border/50 bg-background/45 pl-6 pr-[150px] sm:pr-40 text-base font-light text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-accent/40 focus:ring-1 focus:ring-accent/40 text-ellipsis overflow-hidden whitespace-nowrap"
              />

              <div className="absolute right-1.5 flex items-center">
                {isLoaded && isSignedIn ? (
                  <Button
                    type="submit"
                    disabled={!message.trim() || isStarting}
                    className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-primary-foreground hover:bg-accent/90"
                  >
                    {isStarting ? "opening..." : preview ? "keep it going" : "open the thread"}
                    <ArrowRight data-icon="inline-end" className="ml-1.5 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={!isLoaded}
                    onClick={() => router.push(`/candor/login?next=${encodeURIComponent("/candor/home")}`)}
                    className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-primary-foreground hover:bg-accent/90"
                  >
                    sign in
                    <ArrowRight data-icon="inline-end" className="ml-1.5 h-4 w-4" />
                  </Button>
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
