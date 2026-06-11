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
      whileHover={{ y: -4 }}
      className={cn("group px-8 py-12 flex items-center justify-center min-h-[200px] overflow-hidden", className)}
    >
      <p className="text-center text-lg font-light text-foreground-secondary/70 leading-relaxed tracking-wide max-w-sm balance-text transition-colors duration-500 group-hover:text-foreground">
        {observation}
      </p>
    </motion.div>
  );
}
