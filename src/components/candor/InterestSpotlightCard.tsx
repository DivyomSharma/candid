"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

type InterestSpotlightCardProps = {
  prompt: string;
  options: string[];
  onChoose: (index: number) => void;
};

export function InterestSpotlightCard({ prompt, options, onChoose }: InterestSpotlightCardProps) {
  const lines = prompt.split("\n");

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.24 }}>
      <Card className="surface soft-shadow border-border/50 bg-card/60 backdrop-blur-md shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03),0_20px_60px_-32px_hsl(var(--glow)/0.24)]">
        <CardContent className="flex flex-col gap-5 p-5">
          <div className="space-y-2">
            {lines.map((line, index) => (
              <p
                key={`${line}-${index}`}
                className={index === 0 ? "text-sm font-light text-foreground-secondary" : "text-lg font-light leading-8 text-foreground"}
              >
                {line}
              </p>
            ))}
          </div>

          <div className="flex flex-wrap gap-2.5">
            {options.map((option, index) => (
              <button
                key={`${option}-${index}`}
                type="button"
                onClick={() => onChoose(index)}
                className="rounded-full border border-border/50 bg-background/18 px-4 py-2.5 text-sm font-light text-foreground-secondary transition-colors hover:border-accent/70 hover:bg-background/28 hover:text-foreground"
              >
                {option}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
