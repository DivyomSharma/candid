"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Compass } from "lucide-react";

export function CuriosityModule({ topics }: { topics: string[] }) {
  if (!topics || topics.length === 0) return null;
  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/70 flex items-center gap-1.5">
          <Compass className="h-3 w-3 text-accent" />
          current curiosity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 flex flex-col gap-2">
        {topics.map((topic, i) => (
          <div key={i} className="text-lg font-light text-foreground capitalize tracking-wide">
            {topic}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
