"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface MovieCardProps {
  title: string;
  reason: string;
  posterUrl: string;
  className?: string;
}

export function MovieCard({ title, reason, posterUrl, className }: MovieCardProps) {
  const [fetchedPoster, setFetchedPoster] = useState<string | null>(null);

  useEffect(() => {
    // If a high-quality TMDB poster is explicitly provided, skip dynamic fetching
    if (!title || (posterUrl && posterUrl.includes("tmdb.org"))) return;

    const query = encodeURIComponent(title);
    fetch(`https://itunes.apple.com/search?term=${query}&entity=movie&limit=3`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results.length > 0) {
          // Try to find exact match to avoid random wrong posters, or fallback to first
          const match = data.results.find((r: { trackName?: string; artworkUrl100: string }) => r.trackName?.toLowerCase() === title.toLowerCase()) || data.results[0];
          const highResUrl = match.artworkUrl100.replace("100x100bb.jpg", "1000x1000bb.jpg");
          setFetchedPoster(highResUrl);
        }
      })
      .catch(console.error);
  }, [title, posterUrl]);

  const displayPoster = fetchedPoster || posterUrl;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("group cursor-pointer h-full", className)}
    >
      <Card className="relative overflow-hidden border-0 bg-transparent h-full min-h-[400px] w-full shadow-2xl">
        {/* Background Poster */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 group-hover:scale-105"
          style={{ backgroundImage: `url(${displayPoster})` }}
        />
        
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] mix-blend-multiply transition-opacity duration-700 group-hover:opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40" />
        
        {/* Film Grain (SVG noise) */}
        <div 
          className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
        />
        
        <CardContent className="relative p-8 h-full flex flex-col justify-between z-10 text-center">
          <div className="flex justify-center w-full mt-2">
            <div className="flex items-center gap-2 text-white/60 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
              <Film className="h-3 w-3 animate-[candor-breathe_3s_ease-in-out_infinite]" />
              <span className="text-[9px] uppercase tracking-widest font-light">Cinema</span>
            </div>
          </div>
          
          <div className="space-y-4 opacity-90 group-hover:opacity-100 transition-opacity duration-500 mt-auto pb-4">
            <h4 className="text-2xl font-light text-white tracking-[0.2em] uppercase leading-tight drop-shadow-md">{title}</h4>
            <div className="w-12 h-[1px] bg-white/30 mx-auto" />
            <p className="text-xs font-light text-white/80 italic leading-relaxed max-w-[220px] mx-auto drop-shadow-sm">
              "{reason}"
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
