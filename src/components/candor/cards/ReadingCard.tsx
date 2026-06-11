"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

interface ReadingCardProps {
  title: string;
  author: string;
  quote: string;
  coverUrl: string;
  onClick: () => void;
  className?: string;
}

export function ReadingCard({ title, author, quote, coverUrl, onClick, className }: ReadingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      onClick={onClick}
      className={cn("cursor-pointer group h-full", className)}
    >
      <Card className="glass-card overflow-hidden border border-border/40 bg-card/30 backdrop-blur-3xl transition-colors hover:border-accent/30 shadow-xl flex flex-col sm:flex-row min-h-[280px] h-full">
        {coverUrl && (
          <div className="w-full sm:w-2/5 h-48 sm:h-auto overflow-hidden relative border-b sm:border-b-0 sm:border-r border-border/20">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${coverUrl})` }}
            />
          </div>
        )}
        <div className="flex-1 p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-4 text-foreground/80">
            <BookOpen size={12} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-light">
              Now Reading
            </span>
          </div>
          <p className="text-sm font-light text-foreground/90 italic leading-relaxed mb-4 drop-shadow-sm">
            "{quote}"
          </p>
          <div className="w-6 h-[1px] bg-border/50 mb-4" />
          <h3 className="text-sm font-light text-foreground/90">
            {title}
          </h3>
          <p className="text-[10px] uppercase tracking-[0.1em] text-foreground-secondary/60 mt-1">
            {author}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
