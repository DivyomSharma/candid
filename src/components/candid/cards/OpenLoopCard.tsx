"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface OpenLoopCardProps {
  topic: string;
  onClick: () => void;
  className?: string;
}

export function OpenLoopCard({ topic, onClick, className }: OpenLoopCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onClick={onClick}
      className={cn("cursor-pointer group", className)}
    >
      <Card className="overflow-hidden border-none shadow-none bg-gradient-to-br from-card/10 to-transparent backdrop-blur-sm relative p-8 min-h-[160px] flex flex-col justify-center">
        {/* Soft floating background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors duration-1000 -mr-10 -mt-10 pointer-events-none" />
        
        <CardContent className="p-0 relative z-10 flex flex-col gap-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-foreground-secondary/50 font-light">
            Unfinished
          </span>
          <p className="text-lg font-light text-foreground/80 italic leading-relaxed group-hover:text-foreground transition-colors duration-500">
            "{topic}..."
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
