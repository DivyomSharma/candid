"use client";

import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AmbientLogoProps {
  className?: string;
}

const POSITIONS = [
  "top-[-20%] right-[-10%]", // Top Right
  "bottom-[-20%] right-[-10%]", // Bottom Right
  "top-[-20%] left-[-10%]", // Top Left
  "bottom-[-20%] left-[-10%]", // Bottom Left
];

export function AmbientLogo({ className }: AmbientLogoProps) {
  const [mounted, setMounted] = useState(false);
  
  // Randomly choose a position on mount so it's consistent during a session on a single page,
  // but varies across different page mounts.
  const randomPosition = useMemo(() => {
    return POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch on random classes

  return (
    <motion.div
      className={cn(
        "fixed pointer-events-none select-none z-0 mix-blend-plus-lighter",
        randomPosition,
        className
      )}
      initial={{ opacity: 0.03, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: [0.03, 0.05, 0.03],
        x: [0, 4, 0, -4, 0],
        y: [0, -4, 0, 4, 0],
        rotate: [0, 0.15, 0, -0.15, 0],
      }}
      transition={{
        duration: 120,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        filter: "blur(0.5px)",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        className="text-accent stroke-[1.25px] md:stroke-[1px] w-[1400px] h-[1400px] min-w-[900px] max-w-[2200px]"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M 80 15 H 45 C 10 15, 5 85, 40 95 C 50 98, 55 90, 55 90 C 65 98, 80 92, 85 85 C 90 78, 85 75, 80 75 H 55 C 25 75, 25 45, 55 45 H 85 C 92 45, 95 40, 95 30 V 25 C 95 15, 88 15, 80 15 Z" />
      </svg>
    </motion.div>
  );
}
