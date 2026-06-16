"use client";

import { useState } from "react";
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
  const [selected, setSelected] = useState<"a" | "b" | null>(null);

  const handleSelect = (choice: "a" | "b") => {
    if (selected) return;
    setSelected(choice);
    window.setTimeout(() => onChoose(choice), 220);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={
        selected === "a"
          ? { opacity: 0, x: -34, y: -8, scale: 0.985 }
          : selected === "b"
            ? { opacity: 0, x: 34, y: -8, scale: 0.985 }
            : { opacity: 1, x: 0, y: 0, scale: 1 }
      }
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <Card className="surface soft-shadow border-border/50 bg-card/60 backdrop-blur-md shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03),0_20px_60px_-32px_hsl(var(--glow)/0.26)]">
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
              onClick={() => handleSelect("a")}
              className="flex min-h-24 items-center rounded-2xl border border-border/50 bg-background/20 px-4 py-4 text-left text-sm font-light leading-6 text-foreground-secondary transition-colors hover:border-accent/70 hover:bg-background/30 hover:text-foreground disabled:opacity-100"
              disabled={selected !== null}
            >
              <span className="block text-balance">{optionA}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelect("b")}
              className="flex min-h-24 items-center rounded-2xl border border-border/50 bg-background/20 px-4 py-4 text-left text-sm font-light leading-6 text-foreground-secondary transition-colors hover:border-accent/70 hover:bg-background/30 hover:text-foreground disabled:opacity-100"
              disabled={selected !== null}
            >
              <span className="block text-balance">{optionB}</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
