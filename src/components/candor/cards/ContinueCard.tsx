"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface ContinueCardProps {
  label: string;
  teaser: string;
  onClick: () => void;
  className?: string;
}

export function ContinueCard({ label, teaser, onClick, className }: ContinueCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onClick}
      className={cn("cursor-pointer group", className)}
    >
      <Card className="surface overflow-hidden border-border/40 bg-card/20 backdrop-blur-md hover:bg-card/30 transition-colors">
        <CardContent className="p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-[candor-breathe_3s_ease-in-out_infinite]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-foreground-secondary/70 font-light">
                {label}
              </span>
            </div>
            <p className="text-sm font-light text-foreground/90 italic leading-relaxed">
              "{teaser}"
            </p>
            <div className="flex items-center text-xs text-accent/80 font-light tracking-wide group-hover:text-accent transition-colors">
              Continue <ArrowRight className="ml-1.5 h-3 w-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
