"use client";

import { motion } from "framer-motion";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface CloudArtProps {
  className?: string;
  width?: number;
  height?: number;
  state?: number; // Added to match other art signatures if needed
}

export function CloudArt({ className, width = 200, height = 200, state = 1 }: CloudArtProps) {
  return (
    <div className={cn("relative pointer-events-none select-none", className)} style={{ width, height }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center mix-blend-plus-lighter text-foreground/20"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: [0.8, 1, 0.8], y: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: "drop-shadow(0 0 12px hsl(var(--foreground)/0.1))" }}
      >
        <Cloud size={width} strokeWidth={0.5} absoluteStrokeWidth={true} />
      </motion.div>
    </div>
  );
}
