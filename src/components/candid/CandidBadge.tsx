"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type CandidBadgeProps = {
  badge?: {
    title: string;
    lore: string;
    art_type: string;
    explanation: string;
  };
  className?: string;
};

export function CandidBadge({ badge, className }: CandidBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  // If no badge exists yet, we generate a subtle placeholder to maintain the aesthetic
  const displayBadge = badge ?? {
    title: "Quiet Observer",
    lore: "Notices the details others miss.",
    art_type: "minimal",
    explanation: "I've noticed you return to people, films and conversations long after they've ended.\nYou seem to carry things quietly.\nThis felt closest.",
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="group relative flex flex-col items-center gap-2 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl transition-all hover:bg-white/10 hover:shadow-2xl"
      >
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-b from-accent/20 to-transparent opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 shadow-inner">
          <Sparkles className="h-5 w-5 text-accent/80" />
        </div>
        <div className="relative text-center">
          <p className="text-[10px] font-light uppercase tracking-[0.2em] text-accent/70">candid badge</p>
          <h3 className="mt-1 font-serif text-lg font-medium text-foreground/90">{displayBadge.title}</h3>
        </div>
        <div className="mt-2">
          {expanded ? (
            <ChevronUp className="h-3 w-3 text-foreground-secondary/50 transition-colors group-hover:text-foreground-secondary" />
          ) : (
            <ChevronDown className="h-3 w-3 text-foreground-secondary/50 transition-colors group-hover:text-foreground-secondary" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: "auto", opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="mt-4 max-w-sm overflow-hidden"
          >
            <div className="rounded-2xl border border-accent/10 bg-accent/5 p-5 text-center backdrop-blur-md">
              <p className="text-[10px] font-light uppercase tracking-[0.2em] text-accent/50 mb-3">why this badge</p>
              <p className="whitespace-pre-line text-sm font-light leading-relaxed text-foreground/80">
                {displayBadge.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
