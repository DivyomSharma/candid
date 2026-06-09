"use client";

import { motion } from "framer-motion";

export function CandorLoading() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background">
      <div className="relative flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute h-[250px] w-[250px] rounded-full bg-accent blur-[80px]"
        />
        <motion.div
          animate={{ 
            filter: ["blur(4px)", "blur(0px)", "blur(4px)"],
            opacity: [0.4, 1, 0.4],
            scale: [0.97, 1, 0.97]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10 text-4xl font-light tracking-[0.25em] text-foreground"
        >
          candor
        </motion.div>
      </div>
    </div>
  );
}
