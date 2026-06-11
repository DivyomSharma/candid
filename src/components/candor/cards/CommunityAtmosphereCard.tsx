"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface CommunityAtmosphereCardProps {
  ambientThought: string;
  className?: string;
}

export function CommunityAtmosphereCard({ ambientThought, className }: CommunityAtmosphereCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.8 }}
      className={cn("group cursor-pointer", className)}
    >
      <Card className="overflow-hidden border-none shadow-none bg-card/5 backdrop-blur-md relative flex items-center justify-center p-8 min-h-[160px]">
        {/* Soft glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-1000 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        
        <CardContent className="p-0 relative z-10 text-center">
          <p className="text-xl font-light tracking-wide text-foreground-secondary/80 group-hover:text-foreground/90 transition-colors duration-700 leading-relaxed max-w-[280px]">
            {ambientThought}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
