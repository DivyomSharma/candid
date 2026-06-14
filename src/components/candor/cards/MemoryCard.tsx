"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MemoryCardProps {
  observation: string;
  className?: string;
}

export function MemoryCard({ observation, className }: MemoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("group glass-card overflow-hidden border border-border/40 bg-card/30 max-md:backdrop-blur-md md:backdrop-blur-3xl transition-colors hover:border-accent/50 hover:shadow-[0_0_20px_hsl(var(--accent)/0.15)] shadow-xl px-8 py-12 flex items-center justify-center min-h-[200px] cursor-pointer", className)}
    >
      <p className="text-center text-lg font-light text-foreground-secondary/70 leading-relaxed tracking-wide max-w-sm balance-text transition-colors duration-500 group-hover:text-foreground">
        {observation}
      </p>
    </motion.div>
  );
}
