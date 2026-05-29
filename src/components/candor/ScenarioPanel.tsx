"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, HandHeart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CandorScenario } from "@/lib/candor/scenarios";

type ScenarioPanelProps = {
  isSignedIn: boolean;
  onScenarioSelect: (message: string) => void;
};

export function ScenarioPanel({ isSignedIn, onScenarioSelect }: ScenarioPanelProps) {
  const [scenarios, setScenarios] = useState<CandorScenario[]>([]);
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
    let message = "";
    if (scenario.type === "would_you_rather") {
      message = `(Scenario: Would you rather ${scenario.prompt}) I choose: ${option}. What do you think about that choice?`;
    } else if (scenario.type === "have_you_ever") {
      message = `(Scenario: Have you ever ${scenario.prompt}) My answer is: ${option}. Let's talk about it.`;
    } else if (scenario.type === "creative_argument") {
      message = `(Roleplay Argument: ${scenario.prompt}) I will take the side: "${option}". You take the opposing side and challenge me. Start the argument.`;
    } else {
      message = `(Scenario: ${scenario.prompt}) I choose: ${option}.`;
    }
    
    onScenarioSelect(message);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-card/40 border border-border/20" />
        ))}
      </div>
    );
  }

  if (scenarios.length === 0) return null;

  return (
    <div className="flex flex-col gap-5">
      <AnimatePresence>
        {scenarios.map((scenario, index) => {
          let Icon = Sparkles;
          if (scenario.type === "would_you_rather") Icon = HandHeart;
          if (scenario.type === "creative_argument") Icon = MessageSquare;

          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="surface border-border/45 bg-card/38 backdrop-blur-md transition-colors hover:border-accent/30">
                <CardContent className="flex flex-col gap-4 p-5">
                  <div className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.18em] text-accent">
                    <Icon className="h-3.5 w-3.5" />
                    {scenario.title}
                  </div>
                  
                  <p className="text-base font-light leading-7 text-foreground">
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
          );
        })}
      </AnimatePresence>
    </div>
  );
}
