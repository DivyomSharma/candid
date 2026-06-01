"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, HandHeart, Shuffle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CandorScenario } from "@/lib/candor/scenarios";

type ScenarioPanelProps = {
  isSignedIn: boolean;
  onScenarioSelect: (message: string) => void;
};

export function ScenarioPanel({ isSignedIn, onScenarioSelect }: ScenarioPanelProps) {
  const [scenarios, setScenarios] = useState<CandorScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    fetch("/api/candor/me/scenarios")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { scenarios?: CandorScenario[] } | null) => {
        if (!cancelled && data?.scenarios) {
          setScenarios(data.scenarios);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn]);

  const handleSelect = (scenario: CandorScenario, option: string) => {
    let context = "";
    if (scenario.type === "would_you_rather") {
      context = `[System: The user is answering the "would you rather" scenario: "${scenario.prompt}"]\n\n`;
    } else if (scenario.type === "have_you_ever") {
      context = `[System: The user is answering the "have you ever" scenario: "${scenario.prompt}"]\n\n`;
    } else if (scenario.type === "creative_argument") {
      context = `[System: The user wants to playfully argue about: "${scenario.prompt}". You take the opposing side and challenge them immediately.]\n\n`;
    } else {
      context = `[System: The user is responding to the scenario: "${scenario.prompt}"]\n\n`;
    }
    
    onScenarioSelect(`${context}${option}`);
  };

  const handleShuffle = () => {
    setCurrentIndex((prev) => (prev + 1) % scenarios.length);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 w-full">
        <Card className="surface border-border/20 bg-card/10 backdrop-blur-md animate-pulse">
          <CardContent className="flex flex-col gap-5 p-5">
            <div className="h-3 w-20 rounded-full bg-foreground/10" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded-full bg-foreground/10" />
              <div className="h-4 w-3/4 rounded-full bg-foreground/10" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="h-12 w-full rounded-xl bg-foreground/10" />
              <div className="h-12 w-full rounded-xl bg-foreground/10" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (scenarios.length === 0) return null;

  const scenario = scenarios[currentIndex];
  let Icon = Sparkles;
  if (scenario.type === "would_you_rather") Icon = HandHeart;
  if (scenario.type === "creative_argument") Icon = MessageSquare;

  return (
    <div className="flex flex-col gap-5 w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={scenario.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="surface border-border/45 bg-card/38 backdrop-blur-md transition-colors hover:border-accent/30 relative">
            <button
              onClick={handleShuffle}
              className="absolute right-4 top-4 p-2 text-foreground-secondary hover:text-foreground hover:bg-background/40 rounded-full transition-colors"
              title="Next scenario"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <CardContent className="flex flex-col gap-4 p-5">
              <div className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.18em] text-accent">
                <Icon className="h-3.5 w-3.5" />
                {scenario.title}
              </div>
              
              <p className="text-base font-light leading-7 text-foreground pr-8">
                {scenario.prompt}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-1">
                {scenario.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelect(scenario, option)}
                    className="rounded-xl border border-border/45 bg-background/25 px-4 py-3 text-sm font-light text-foreground-secondary transition-all hover:bg-accent/10 hover:border-accent/40 hover:text-foreground active:scale-[0.98]"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
