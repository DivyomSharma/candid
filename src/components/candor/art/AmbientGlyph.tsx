"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface AmbientGlyphProps {
  icon: LucideIcon;
  className?: string;
}

export function AmbientGlyph({ icon: Icon, className }: AmbientGlyphProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <motion.div
      className={cn(
        "fixed pointer-events-none select-none z-0 mix-blend-plus-lighter text-accent",
        "bottom-[-10%] right-[-10%]",
        className
      )}
      initial={{ opacity: 0.03 }}
      animate={{ opacity: [0.03, 0.06, 0.03] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      style={{
        filter: "drop-shadow(0 0 12px hsl(var(--accent)/0.3))",
      }}
    >
      <Icon 
        size={700} 
        strokeWidth={1} 
        absoluteStrokeWidth={true} 
      />
    </motion.div>
  );
}
