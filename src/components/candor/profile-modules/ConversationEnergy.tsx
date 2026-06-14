"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

export function ConversationEnergy({ chips }: { chips: string[] }) {
  if (!chips || chips.length === 0) return null;
  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/70 flex items-center gap-1.5">
          <Zap className="h-3 w-3 text-accent" />
          conversation energy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 flex flex-wrap gap-2">
        {chips.map((chip, i) => (
          <motion.span
            key={chip}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-full border border-accent/20 bg-background/40 px-3.5 py-1.5 text-xs font-light text-foreground"
          >
            {chip}
          </motion.span>
        ))}
      </CardContent>
    </Card>
  );
}
