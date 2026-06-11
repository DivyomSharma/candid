"use client";

import { ReactNode } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LineArtProps {
  className?: string;
  children: ReactNode;
  /** Opacity state: 0 (invisible), 1 (idle/breathing), 2 (hover), 3 (selected/active) */
  state?: 0 | 1 | 2 | 3;
  width?: number;
  height?: number;
  viewBox?: string;
}

/**
 * A wrapper for Candor V6.5 Ambient Line Art.
 * Handles the smooth opacity transitions, path length drawing on hover,
 * and idle breathing animations automatically.
 *
 * Ensure children are <motion.path> elements.
 */
export function LineArt({
  className,
  children,
  state = 1,
  width = 120,
  height = 120,
  viewBox = "0 0 120 120",
}: LineArtProps) {
  // Map states to opacity levels
  const opacityMap = {
    0: 0,
    1: 0.08, // Idle
    2: 0.16, // Hover
    3: 0.25, // Active/Selected
  };

  const targetOpacity = opacityMap[state];

  return (
    <motion.div
      className={cn("text-accent flex items-center justify-center pointer-events-none", className)}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: targetOpacity,
        // Idle breathing effect only when state === 1
        scale: state === 1 ? [1, 1.02, 1] : 1 
      }}
      transition={{
        opacity: { duration: 0.8, ease: "easeInOut" },
        scale: state === 1 ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 },
      }}
    >
      <motion.svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        // On hover (state >= 2), draw the path.
        initial="hidden"
        animate={state >= 2 ? "visible" : "hidden"}
      >
        {children}
      </motion.svg>
    </motion.div>
  );
}

/**
 * A helper to wrap individual paths.
 * Usage: `<LineArtPath d="..." state={state} />`
 */
export function LineArtPath({ d, state = 1, delay = 0 }: { d: string; state?: number; delay?: number }) {
  return (
    <motion.path
      d={d}
      variants={{
        hidden: { pathLength: 0.05, opacity: 0.5 },
        visible: { pathLength: 1, opacity: 1 }
      }}
      transition={{
        pathLength: { duration: 2, ease: "easeInOut", delay },
        opacity: { duration: 1, ease: "easeInOut", delay }
      }}
    />
  );
}
