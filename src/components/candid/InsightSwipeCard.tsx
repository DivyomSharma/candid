"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type InsightSwipeCardProps = {
  line: string;
  onDecide: (accepted: boolean) => void;
};

const SWIPE_THRESHOLD = 72;

export function InsightSwipeCard({ line, onDecide }: InsightSwipeCardProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const leave = (accepted: boolean) => {
    if (isLeaving) return;
    setIsLeaving(true);
    setDirection(accepted ? "right" : "left");
    window.setTimeout(() => onDecide(accepted), 240);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={
        direction === "right"
          ? { opacity: 0, x: 120, y: -6, rotate: 6, scale: 0.98 }
          : direction === "left"
            ? { opacity: 0, x: -120, y: -6, rotate: -6, scale: 0.98 }
            : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.24, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-3">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_event, info) => {
            if (info.offset.x >= SWIPE_THRESHOLD) {
              leave(true);
            } else if (info.offset.x <= -SWIPE_THRESHOLD) {
              leave(false);
            }
          }}
          whileDrag={{ rotate: 2, scale: 1.01 }}
        >
          <Card className="surface soft-shadow border-border/50 bg-card/60 backdrop-blur-md shadow-[inset_0_1px_0_hsl(var(--foreground)/0.03),0_22px_70px_-34px_hsl(var(--glow)/0.24)]">
            <CardContent className="p-6">
              <p className="text-xl font-light leading-9 text-foreground-secondary">{line}</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex items-center justify-between px-2 text-xs font-light text-foreground-secondary/80">
          <span className="flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            not really
          </span>
          <span className="flex items-center gap-1.5">
            kind of
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
