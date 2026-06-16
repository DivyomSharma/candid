"use client";

import { motion } from "framer-motion";

export function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center w-full min-h-[50vh]">
      <motion.h1
        initial={{ opacity: 0, y: 10, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
        className="text-7xl font-light tracking-tighter mb-4"
      >
        hi.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-lg text-muted-foreground font-light mb-12 max-w-[280px]"
      >
        let's make this place feel like yours.
      </motion.p>
      
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
        onClick={onNext}
        className="px-8 py-3 rounded-full bg-foreground text-background font-medium tracking-wide hover:scale-105 active:scale-95 transition-transform"
      >
        Begin
      </motion.button>
    </div>
  );
}
