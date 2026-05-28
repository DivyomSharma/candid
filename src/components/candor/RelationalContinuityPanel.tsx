"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link2, Moon, Send, Signal, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CHEMISTRY_GAMES,
  MICRO_SIGNALS,
  RELATIONAL_STATES,
  SOCIAL_GRAVITY_SIGNALS,
  TONIGHTS_THREADS,
  WEEKLY_REFLECTIONS,
} from "@/lib/candor/relational-layer";

type RelationalContinuityPanelProps = {
  isSignedIn: boolean;
};

export function RelationalContinuityPanel({ isSignedIn }: RelationalContinuityPanelProps) {
  const [answer, setAnswer] = useState("");
  const [hasAnswered, setHasAnswered] = useState(false);
  const [relationalState, setRelationalState] = useState<(typeof RELATIONAL_STATES)[number]>("open, not seeking");
  const [selectedSignal, setSelectedSignal] = useState<(typeof MICRO_SIGNALS)[number]>("this felt like your kind of thought");
  const [microNote, setMicroNote] = useState("");
  const [sentSignal, setSentSignal] = useState<string | null>(null);
  const [hour, setHour] = useState<number | null>(null);

  useEffect(() => {
    const updateHour = () => setHour(new Date().getHours());
    updateHour();
    const timer = window.setInterval(updateHour, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const isLateNight = hour === null ? false : hour >= 21 || hour < 4;
  const thread = useMemo(() => TONIGHTS_THREADS[new Date().getDate() % TONIGHTS_THREADS.length], []);
  const game = useMemo(() => CHEMISTRY_GAMES[new Date().getDay() % CHEMISTRY_GAMES.length], []);
  const gravitySignals = useMemo(() => SOCIAL_GRAVITY_SIGNALS.slice(0, 3), []);
  const weeklyReflection = WEEKLY_REFLECTIONS[new Date().getDay() % WEEKLY_REFLECTIONS.length];

  const submitAnswer = () => {
    if (!answer.trim()) return;
    setHasAnswered(true);
  };

  const sendSignal = () => {
    const payload = microNote.trim() ? `${selectedSignal}: ${microNote.trim()}` : selectedSignal;
    setSentSignal(payload);
    setMicroNote("");
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {RELATIONAL_STATES.map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => setRelationalState(state)}
            className={`rounded-full border px-3.5 py-2 text-xs font-light transition-colors ${
              relationalState === state
                ? "border-accent/50 bg-accent/10 text-foreground"
                : "border-border/45 bg-background/20 text-foreground-secondary hover:border-accent/35 hover:text-foreground"
            }`}
          >
            {state}
          </button>
        ))}
      </div>

      <Card className="surface soft-shadow relative overflow-hidden border-border/50 bg-card/55 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,hsl(var(--accent)/0.11),transparent_34%),radial-gradient(circle_at_92%_90%,hsl(var(--glow)/0.08),transparent_28%)]" />
        <CardContent className="relative flex flex-col gap-5 p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.18em] text-foreground-secondary">
              <Moon className="h-3.5 w-3.5 text-accent" />
              {isLateNight ? "tonight's thread" : "quiet signal"}
            </p>
            <p className="text-xs font-light text-foreground-secondary/70">{relationalState}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xl font-light leading-8 text-foreground">{thread}</p>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="answer first. the room opens after."
              className="min-h-24 w-full resize-none rounded-2xl border border-border/45 bg-background/25 px-4 py-3 text-sm font-light leading-6 text-foreground outline-none placeholder:text-foreground-secondary/45 focus:border-accent/45"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-light text-foreground-secondary">
              {hasAnswered ? "reciprocity unlocked" : "aligns stay quiet until you answer."}
            </p>
            <Button
              type="button"
              onClick={submitAnswer}
              disabled={!answer.trim()}
              className="h-9 rounded-full bg-accent px-4 text-xs text-primary-foreground hover:bg-accent/90"
            >
              answer
              <Send className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {hasAnswered ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32 }}
            className="grid gap-4"
          >
            <Card className="surface border-accent/24 bg-card/42 backdrop-blur-md">
              <CardContent className="grid gap-3 p-5 sm:grid-cols-3">
                {["align responses", "similar rhythms", "contrasting rhythms"].map((label, index) => (
                  <div key={label} className="rounded-2xl border border-border/35 bg-background/18 p-4">
                    <p className="text-xs font-light uppercase tracking-[0.14em] text-foreground-secondary/70">{label}</p>
                    <p className="mt-3 text-sm font-light leading-6 text-foreground-secondary">
                      {index === 0
                        ? "people who answered nearby are beginning to surface."
                        : index === 1
                          ? "your pacing has a soft overlap with a few threads."
                          : "difference is being held as texture, not mismatch."}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="surface border-border/45 bg-card/40 backdrop-blur-md">
              <CardContent className="flex flex-col gap-4 p-5">
                <p className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.18em] text-foreground-secondary">
                  <Signal className="h-3.5 w-3.5 text-accent" />
                  social gravity
                </p>
                <div className="grid gap-2">
                  {gravitySignals.map((signal) => (
                    <p key={signal} className="text-sm font-light leading-6 text-foreground-secondary">
                      {signal}
                    </p>
                  ))}
                </div>
                <p className="border-t border-border/35 pt-4 text-sm font-light leading-6 text-foreground-secondary/80">
                  {weeklyReflection}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Card className="surface border-border/45 bg-card/38 backdrop-blur-md">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.18em] text-foreground-secondary">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              {game.title}
            </p>
            <p className="text-xs font-light text-foreground-secondary/70">social spark</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[game.a, game.b].map((choice) => (
              <button
                key={choice}
                type="button"
                className="min-h-20 rounded-2xl border border-border/45 bg-background/18 px-4 py-3 text-left text-sm font-light leading-6 text-foreground-secondary transition-colors hover:border-accent/50 hover:text-foreground"
              >
                {choice}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {isSignedIn ? (
        <Card className="surface border-border/45 bg-card/38 backdrop-blur-md">
          <CardContent className="flex flex-col gap-4 p-5">
            <p className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.18em] text-foreground-secondary">
              <Link2 className="h-3.5 w-3.5 text-accent" />
              send a small signal
            </p>
            <div className="flex flex-wrap gap-2">
              {MICRO_SIGNALS.map((signal) => (
                <button
                  key={signal}
                  type="button"
                  onClick={() => setSelectedSignal(signal)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-light transition-colors ${
                    selectedSignal === signal
                      ? "border-accent/45 bg-accent/10 text-foreground"
                      : "border-border/40 bg-background/20 text-foreground-secondary hover:border-accent/35"
                  }`}
                >
                  {signal}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={microNote}
                onChange={(event) => setMicroNote(event.target.value)}
                placeholder="paste a Spotify, TikTok, YouTube, image, or note"
                className="h-11 min-w-0 flex-1 rounded-full border border-border/45 bg-background/25 px-4 text-sm font-light text-foreground outline-none placeholder:text-foreground-secondary/45 focus:border-accent/45"
              />
              <Button type="button" onClick={sendSignal} className="h-11 rounded-full bg-accent px-4 text-primary-foreground hover:bg-accent/90">
                send
              </Button>
            </div>
            {sentSignal ? <p className="text-xs font-light text-foreground-secondary">sent softly: {sentSignal}</p> : null}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
