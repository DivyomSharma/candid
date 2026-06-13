"use client";

import { motion } from "framer-motion";
import { Disc } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

export function SpinningVinyl({
  title,
  artist,
  coverUrl,
}: {
  title: string;
  artist?: string;
  coverUrl?: string;
}) {
  return (
    <Card className="glass-card border-border/30 bg-card/20 max-md:backdrop-blur-md md:backdrop-blur-3xl shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
      <CardContent className="p-5 flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0">
          {/* Vinyl Record Background */}
          <div className="absolute inset-0 rounded-full bg-black shadow-lg flex items-center justify-center">
            {/* Grooves */}
            <div className="absolute inset-1 rounded-full border border-white/10" />
            <div className="absolute inset-3 rounded-full border border-white/10" />
            <div className="absolute inset-5 rounded-full border border-white/10" />
          </div>

          {/* Spinning Cover/Label */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="h-8 w-8 rounded-full overflow-hidden border border-black/40 relative">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={title}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-accent" />
              )}
              {/* Spindle Hole */}
              <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-white/80 shadow-inner" />
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 mb-1 text-accent">
            <Disc className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase tracking-widest text-foreground-secondary/70 font-light">On repeat</span>
          </div>
          <h4 className="text-sm font-medium text-foreground truncate">{title}</h4>
          {artist && (
            <p className="text-xs font-light text-foreground-secondary truncate">
              {artist}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
