"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import type { CandorPresets } from "@/lib/candor/presets";

const defaultPresets: CandorPresets = {
  chips: ["something i keep replaying", "a person i miss", "a small win", "i feel off", "no idea yet"],
  scenario: {
    title: "tonight feels like",
    lines: ["a thought half-formed", "a little too much noise", "wanting to be known without performing"],
  },
};

export function CandorHome() {
  const [message, setMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [presets, setPresets] = useState<CandorPresets>(defaultPresets);
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    fetch("/api/candor/me/presets", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { presets?: CandorPresets } | null) => {
        if (!cancelled && payload?.presets) setPresets(payload.presets);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

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
        if (data.persisted === false) {
          const initialMessages = [
            { id: crypto.randomUUID(), role: "user", content: content.trim() },
            ...(data.message ? [data.message] : []),
          ];
          window.sessionStorage.setItem(
            `candor:${data.id}:messages`,
            JSON.stringify(initialMessages),
          );
        }
        router.push(`/candor/session/${data.id}`);
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

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-32 pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-10rem)] max-w-[600px] flex-col justify-center gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="mb-4 text-sm font-light text-foreground-secondary">
            {isSignedIn ? `hey ${user?.email?.split("@")[0]?.toLowerCase() ?? "there"}` : "enter slowly"}
          </p>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">
            what&apos;s been on your mind lately?
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.7 }}
          className="flex flex-wrap gap-2"
        >
          {presets.chips.map((chip) => (
            <button
              type="button"
              key={chip}
              onClick={() => selectPrompt(chip)}
              className="rounded-full border border-border/50 px-4 py-2 text-sm font-light text-foreground-secondary transition-colors hover:border-accent/70 hover:text-foreground"
            >
              {chip}
            </button>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
          <Card className="surface border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-2 text-xs font-light text-foreground-secondary">
                <Sparkles data-icon="inline-start" />
                a possible start
              </div>
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-light">{presets.scenario.title}</h2>
                {presets.scenario.lines.map((line) => (
                  <button
                    type="button"
                    key={line}
                    onClick={() => selectPrompt(line)}
                    className="text-left text-sm font-light leading-6 text-foreground-secondary transition-colors hover:text-foreground"
                  >
                    {line}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.7 }}
          className="flex flex-col gap-3"
        >
          <div className="relative flex w-full items-center">
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="say it in the messy version"
              className="h-14 w-full rounded-full border border-border/50 bg-background/45 pl-6 pr-32 text-base font-light text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-accent/40 focus:ring-1 focus:ring-accent/40"
            />

            <div className="absolute right-1.5 flex items-center">
              {isLoaded && isSignedIn ? (
                <Button
                  type="submit"
                  disabled={!message.trim() || isStarting}
                  className="h-11 rounded-full bg-accent px-5 text-sm font-medium text-primary-foreground hover:bg-accent/90"
                >
                  {isStarting ? "entering" : "begin"}
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
  );
}
