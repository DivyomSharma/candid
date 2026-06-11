"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroCardProps {
  question: string;
  className?: string;
}

export function HeroCard({ question, className }: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "relative flex flex-col items-center justify-center p-12 md:p-16 text-center w-full",
        className
      )}
    >
      <motion.div
        animate={{ scale: [1, 1.02, 1], opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--accent)/0.08),transparent_60%)] pointer-events-none"
      />
      <h2 className="relative z-10 text-3xl md:text-5xl font-light tracking-wide text-foreground leading-[1.3] max-w-2xl balance-text">
        {question}
      </h2>
    </motion.div>
  );
}
