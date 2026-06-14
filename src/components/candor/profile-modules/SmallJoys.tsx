"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee } from "lucide-react";

export function SmallJoys({ joys }: { joys: string[] }) {
  if (!joys || joys.length === 0) return null;
  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/70 flex items-center gap-1.5">
          <Coffee className="h-3 w-3 text-accent" />
          small joys
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 flex flex-wrap gap-1.5">
        {joys.map((joy) => (
          <span
            key={joy}
            className="rounded-full border border-border/40 bg-background/25 px-3 py-1 text-xs font-light text-foreground-secondary"
          >
            {joy}
          </span>
        ))}
      </CardContent>
    </Card>
  );
}
