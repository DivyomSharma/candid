"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sun } from "lucide-react";

export function SeasonalMood({ season, mood }: { season: string; mood: string }) {
  if (!season || !mood) return null;
  
  return (
    <Card className="glass-card border-none overflow-hidden relative min-h-[180px] shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-background/5 mix-blend-overlay" />
      <CardContent className="p-6 relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-center gap-2 text-accent/70">
          <Sun className="h-4 w-4" />
          <span className="text-[10px] font-light uppercase tracking-[0.2em]">{season} mood</span>
        </div>
        <h3 className="text-2xl font-light italic text-foreground/90 mt-4">
          "{mood}"
        </h3>
      </CardContent>
    </Card>
  );
}
