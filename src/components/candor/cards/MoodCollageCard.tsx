"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MoodCollageCardProps {
  images: string[];
  className?: string;
  onClick?: () => void;
}

export function MoodCollageCard({ images, className, onClick }: MoodCollageCardProps) {
  if (!images || images.length === 0) return null;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group cursor-pointer relative overflow-hidden rounded-3xl", className)}
      onClick={onClick}
    >
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1 p-1 bg-background/20 backdrop-blur-md">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={cn(
              "relative overflow-hidden rounded-2xl",
              idx === 0 && images.length === 3 ? "col-span-2 row-span-1" : "col-span-1 row-span-1"
            )}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${img})` }}
            />
            {/* Soft vignette per image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ))}
      </div>
      
      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 pointer-events-none" />
      <div className="absolute bottom-4 left-6 pointer-events-none">
        <p className="text-xs font-light tracking-widest uppercase text-white/90 drop-shadow-md">
          candor mood
        </p>
      </div>
    </motion.div>
  );
}
