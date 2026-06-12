"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-0 inset-x-0 z-[200] flex justify-center p-2 pointer-events-none"
        >
          <div className="bg-background/80 backdrop-blur-3xl border border-border/40 shadow-xl rounded-full px-4 py-2 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-accent/80" />
            <span className="text-xs font-light tracking-wide text-foreground-secondary">
              offline mode. syncing paused.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
