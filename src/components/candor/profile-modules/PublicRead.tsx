"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

export function PublicRead({ sentence }: { sentence: string }) {
  if (!sentence) return null;
  return (
    <Card className="glass-card border-none bg-gradient-to-br from-accent/10 to-background/5 backdrop-blur-3xl shadow-lg flex flex-col justify-center min-h-[160px]">
      <CardContent className="p-8 flex items-start gap-4">
        <Quote className="h-6 w-6 text-accent/40 shrink-0 mt-1" />
        <p className="text-lg font-light leading-relaxed text-foreground/90 italic">
          "{sentence}"
        </p>
      </CardContent>
    </Card>
  );
}
