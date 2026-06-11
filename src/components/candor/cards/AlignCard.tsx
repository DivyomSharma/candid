"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { CoffeeArt } from "@/components/candor/art";

interface AlignCardProps {
  username: string;
  initials: string;
  tier: string;
  observation: string;
  avatarTone: string;
  className?: string;
  onClick?: () => void;
}

export function AlignCard({ username, initials, tier, observation, avatarTone, className, onClick }: AlignCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("group cursor-pointer h-full", className)}
      onClick={onClick}
    >
      <Card className="glass-card overflow-hidden border border-border/40 bg-card/30 backdrop-blur-3xl transition-colors hover:border-accent/30 shadow-xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[280px] h-full">
        <CoffeeArt state={1} width={80} height={80} className="text-accent mb-2" />
        <h4 className="text-xl font-light text-foreground tracking-widest uppercase leading-tight drop-shadow-md">align with {username}</h4>
        <div className="w-8 h-[1px] bg-border/50 mx-auto" />
        <p className="text-xs font-light text-foreground-secondary italic leading-relaxed max-w-[220px] mx-auto drop-shadow-sm">
          {observation}
        </p>
      </Card>
    </motion.div>
  );
}
