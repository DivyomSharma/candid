"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface EnvironmentCardProps {
  location: string;
  time: string;
  condition: string;
  imageUrl: string;
  onClick: () => void;
  className?: string;
}

export function EnvironmentCard({ location, time, condition, imageUrl, onClick, className }: EnvironmentCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onClick={onClick}
      className={cn("cursor-pointer group h-full", className)}
    >
      <Card className="glass-card overflow-hidden border border-border/40 bg-card/30 backdrop-blur-3xl transition-colors hover:border-accent/30 shadow-xl relative min-h-[240px] h-full">
        {imageUrl && (
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 p-6 flex flex-col justify-end w-full">
          <div className="flex items-center gap-2 mb-2 text-foreground/80">
            <MapPin size={12} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-light">
              Current Vibe
            </span>
          </div>
          <h3 className="text-sm font-light text-foreground/90 leading-snug drop-shadow-sm">
            {location} &bull; {time}
          </h3>
        </div>
      </Card>
    </motion.div>
  );
}
