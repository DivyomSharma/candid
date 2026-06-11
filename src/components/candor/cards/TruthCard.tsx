"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TruthCardProps {
  className?: string;
}

export function TruthCard({ className }: TruthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("col-span-full py-20 px-6", className)}
    >
      <Card className="border-0 bg-transparent shadow-none text-center max-w-md mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-0">
          <div className="relative mb-8">
            <span className="absolute inset-0 rounded-full bg-accent/20 blur-xl animate-[candor-breathe_2.8s_ease-in-out_infinite]" style={{ width: 48, height: 48, margin: 'auto' }} />
            <div className="relative h-12 w-12 rounded-full border border-accent/30 bg-background/60 backdrop-blur-md flex items-center justify-center">
              <Lock className="h-5 w-5 text-accent/70" />
            </div>
          </div>
          
          <h3 className="text-xl font-light text-foreground mb-3 tracking-wide">
            candor is still listening
          </h3>
          <p className="text-sm font-light text-foreground-secondary/70 max-w-sm leading-relaxed">
            there isn't enough data to reflect you honestly yet. we don't invent insights. keep talking, and this wall will slowly reveal what candor sees.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
