"use client";

import { FormEvent, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";

const chips = ["something i keep replaying", "a person i miss", "a small win", "i feel off", "no idea yet"];

const scenario = {
  title: "tonight feels like",
  lines: ["a thought half-formed", "a little too much noise", "wanting to be known without performing"],
};

export function CandorHome() {
  const [message, setMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  const start = async (content: string) => {
    if (!content.trim() || !isSignedIn || isStarting) return;
    setError("");
    setIsStarting(true);

    try {
      const response = await fetch("/api/candor/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content.trim() }),
      });

      if (response.ok) {
        const data = (await response.json()) as { id: string; persisted?: boolean; warning?: string };
        if (data.persisted === false) {
          window.sessionStorage.setItem(
            `candor:${data.id}:messages`,
            JSON.stringify([{ id: crypto.randomUUID(), role: "user", content: content.trim() }]),
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
            {isSignedIn ? `hey ${user?.firstName?.toLowerCase() ?? "there"}` : "enter slowly"}
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
          {chips.map((chip) => (
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
                <h2 className="text-lg font-light">{scenario.title}</h2>
                {scenario.lines.map((line) => (
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
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="say it in the messy version"
            className="min-h-28 rounded-2xl border-border/50 bg-background/45 p-5 text-base font-light leading-7 shadow-none focus-visible:ring-accent/40"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />

          {isLoaded && isSignedIn ? (
            <Button
              type="submit"
              disabled={!message.trim() || isStarting}
              className="self-end rounded-full bg-accent px-6 text-sm font-medium text-primary-foreground hover:bg-accent/90"
            >
              {isStarting ? "entering" : "begin"}
              <ArrowRight data-icon="inline-end" />
            </Button>
          ) : (
            <SignInButton mode="modal" forceRedirectUrl="/candor/home">
              <Button
                type="button"
                disabled={!isLoaded}
                className="self-end rounded-full bg-accent px-6 text-sm font-medium text-primary-foreground hover:bg-accent/90"
              >
                sign in to keep going
                <ArrowRight data-icon="inline-end" />
              </Button>
            </SignInButton>
          )}
          {error && <p className="self-end text-right text-xs font-light leading-5 text-foreground-secondary">{error}</p>}
        </motion.form>
      </section>
      <BottomNav />
    </main>
  );
}
