"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type ChoiceTapCardProps = {
  prompt: string;
  optionA: string;
  optionB: string;
  onChoose: (choice: "a" | "b") => void;
};

export function ChoiceTapCard({ prompt, optionA, optionB, onChoose }: ChoiceTapCardProps) {
  const [lead, ...rest] = prompt.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, y: -8 }}
      transition={{ duration: 0.26 }}
    >
      <Card className="surface border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col gap-5 p-5">
          <div className="space-y-3">
            <p className="text-xs font-light text-foreground-secondary">{lead}</p>
            <div className="space-y-2">
              {rest.map((line, index) => (
                <p key={`${line}-${index}`} className="text-lg font-light leading-8 text-foreground">
                  {line}
                </p>
              ))}
            </div>
            <p className="pt-2 text-sm font-light text-foreground-secondary">which feels more like you?</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChoose("a")}
              className="flex min-h-24 items-center rounded-2xl border border-border/50 px-4 py-4 text-left text-sm font-light leading-6 text-foreground-secondary transition-colors hover:border-accent/70 hover:text-foreground"
            >
              <span className="block text-balance">{optionA}</span>
            </button>
            <button
              type="button"
              onClick={() => onChoose("b")}
              className="flex min-h-24 items-center rounded-2xl border border-border/50 px-4 py-4 text-left text-sm font-light leading-6 text-foreground-secondary transition-colors hover:border-accent/70 hover:text-foreground"
            >
              <span className="block text-balance">{optionB}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
