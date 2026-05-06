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

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ duration: 0.24 }}
    >
      <div className="flex flex-col gap-3">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_event, info) => {
            if (isLeaving) return;
            if (info.offset.x >= SWIPE_THRESHOLD) {
              setIsLeaving(true);
              onDecide(true);
            } else if (info.offset.x <= -SWIPE_THRESHOLD) {
              setIsLeaving(true);
              onDecide(false);
            }
          }}
          whileDrag={{ rotate: 2, scale: 1.01 }}
        >
          <Card className="surface border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <p className="text-xl font-light leading-9 text-foreground-secondary">{line}</p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex items-center justify-between px-2 text-xs font-light text-foreground-secondary/80">
          <span className="flex items-center gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            not quite
          </span>
          <span className="flex items-center gap-1.5">
            feels right
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
