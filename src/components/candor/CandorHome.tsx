"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { ChoiceTapCard } from "@/components/candor/ChoiceTapCard";
import { InsightSwipeCard } from "@/components/candor/InsightSwipeCard";
import { useAuth } from "@/contexts/AuthContext";
import { CANDOR_THREAD_ID, candorThreadStorageKey } from "@/lib/candor/thread";
import type { CandorPresets } from "@/lib/candor/presets";
import type { CandorEntryPayload } from "@/lib/candor/types";

const defaultPresets: CandorPresets = {
  chips: ["something i keep replaying", "a person i miss", "a small win", "i feel off", "no idea yet"],
  scenario: {
    title: "tonight feels like",
    lines: ["a thought half-formed", "a little too much noise", "wanting to be known without performing"],
  },
};

const defaultEntry: CandorEntryPayload = {
  choices: [
    {
      id: "quiet-weight",
      prompt: "imagine this...\nsomething sits wrong with you for hours, and no one can tell.",
      optionA: "you stay with it quietly",
      optionB: "you look for one person to tell",
      patternA: "internal processing",
      patternB: "selective reaching",
    },
    {
      id: "room-shift",
      prompt: "imagine this...\na room changes slightly, and you notice before anyone says anything.",
      optionA: "you trust the feeling first",
      optionB: "you wait for proof",
      patternA: "signal-trusting",
      patternB: "evidence-checking",
    },
    {
      id: "care-shape",
      prompt: "imagine this...\nsomeone cares, but the way they show it is uneven.",
      optionA: "you feel the gap quickly",
      optionB: "you give it more time",
      patternA: "consistency-seeking",
      patternB: "patience-first",
    },
  ],
  insights: [
    { id: "offness", line: "you notice when something feels slightly off", insightType: "observation" },
    {
      id: "expectation",
      line: "you do not always say what you expect, but you still feel it",
      insightType: "contrast",
    },
    {
      id: "care",
      line: "you pay attention to the shape of effort, not just the words",
      insightType: "pattern",
    },
  ],
};

type EntryPhase = "choices" | "pause" | "insights" | "clearer" | "done";
type PreviewMessage = { role: "user" | "ai"; content: string };

export function CandorHome() {
  const [message, setMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");
  const [presets, setPresets] = useState<CandorPresets>(defaultPresets);
  const [entry, setEntry] = useState<CandorEntryPayload>(defaultEntry);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [isLoadingEntry, setIsLoadingEntry] = useState(false);
  const [entryPhase, setEntryPhase] = useState<EntryPhase>("choices");
  const [choiceIndex, setChoiceIndex] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [preview, setPreview] = useState<PreviewMessage | null>(null);
  const [entrySignals, setEntrySignals] = useState<
    Array<{ choicePattern: string | null; insightType: string | null; accepted: boolean | null; engagementSignal: string }>
  >([]);
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    setIsLoadingPresets(isSignedIn);

    fetch("/api/candor/me/presets", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { presets?: CandorPresets } | null) => {
        if (!cancelled && payload?.presets) setPresets(payload.presets);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingPresets(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (!isSignedIn) {
      setIsLoadingEntry(false);
      return;
    }

    let cancelled = false;
    setIsLoadingEntry(true);

    fetch("/api/candor/me/entry", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { entry?: CandorEntryPayload } | null) => {
        if (!cancelled && payload?.entry) setEntry(payload.entry);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingEntry(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  useEffect(() => {
    if (entryPhase !== "pause") return;
    const timer = window.setTimeout(() => setEntryPhase("insights"), 400);
    return () => window.clearTimeout(timer);
  }, [entryPhase]);

  useEffect(() => {
    if (entryPhase !== "clearer") return;
    const timer = window.setTimeout(() => setEntryPhase("done"), 1000);
    return () => window.clearTimeout(timer);
  }, [entryPhase]);

  useEffect(() => {
    if (!isSignedIn || !user?.id) {
      setPreview(null);
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
      setPreview(lastAi ?? lastUser ?? null);
    } catch {
      setPreview(null);
    }
  }, [isSignedIn, user?.id]);

  const logSignal = async (signal: {
    choicePattern: string | null;
    insightType: string | null;
    accepted: boolean | null;
    engagementSignal: string;
  }) => {
    setEntrySignals((current) => [...current, signal]);

    if (!isSignedIn) return;

    try {
      await fetch("/api/candor/learning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signal),
      });
    } catch {
      return;
    }
  };

  const start = async (content: string) => {
    if (!content.trim() || isStarting) return;

    if (!isSignedIn) {
      router.push(`/candor/login?next=${encodeURIComponent("/candor/home")}`);
      return;
    }

    if (entrySignals.length) {
      void logSignal({
        choicePattern: null,
        insightType: null,
        accepted: null,
        engagementSignal: "continued_to_conversation",
      });
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

  const handleChoice = (choice: "a" | "b") => {
    const current = entry.choices[choiceIndex];
    if (!current) return;

    const choicePattern = choice === "a" ? current.patternA : current.patternB;
    void logSignal({
      choicePattern,
      insightType: null,
      accepted: null,
      engagementSignal: "entry_choice",
    });

    if (choiceIndex >= Math.min(entry.choices.length, 3) - 1) {
      setChoiceIndex((value) => value + 1);
      setEntryPhase("pause");
      return;
    }

    setChoiceIndex((value) => value + 1);
  };

  const handleInsight = (accepted: boolean) => {
    const current = entry.insights[insightIndex];
    if (!current) return;

    void logSignal({
      choicePattern: null,
      insightType: current.insightType,
      accepted,
      engagementSignal: accepted ? "insight_accept" : "insight_reject",
    });

    if (insightIndex >= Math.min(entry.insights.length, 3) - 1) {
      setInsightIndex((value) => value + 1);
      setEntryPhase("clearer");
      return;
    }

    setInsightIndex((value) => value + 1);
  };

  const currentChoice = entry.choices[choiceIndex];
  const currentInsight = entry.insights[insightIndex];
  const showEntryLayer = isSignedIn && entryPhase !== "done";

  return (
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
              : "a place for the unsaid parts"}
          </p>
          <h1 className="max-w-[11ch] text-4xl font-light leading-[0.96] tracking-tight md:text-[4.5rem]">
            what&apos;s been on your mind lately?
          </h1>
        </motion.div>

        {isSignedIn && preview ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.5 }}>
            <Card className="surface soft-shadow border-border/50 bg-card/52 backdrop-blur-md shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03),0_18px_60px_-34px_hsl(var(--glow)/0.18)]">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-4 text-xs font-light text-foreground-secondary">
                  <span>still open between you two</span>
                  <button
                    type="button"
                    onClick={() => router.push(`/candor/session/${CANDOR_THREAD_ID}`)}
                    className="text-foreground transition-colors hover:text-accent"
                  >
                    continue
                  </button>
                </div>
                <p className="max-w-[34rem] text-base font-light leading-7 text-foreground-secondary break-words">
                  {preview.content}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        <AnimatePresence mode="wait">
          {showEntryLayer ? (
            <motion.div
              key={entryPhase}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-5"
            >
              {isLoadingEntry ? (
                <PresetCardLoading />
              ) : null}

              {!isLoadingEntry && entryPhase === "choices" ? (
                <AnimatePresence mode="wait" initial={false}>
                  {currentChoice ? (
                    <ChoiceTapCard
                      key={currentChoice.id}
                      prompt={currentChoice.prompt}
                      optionA={currentChoice.optionA}
                      optionB={currentChoice.optionB}
                      onChoose={handleChoice}
                    />
                  ) : null}
                </AnimatePresence>
              ) : null}

              {!isLoadingEntry && entryPhase === "pause" ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  className="text-sm font-light text-foreground-secondary"
                >
                  just a second...
                </motion.p>
              ) : null}

              {!isLoadingEntry && entryPhase === "insights" ? (
                <AnimatePresence mode="wait" initial={false}>
                  {currentInsight ? (
                    <InsightSwipeCard
                      key={currentInsight.id}
                      line={currentInsight.line}
                      onDecide={handleInsight}
                    />
                  ) : null}
                </AnimatePresence>
              ) : null}

              {!isLoadingEntry && entryPhase === "clearer" ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 0.8, y: 0 }}
                  className="text-sm font-light text-foreground-secondary"
                >
                  this is getting clearer...
                </motion.p>
              ) : null}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: showEntryLayer ? 0.34 : 1, y: 0, scale: showEntryLayer ? 0.992 : 1 }}
          transition={{ delay: 0.12, duration: 0.7 }}
          className="flex flex-wrap gap-2"
        >
          {isLoadingPresets ? (
            <PresetChipLoading />
          ) : (
            presets.chips.map((chip, index) => (
              <motion.button
                type="button"
                key={`${chip}-${index}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.03 }}
                onClick={() => selectPrompt(chip)}
                className="max-w-full rounded-full border border-border/50 px-4 py-2 text-left text-sm font-light text-foreground-secondary transition-colors hover:border-accent/70 hover:text-foreground"
              >
                <span className="block max-w-[16rem] break-words">{chip}</span>
              </motion.button>
            ))
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: showEntryLayer ? 0.34 : 1, y: 0, scale: showEntryLayer ? 0.994 : 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <Card className="surface soft-shadow border-border/50 bg-card/60 backdrop-blur-md shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03),0_22px_70px_-34px_hsl(var(--glow)/0.2)]">
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-2 text-xs font-light text-foreground-secondary">
                <Sparkles data-icon="inline-start" />
                a possible start
              </div>
              {isLoadingPresets ? (
                <PresetCardLoading />
              ) : (
                <motion.div
                  key={presets.scenario.title}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32 }}
                  className="flex flex-col gap-3"
                >
                  <h2 className="text-lg font-light leading-7 break-words">{presets.scenario.title}</h2>
                  {presets.scenario.lines.map((line, index) => (
                    <button
                      type="button"
                      key={`${line}-${index}`}
                      onClick={() => selectPrompt(line)}
                      className="text-left text-sm font-light leading-6 text-foreground-secondary transition-colors hover:text-foreground"
                    >
                      <span className="block break-words">{line}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: showEntryLayer ? 0.42 : 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.7 }}
          className="flex flex-col gap-3"
        >
          <div className="relative flex w-full items-center">
            <div className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(180deg,hsl(var(--foreground)/0.03),transparent)]" />
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
  );
}

function PresetChipLoading() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((item) => (
        <motion.div
          key={item}
          animate={{ opacity: [0.28, 0.58, 0.28] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: item * 0.08 }}
          className="h-9 rounded-full border border-border/35 bg-foreground/10"
          style={{ width: `${118 + item * 14}px` }}
        />
      ))}
    </>
  );
}

function PresetCardLoading() {
  return (
    <div className="flex flex-col gap-3">
      {[0, 1, 2, 3].map((item) => (
        <motion.div
          key={item}
          animate={{ opacity: [0.22, 0.52, 0.22] }}
          transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", delay: item * 0.09 }}
          className="h-3 rounded-full bg-foreground/10"
          style={{ width: `${88 - item * 12}%` }}
        />
      ))}
    </div>
  );
}
