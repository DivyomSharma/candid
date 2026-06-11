"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface VisualMemoryCardProps {
  text: string;
  imageUrl: string;
  className?: string;
}

export function VisualMemoryCard({ text, imageUrl, className }: VisualMemoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("group cursor-pointer", className)}
    >
      <Card className="relative overflow-hidden border-0 bg-transparent min-h-[300px] shadow-lg">
        {/* Full bleed image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        
        {/* Blurred Vignette */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-all duration-700 group-hover:backdrop-blur-none group-hover:bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        
        <CardContent className="relative p-8 h-full flex flex-col justify-end z-10 min-h-[300px]">
          <p className="text-lg font-light text-white/95 leading-relaxed tracking-wide drop-shadow-lg text-center balance-text">
            {text}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
