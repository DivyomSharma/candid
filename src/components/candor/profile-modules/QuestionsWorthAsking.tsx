"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export function QuestionsWorthAsking({ questions }: { questions: string[] }) {
  if (!questions || questions.length === 0) return null;
  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/70 flex items-center gap-1.5">
          <HelpCircle className="h-3 w-3 text-accent" />
          questions worth asking
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 space-y-4">
        {questions.map((q, i) => (
          <div key={i} className="flex gap-3 items-start group">
            <span className="text-accent/50 text-xs font-light mt-0.5">{i + 1}.</span>
            <p className="text-sm font-light leading-relaxed text-foreground group-hover:text-accent transition-colors cursor-pointer">
              {q}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
