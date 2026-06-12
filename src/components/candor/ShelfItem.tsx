"use client";

import { motion } from "framer-motion";
import { Film, Disc, BookOpen, MapPin, Coffee, Camera, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShelfItemData = {
  type: "film" | "album" | "book" | "place" | "object" | "memory" | "photo" | "signal";
  title: string;
  coverUrl?: string;
  reason?: string;
  shared?: boolean;
};

export function ShelfItem({ item, index }: { item: ShelfItemData; index: number }) {
  const Icon = {
    film: Film,
    album: Disc,
    book: BookOpen,
    place: MapPin,
    object: Coffee,
    memory: Sparkles,
    photo: Camera,
    signal: Sparkles,
  }[item.type] || Sparkles;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border border-white/5 bg-card/20 p-4 transition-all hover:scale-[1.02] hover:border-white/10 hover:shadow-2xl",
        item.shared && "border-accent/20 bg-accent/5 ring-1 ring-accent/10"
      )}
    >
      {item.coverUrl && (
        <>
          <img
            src={item.coverUrl}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover opacity-60 mix-blend-luminosity transition-all duration-700 group-hover:opacity-100 group-hover:mix-blend-normal"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </>
      )}

      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Icon className={cn("h-3.5 w-3.5", item.shared ? "text-accent" : "text-foreground-secondary")} />
          <span className="text-[10px] font-light uppercase tracking-[0.2em] text-white/50">
            {item.shared ? "shared " : ""}{item.type}
          </span>
        </div>
        <h4 className="font-serif text-lg leading-tight text-white/90">{item.title}</h4>
        {item.reason && (
          <p className="mt-1 line-clamp-2 text-xs font-light text-white/60">
            {item.reason}
          </p>
        )}
      </div>
    </motion.div>
  );
}
