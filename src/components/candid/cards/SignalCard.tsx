"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface SignalCardProps {
  type: string;
  content: string;
  options?: string[];
  className?: string;
  onSelectOption?: (option: string) => void;
}

export function SignalCard({ type, content, options, className, onSelectOption }: SignalCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group", className)}
    >
      <Card className="surface overflow-hidden border-accent/20 bg-[linear-gradient(135deg,hsl(var(--card)/0.4),hsl(var(--background)/0.2))] backdrop-blur-md shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-accent/5 transition-all">
        <CardContent className="p-7 relative">
          <div className="absolute top-0 right-0 p-6 opacity-20 text-accent group-hover:opacity-40 transition-opacity">
            <Sparkles className="w-8 h-8" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[10px] uppercase tracking-widest text-accent font-medium">
              {type}
            </div>
            
            <h3 className="text-xl font-light leading-[1.4] text-foreground balance-text">
              {content}
            </h3>
            
            {options && options.length > 0 && (
              <div className="pt-2 flex flex-col gap-2">
                {options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectOption?.(option)}
                    className="text-left w-full rounded-xl border border-border/40 bg-background/40 px-4 py-3 text-sm font-light text-foreground-secondary hover:bg-accent hover:text-primary-foreground hover:border-accent transition-all"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
