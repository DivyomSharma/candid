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
    if (!isSignedIn || !user?.id) return;

    fetch("/api/candor/initiatives")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { message?: PreviewMessage | null } | null) => {
        if (data?.message) {
          setPreview({ role: "ai", content: data.message.content });
          window.localStorage.setItem(candorThreadPresenceStorageKey(user.id), "initiative");
          window.dispatchEvent(new Event("candor-thread-presence"));
        }
      })
      .catch(() => {});
  }, [isSignedIn, user?.id]);

  const start = async (content: string) => {
    if (!content.trim() || isStarting) return;

    if (!isSignedIn) {
      router.push(`/candor/login?next=${encodeURIComponent("/candor/home")}`);
      return;
    }

    setError("");
    setIsStarting(true);

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
      setIsStarting(false);
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

  const isInitiativePreview = preview?.content === defaultInitiativeLine;

  return (
    <>
      <AnimatePresence>
        {isStarting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <div className="relative flex items-center justify-center h-32 w-full">
              {/* Pulsing glow behind the text */}
              <motion.div
                animate={{ opacity: [0.1, 0.4, 0.1], scale: [0.95, 1.1, 0.95] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute h-32 w-64 rounded-full bg-[hsl(var(--accent)/0.25)] blur-3xl"
              />
              
              {/* Text glow animation */}
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5], textShadow: ["0 0 10px hsl(var(--accent)/0.1)", "0 0 35px hsl(var(--accent)/0.8)", "0 0 10px hsl(var(--accent)/0.1)"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-5xl font-light tracking-widest text-accent relative z-10"
              >
                candor
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 text-sm font-light text-foreground-secondary tracking-wide"
            >
              connecting...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-32 pt-20">
        <AmbientGlow />
        <div className="pointer-events-none absolute inset-0 opacity-70">
          <div className="absolute left-[12%] top-24 h-48 w-48 rounded-full bg-[hsl(var(--glow)/0.08)] blur-3xl" />
          <div className="absolute bottom-28 right-[10%] h-56 w-56 rounded-full bg-[hsl(var(--accent)/0.07)] blur-3xl" />
        </div>
        <section className="relative z-10 mx-auto flex min-h-[calc(100vh-10rem)] max-w-[600px] flex-col justify-center gap-10">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative">
            <p className="mb-4 text-sm font-light text-foreground-secondary">
              {isSignedIn
                ? `hey ${user?.email?.split("@")[0]?.toLowerCase() ?? "there"}`
                : "the thread continues quietly"}
            </p>
            <h1 className="max-w-[11ch] text-4xl font-light leading-[0.96] tracking-tight md:text-[4.5rem]">
              what feels alive tonight?
            </h1>
          </motion.div>

          {preview ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.5 }}>
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
            transition={{ delay: 0.12, duration: 0.7 }}
          >
            <ScenarioPanel isSignedIn={isSignedIn} onScenarioSelect={selectPrompt} />
          </motion.div>

          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.7 }}
            className="flex flex-col gap-3"
          >
            <div className="relative flex w-full items-center">
              <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,hsl(var(--foreground)/0.03),transparent)]" />
              <input
                type="text"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="start with the thing you actually care about"
                className="h-14 w-full rounded-full border border-border/50 bg-background/45 pl-6 pr-32 text-base font-light text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-accent/40 focus:ring-1 focus:ring-accent/40"
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
        </section>
        <BottomNav />
      </main>
    </>
  );
}
