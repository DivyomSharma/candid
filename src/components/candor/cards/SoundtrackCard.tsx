"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { VinylArt } from "@/components/candor/art";

interface SoundtrackCardProps {
  title: string;
  artist: string;
  reason: string;
  coverUrl: string;
  onPlay?: () => void;
  className?: string;
}

export function SoundtrackCard({ title, artist, reason, onPlay, className }: SoundtrackCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("group cursor-pointer h-full", className)}
      onClick={onPlay}
    >
      <Card className="glass-card overflow-hidden border border-border/40 bg-card/30 backdrop-blur-3xl transition-colors hover:border-accent/30 shadow-xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[280px] h-full">
        <VinylArt state={1} width={80} height={80} className="text-accent mb-2" />
        <div className="space-y-1">
          <h4 className="text-xl font-light text-foreground tracking-widest uppercase leading-tight drop-shadow-md">{title}</h4>
          <p className="text-xs font-light text-foreground-secondary/80 tracking-widest">{artist}</p>
        </div>
        <div className="w-8 h-[1px] bg-border/50 mx-auto" />
        <p className="text-xs font-light text-foreground-secondary italic leading-relaxed max-w-[220px] mx-auto drop-shadow-sm">
          "{reason}"
        </p>
      </Card>
    </motion.div>
  );
}
