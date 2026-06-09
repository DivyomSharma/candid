"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shuffle, Image as ImageIcon, Eye, PenLine, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CandorScenario } from "@/lib/candor/scenarios";

const THREAD_WEAVING_MESSAGES = [
  "finding today's thread...",
  "connecting small signals...",
  "remembering what lingered...",
  "following quiet patterns...",
  "looking beneath the obvious...",
  "starting somewhere small...",
  "holding two ideas together...",
  "finding a better question...",
  "seeing what still matters...",
  "looking where you weren't expecting...",
  "staying with the feeling...",
  "connecting scattered moments...",
  "searching for something true...",
  "piecing things together...",
];

const FALLBACK_MESSAGES = [
  "sometimes the right question takes a second.",
  "not every thread starts where you expect.",
  "following something familiar...",
  "almost there."
];

function LoadingCardContent({ isExceeded }: { isExceeded: boolean }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [exceededIndex, setExceededIndex] = useState(0);

  useEffect(() => {
    const shuffled = [...THREAD_WEAVING_MESSAGES].sort(() => Math.random() - 0.5);
    setMessages(shuffled);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const interval = setInterval(() => {
      if (isExceeded) {
        setExceededIndex((i) => (i + 1) % FALLBACK_MESSAGES.length);
      } else {
        setIndex((i) => (i + 1) % messages.length);
      }
    }, 1400); 
    return () => clearInterval(interval);
  }, [messages, isExceeded]);

  const currentMessage = isExceeded ? FALLBACK_MESSAGES[exceededIndex] : messages[index];

  return (
    <CardContent className="flex flex-col items-center justify-center p-5 h-full gap-8">
      <div className="h-[1px] w-8 bg-border/40" />
      <div className="h-[20px] flex items-center justify-center relative w-full">
        <motion.div
          animate={{ opacity: [0.90, 1, 0.90], letterSpacing: ["0.01em", "0.04em", "0.01em"] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute flex items-center justify-center w-full"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-sm font-light text-foreground-secondary tracking-wide text-center absolute"
            >
              {currentMessage}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="h-[1px] w-8 bg-border/40" />
    </CardContent>
  );
}

function CardContentInner({ 
  scenario, 
  onSelect, 
  onShuffle 
}: { 
  scenario: CandorScenario; 
  onSelect: (scenario: CandorScenario, option: string) => void;
  onShuffle: () => void;
}) {
  let Icon = Sparkles;
  if (scenario.type === "hear_me_out") Icon = Coffee;
  if (scenario.type === "hot_take") Icon = PenLine;
  if (scenario.type === "red_flag") Icon = ImageIcon;
  if (scenario.type === "green_flag") Icon = Sparkles;
  if (scenario.type === "delusion_check") Icon = Eye;
  
  const hasOptions = scenario.options && scenario.options.length > 0;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShuffle();
        }}
        className="absolute right-4 top-4 p-2 text-foreground-secondary hover:text-foreground hover:bg-background/40 rounded-full transition-colors z-10"
        title="Next scenario"
      >
        <Shuffle className="h-4 w-4" />
      </button>
      <CardContent className="flex flex-col gap-4 p-5 h-full justify-center">
        <div className="flex items-center gap-2 text-xs font-light uppercase tracking-[0.18em] text-accent">
          <Icon className="h-3.5 w-3.5" />
          {scenario.title}
        </div>
        
        <p className="text-base font-light leading-7 text-foreground pr-8">
          {scenario.prompt}
        </p>

        {hasOptions ? (
          <div className="grid grid-cols-2 gap-3 mt-1">
            {scenario.options.map((option) => (
              <button
                key={option}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(scenario, option);
                }}
                className="rounded-xl border border-border/45 bg-background/25 px-4 py-3 text-sm font-light text-foreground-secondary transition-all hover:bg-accent/10 hover:border-accent/40 hover:text-foreground active:scale-[0.98]"
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-1 flex items-center text-sm font-light text-accent/80 group-hover:text-accent transition-colors">
            <PenLine className="h-3.5 w-3.5 mr-2" />
            tap to complete this thought...
          </div>
        )}
      </CardContent>
    </>
  );
}

type ScenarioPanelProps = {
  isSignedIn: boolean;
  onScenarioSelect: (message: string) => void;
  onScenarioPrefill: (text: string) => void;
};

export function ScenarioPanel({ isSignedIn, onScenarioSelect, onScenarioPrefill }: ScenarioPanelProps) {
  const [scenarios, setScenarios] = useState<CandorScenario[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [isFetching, setIsFetching] = useState(true);
  const [minLoadingDone, setMinLoadingDone] = useState(false);
  const [isExceeded, setIsExceeded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsFetching(true);
    
    const exceedTimeout = setTimeout(() => {
      if (!cancelled) setIsExceeded(true);
    }, 3000);

    const minLoadTimeout = setTimeout(() => {
      if (!cancelled) setMinLoadingDone(true);
    }, 800);

    fetch("/api/candor/me/scenarios")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { scenarios?: CandorScenario[] } | null) => {
        if (!cancelled && data?.scenarios) {
          setScenarios(data.scenarios);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
      clearTimeout(exceedTimeout);
      clearTimeout(minLoadTimeout);
    };
  }, [isSignedIn]);

  const showLoader = isFetching || !minLoadingDone;

  const handleSelect = (scenario: CandorScenario, option: string) => {
    const context = `[System: The user is responding to the scenario: "${scenario.prompt}"]\n\n`;
    onScenarioSelect(`${context}${option}`);
  };

  const handleShuffle = () => {
    setCurrentIndex((prev) => (prev + 1) % scenarios.length);
  };

  const scenario = scenarios.length > 0 ? scenarios[currentIndex] : null;
  const hasOptions = scenario && scenario.options && scenario.options.length > 0;

  const handlePrefillClick = () => {
    if (scenario && !hasOptions) {
      onScenarioPrefill(scenario.prompt + " ");
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full justify-center">
      <Card 
        className={`surface border-border/45 bg-card/38 backdrop-blur-md transition-colors hover:border-accent/30 relative overflow-hidden min-h-[210px] ${(!showLoader && scenario && !hasOptions) ? "cursor-pointer group" : ""}`}
        onClick={(!showLoader && scenario && !hasOptions) ? handlePrefillClick : undefined}
      >
        <AnimatePresence mode="wait">
          {showLoader ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 w-full h-full"
            >
              <LoadingCardContent isExceeded={isExceeded} />
            </motion.div>
          ) : scenario ? (
            <motion.div 
              key={scenario.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.12, duration: 0.45 } }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              className="absolute inset-0 w-full h-full"
            >
              <CardContentInner 
                scenario={scenario} 
                onSelect={handleSelect}
                onShuffle={handleShuffle}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Card>
    </div>
  );
}
