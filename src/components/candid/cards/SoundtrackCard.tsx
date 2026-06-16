"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Play } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface SoundtrackCardProps {
  title: string;
  artist: string;
  reason: string;
  coverUrl: string;
  onPlay?: () => void;
  className?: string;
}

export function SoundtrackCard({ title, artist, reason, coverUrl, onPlay, className }: SoundtrackCardProps) {
  const [highResCover, setHighResCover] = useState<string | null>(null);

  useEffect(() => {
    if (!title || !artist) return;
    const query = encodeURIComponent(`${title} ${artist}`);
    fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          const highResUrl = data.results[0].artworkUrl100.replace("100x100bb.jpg", "1000x1000bb.jpg");
          setHighResCover(highResUrl);
        }
      })
      .catch(console.error);
  }, [title, artist]);

  const displayCover = highResCover || coverUrl;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("group cursor-pointer h-full", className)}
      onClick={onPlay}
    >
      <Card className="relative overflow-hidden border-0 bg-black/40 h-full min-h-[300px]">
        {/* Background Image with heavy blur for Apple Music feel */}
        <div 
          className="absolute inset-[-50%] bg-cover bg-center bg-no-repeat opacity-40 blur-3xl saturate-200 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-60"
          style={{ backgroundImage: `url(${displayCover})` }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
        
        <CardContent className="relative p-8 h-full flex flex-col z-10">
          <div className="flex items-center justify-between mb-auto">
            <div className="flex items-center gap-2 text-white/80">
              <Music className="h-3.5 w-3.5 animate-[candid-breathe_3s_ease-in-out_infinite]" />
              <span className="text-[10px] uppercase tracking-widest font-light">
                Tonight's Soundtrack
              </span>
            </div>
            
            {/* Equalizer animation */}
            <div className="flex items-end gap-1 h-3 opacity-70">
              <motion.div 
                animate={{ height: ["4px", "12px", "4px"] }} 
                transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }} 
                className="w-[3px] bg-white rounded-full" 
              />
              <motion.div 
                animate={{ height: ["8px", "4px", "10px", "8px"] }} 
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }} 
                className="w-[3px] bg-white rounded-full" 
              />
              <motion.div 
                animate={{ height: ["6px", "10px", "6px"] }} 
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }} 
                className="w-[3px] bg-white rounded-full" 
              />
            </div>
          </div>
          
          <div className="flex items-end gap-6 mt-8">
            {/* Crisp Album Art */}
            <div className="shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden shadow-2xl shadow-black/60 relative group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] transition-shadow duration-500">
              <Image src={displayCover} alt={title} fill sizes="(max-width: 640px) 96px, 128px" className="object-cover" unoptimized />
            </div>

            <div className="flex-1 min-w-0 flex justify-between items-end pb-2">
              <div className="space-y-1">
                <h4 className="text-xl sm:text-2xl font-light text-white tracking-wide truncate">{title}</h4>
                <p className="text-sm sm:text-base font-light text-white/70 truncate">{artist}</p>
                
                <p className="text-xs font-light text-white/50 italic leading-relaxed pt-3 hidden sm:block">
                  "{reason}"
                </p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center pl-1 transform opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-black/20 shrink-0">
                <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
