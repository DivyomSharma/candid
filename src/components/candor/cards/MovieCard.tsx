"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectorArt } from "@/components/candor/art";

interface MovieCardProps {
  title: string;
  reason: string;
  posterUrl: string;
  className?: string;
}

export function MovieCard({ title, reason, posterUrl, className }: MovieCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("group cursor-pointer h-full", className)}
    >
      <Card className="glass-card overflow-hidden border border-border/40 bg-card/30 backdrop-blur-3xl transition-colors hover:border-accent/30 shadow-xl p-6 flex flex-col items-center justify-center text-center gap-4 min-h-[280px]">
        <ProjectorArt state={1} width={80} height={80} className="text-accent mb-2" />
        <h4 className="text-xl font-light text-foreground tracking-widest uppercase leading-tight drop-shadow-md">{title}</h4>
        <div className="w-8 h-[1px] bg-border/50 mx-auto" />
        <p className="text-xs font-light text-foreground-secondary italic leading-relaxed max-w-[220px] mx-auto drop-shadow-sm">
          "{reason}"
        </p>
      </Card>
    </motion.div>
  );
}
