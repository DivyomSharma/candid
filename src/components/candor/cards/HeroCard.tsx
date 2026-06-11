"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroCardProps {
  question: string;
  subtext?: string;
  className?: string;
}

export function HeroCard({ question, subtext = "quiet. unfinished. cinematic.", className }: HeroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "relative flex flex-col items-start justify-center py-24 md:py-32 w-full",
        className
      )}
    >
      <motion.div
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -inset-24 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--accent)/0.12),transparent_70%)] pointer-events-none blur-3xl"
      />
      
      <h2 className="relative z-10 text-5xl md:text-[80px] lg:text-[110px] font-light tracking-tighter text-foreground leading-[1.05] max-w-[12ch] md:max-w-[15ch]">
        {question}
      </h2>
      
      {subtext && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="relative z-10 mt-12 text-lg md:text-xl font-light text-foreground-secondary/70 tracking-wide"
        >
          {subtext}
        </motion.p>
      )}
    </motion.div>
  );
}
