"use client";

import { motion } from "framer-motion";

export function StepFinal({
  isSubmitting,
  onComplete,
}: {
  isSubmitting: boolean;
  onComplete: () => void;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center min-h-[50vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 1.5, ease: "easeOut" }}
        className="mb-16"
      >
        {/* Placeholder for Candor one-line SVG art */}
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-accent opacity-80 mx-auto candor-breathe">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-2xl text-foreground font-light mb-2 max-w-[320px]"
      >
        that's enough for now.
      </motion.p>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="text-xl text-muted-foreground font-light mb-16 max-w-[320px]"
      >
        the rest, i'd rather discover slowly.
      </motion.p>
      
      <motion.button
        initial={{ opacity: 0, filter: "blur(4px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ delay: 3, duration: 1 }}
        onClick={onComplete}
        disabled={isSubmitting}
        className="px-8 py-3 rounded-full bg-foreground text-background font-medium tracking-wide hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSubmitting ? "Entering..." : "Enter Candor"}
      </motion.button>
    </div>
  );
}
