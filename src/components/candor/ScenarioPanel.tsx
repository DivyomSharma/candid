"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shuffle, Image as ImageIcon, Eye, PenLine, Coffee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { CandorScenario } from "@/lib/candor/scenarios";

const THREAD_WEAVING_MESSAGES = [
  "finding a thread...",
  "connecting small signals...",
  "remembering what stayed...",
  "looking somewhere unexpected...",
  "holding two ideas together...",
  "starting from something small...",
  "finding the better question...",
  "thinking about yesterday...",
  "looking beneath the obvious...",
  "staying with the feeling...",
  "noticing what repeats...",
  "piecing things together...",
  "following quiet patterns...",
  "searching for something true...",
  "finding where this goes...",
  "waiting for the right angle...",
  "remembering old conversations...",
  "seeing what still lingers...",
  "connecting scattered moments...",
  "looking past first impressions...",
  "finding today's thread...",
];

function ThreadWeavingLoader({ isExceeded }: { isExceeded: boolean }) {
  const [messages, setMessages] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const shuffled = [...THREAD_WEAVING_MESSAGES].sort(() => Math.random() - 0.5);
    setMessages(shuffled);
  }, []);

  useEffect(() => {
    if (isExceeded || messages.length === 0) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 1400); 
    return () => clearInterval(interval);
  }, [messages, isExceeded]);

  const currentMessage = isExceeded ? "still following the thread..." : messages[index];

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-8 opacity-80">
      <div className="h-[1px] w-8 bg-border/40" />
      <div className="h-[20px] flex items-center justify-center relative w-full">
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
      </div>
      <div className="h-[1px] w-8 bg-border/40" />
    </div>
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
    let context = "";
    if (scenario.type === "frame") {
      context = `[System: The user is choosing a frame: "${scenario.prompt}"]\n\n`;
    } else if (scenario.type === "tiny_preference") {
      context = `[System: The user is selecting a tiny preference: "${scenario.prompt}"]\n\n`;
    } else {
      context = `[System: The user is responding to the scenario: "${scenario.prompt}"]\n\n`;
    }
    onScenarioSelect(`${context}${option}`);
  };

  const handleShuffle = () => {
    setCurrentIndex((prev) => (prev + 1) % scenarios.length);
  };

  const handlePrefillClick = (scenario: CandorScenario) => {
    onScenarioPrefill(scenario.prompt + " ");
  };

  return (
    <div className="flex flex-col gap-5 w-full min-h-[180px] justify-center">
      <AnimatePresence mode="wait">
        {showLoader ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full flex justify-center"
          >
            <ThreadWeavingLoader isExceeded={isExceeded} />
          </motion.div>
        ) : scenarios.length > 0 ? (
          <ScenarioCard 
            key={scenarios[currentIndex].id}
            scenario={scenarios[currentIndex]} 
            onSelect={handleSelect}
            onShuffle={handleShuffle}
            onPrefill={handlePrefillClick}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function ScenarioCard({ 
  scenario, 
  onSelect, 
  onShuffle, 
  onPrefill 
}: { 
  scenario: CandorScenario; 
  onSelect: (scenario: CandorScenario, option: string) => void;
  onShuffle: () => void;
  onPrefill: (scenario: CandorScenario) => void;
}) {
  let Icon = Sparkles;
  if (scenario.type === "frame") Icon = ImageIcon;
  if (scenario.type === "mirror") Icon = Eye;
  if (scenario.type === "finish_the_sentence") Icon = PenLine;
  if (scenario.type === "tiny_preference") Icon = Coffee;
  
  const hasOptions = scenario.options && scenario.options.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card 
        className={`surface border-border/45 bg-card/38 backdrop-blur-md transition-colors hover:border-accent/30 relative ${!hasOptions ? "cursor-pointer group" : ""}`}
        onClick={!hasOptions ? () => onPrefill(scenario) : undefined}
      >
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
        <CardContent className="flex flex-col gap-4 p-5">
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
      </Card>
    </motion.div>
  );
}
