"use client";

import { motion } from "framer-motion";
import { AmbientGlow } from "@/components/magicui/ambient-glow";

export default function GlobalLoading() {
  return (
    <main className="gradient-bg grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <AmbientGlow />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-4 text-center"
      >
        <motion.div 
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.98, 1.02, 0.98] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_20px_rgba(255,255,255,0.6)]" 
        />
      </motion.div>
    </main>
  );
}
