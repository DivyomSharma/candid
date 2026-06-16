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
  strokeWidth?: number;
}

/**
 * A wrapper for Candid V6.5 Ambient Line Art.
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
  strokeWidth = 1.5,
}: LineArtProps) {
  return (
    <motion.div
      className={cn("text-accent flex items-center justify-center pointer-events-none", className)}
      animate={{ 
        // Idle breathing effect only when state === 1
        scale: state === 1 ? [1, 1.02, 1] : 1 
      }}
      transition={{
        scale: state === 1 ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 },
      }}
    >
      <motion.svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        initial="idle"
        animate={state >= 2 ? "hover" : "idle"}
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
        idle: { pathLength: 1, opacity: 1 },
        hover: { pathLength: [0, 1], opacity: 1 }
      }}
      transition={{
        pathLength: { duration: 1.5, ease: "easeInOut", delay },
        opacity: { duration: 0.5, ease: "easeInOut" }
      }}
    />
  );
}
