"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, Play } from "lucide-react";
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
      className={cn("group cursor-pointer", className)}
      onClick={onPlay}
    >
      <Card className="relative overflow-hidden border-0 bg-transparent min-h-[256px]">
        {/* Background Image with blur */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${displayCover})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <CardContent className="relative p-6 h-full flex flex-col justify-between z-10 min-h-[256px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/80">
              <Music className="h-3.5 w-3.5 animate-[candor-breathe_3s_ease-in-out_infinite]" />
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
          
          <div className="space-y-4 mt-8">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <h4 className="text-xl font-light text-white tracking-wide">{title}</h4>
                <p className="text-sm font-light text-white/70">{artist}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md text-white flex items-center justify-center pl-0.5 transform opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-black/20">
                <Play className="h-4 w-4 fill-current" />
              </div>
            </div>
            
            <p className="text-xs font-light text-white/60 italic leading-relaxed pt-2 border-t border-white/10">
              "{reason}"
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
