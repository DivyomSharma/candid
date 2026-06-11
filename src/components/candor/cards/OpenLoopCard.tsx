"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { PlantArt } from "@/components/candor/art";

interface OpenLoopCardProps {
  topic: string;
  onClick: () => void;
  className?: string;
}

export function OpenLoopCard({ topic, onClick, className }: OpenLoopCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onClick={onClick}
      className={cn("cursor-pointer group h-full", className)}
    >
      <Card className="glass-card overflow-hidden border border-border/40 bg-card/30 backdrop-blur-3xl transition-colors hover:border-accent/30 shadow-xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[280px] h-full">
        <PlantArt state={1} width={80} height={80} className="text-accent mb-2" />
        <span className="text-[10px] uppercase tracking-[0.2em] text-foreground-secondary/50 font-light drop-shadow-sm">
          Unfinished
        </span>
        <div className="w-8 h-[1px] bg-border/50 mx-auto" />
        <p className="text-xs font-light text-foreground italic leading-relaxed max-w-[220px] mx-auto drop-shadow-sm">
          "{topic}"
        </p>
      </Card>
    </motion.div>
  );
}
