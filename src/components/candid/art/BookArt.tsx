"use client";

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookArtProps {
  className?: string;
  width?: number;
  height?: number;
  state?: number; // Added to match other art signatures if needed
}

export function BookArt({ className, width = 200, height = 200, state = 1 }: BookArtProps) {
  return (
    <div className={cn("relative pointer-events-none select-none", className)} style={{ width, height }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-accent"
        initial={{ opacity: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <BookOpen size={width} strokeWidth={1.5} absoluteStrokeWidth={true} />
      </motion.div>
    </div>
  );
}
