"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AmbientGlyphProps {
  icon: LucideIcon;
  className?: string;
  isCompass?: boolean;
}

export function AmbientGlyph({ icon: Icon, className, isCompass }: AmbientGlyphProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {isCompass && (
        <style>{`
          .compass-needle-spin path:first-child {
            transform-origin: 12px 12px;
            animation: compass-spin 30s linear infinite;
          }
          @keyframes compass-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      )}
      <motion.div
        className={cn(
          "fixed pointer-events-none select-none z-0 mix-blend-multiply dark:mix-blend-plus-lighter text-accent opacity-60 dark:opacity-100",
          "bottom-[-10%] right-[-10%]",
          isCompass && "compass-needle-spin",
          className
        )}
        initial={{ opacity: 0.05, y: 0, rotate: 0 }}
        animate={{ 
          opacity: [0.05, 0.12, 0.05],
          y: [0, -15, 0],
          rotate: [-1, 2, -1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        style={{
          filter: "drop-shadow(0 0 16px hsl(var(--accent)/0.4))",
        }}
      >
        <Icon 
          size={700} 
          strokeWidth={1} 
          absoluteStrokeWidth={true} 
        />
      </motion.div>
    </>
  );
}
