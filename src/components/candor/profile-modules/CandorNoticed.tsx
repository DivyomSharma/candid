"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function CandorNoticed({ observation }: { observation: string }) {
  if (!observation) return null;
  return (
    <Card className="glass-card border-l-2 border-l-accent border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl flex flex-col justify-between h-full min-h-[220px]">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/70 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-accent" />
          candor noticed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 flex-1 flex flex-col justify-center">
        <h3 className="text-xl sm:text-2xl font-light leading-snug text-foreground balance-text">
          "{observation}"
        </h3>
      </CardContent>
    </Card>
  );
}
