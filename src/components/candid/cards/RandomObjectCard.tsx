"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RandomObjectCardProps {
  type: 'polaroid' | 'cassette' | 'ticket';
  imageUrl?: string;
  text: string;
  className?: string;
  onClick?: () => void;
}

export function RandomObjectCard({ type, imageUrl, text, className, onClick }: RandomObjectCardProps) {
  if (type === 'polaroid') {
    return (
      <motion.div
        whileHover={{ y: -8, scale: 1.02, rotate: 0 }}
        initial={{ opacity: 0, rotate: -3 }}
        animate={{ opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={onClick}
        className={cn("cursor-pointer group shadow-2xl relative", className)}
      >
        <div className="bg-[#fcfcfc] p-3 pb-12 w-48 sm:w-56 shadow-md border border-black/5">
          {imageUrl ? (
            <div className="aspect-square w-full bg-zinc-200 overflow-hidden relative">
              <div 
                className="w-full h-full bg-cover bg-center grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            </div>
          ) : (
            <div className="aspect-square w-full bg-zinc-800/5 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-zinc-800/10" />
            </div>
          )}
          <div className="absolute bottom-3 left-0 w-full text-center px-4">
            <span className="text-sm text-zinc-800 font-serif italic tracking-wide">
              {text}
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  if (type === 'ticket') {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        onClick={onClick}
        className={cn("cursor-pointer group flex", className)}
      >
        <div className="relative flex w-64 bg-card/40 backdrop-blur-md border border-border/20 shadow-lg overflow-hidden">
          {/* Ticket cutouts */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-r border-border/20" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background border-l border-border/20" />
          
          <div className="flex-1 p-6 border-r border-dashed border-border/30 flex flex-col justify-center">
            <span className="text-[9px] uppercase tracking-[0.2em] text-foreground-secondary/50 mb-1">
              Admit One
            </span>
            <span className="text-sm font-light text-foreground tracking-wider">
              {text}
            </span>
          </div>
          <div className="w-16 flex items-center justify-center bg-card/20">
            <span className="text-xs tracking-widest text-foreground-secondary/40 -rotate-90 whitespace-nowrap">
              CANDID
            </span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Cassette
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      onClick={onClick}
      className={cn("cursor-pointer group", className)}
    >
      <div className="relative w-64 h-40 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-3 flex flex-col justify-between overflow-hidden">
        {/* Cassette texture/screws */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-800" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-800" />
        <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-800" />
        <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-800" />

        {/* Top thicker part */}
        <div className="h-6 w-full bg-zinc-800/50 rounded-sm mb-2" />

        {/* Label */}
        <div className="flex-1 bg-[#e6e2d3] rounded-sm p-2 flex flex-col relative">
          <div className="border-b border-zinc-400/30 pb-1 mb-2">
            <span className="text-zinc-800 text-xs font-serif italic">{text}</span>
          </div>
          
          {/* Spools */}
          <div className="flex justify-center gap-6 mt-1">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-zinc-800 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#e6e2d3]" />
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-zinc-800 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#e6e2d3]" />
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-2 left-0 w-full flex justify-between px-4">
            <span className="text-[8px] text-zinc-500 font-bold uppercase">A</span>
            <span className="text-[8px] text-zinc-500 font-bold">NR</span>
          </div>
        </div>

        {/* Bottom part */}
        <div className="h-4 mt-2 flex justify-center">
          <div className="w-32 h-full bg-zinc-800/80 rounded-t-sm" />
        </div>
      </div>
    </motion.div>
  );
}
