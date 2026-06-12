"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

interface EnvironmentCardProps {
  location?: string;
  time?: string;
  condition?: string;
  imageUrl?: string;
  onClick: () => void;
  className?: string;
}

export function EnvironmentCard({ 
  location: fallbackLocation = "Raining in Seattle", 
  time: fallbackTime = "11:42 PM", 
  condition: fallbackCondition = "rain", 
  imageUrl: fallbackImageUrl = "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80", 
  onClick, 
  className 
}: EnvironmentCardProps) {
  const [data, setData] = useState({
    location: fallbackLocation,
    time: fallbackTime,
    condition: fallbackCondition,
    imageUrl: fallbackImageUrl
  });

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch("/api/candor/me/weather");
        if (res.ok) {
          const json = await res.json();
          if (json.location) {
            setData({
              location: json.location,
              time: json.time,
              condition: json.condition,
              imageUrl: json.imageUrl
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    }
    void fetchWeather();
  }, []);
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
        {data.imageUrl && (
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{ backgroundImage: `url(${data.imageUrl})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 p-6 flex flex-col justify-end w-full relative z-10">
          <div className="flex items-center gap-2 mb-2 text-foreground/80">
            <MapPin size={12} strokeWidth={1.5} />
            <span className="text-[10px] uppercase tracking-[0.2em] font-light">
              Current Vibe
            </span>
          </div>
          <h3 className="text-sm font-light text-foreground/90 leading-snug drop-shadow-sm">
            {data.location} &bull; {data.time}
          </h3>
        </div>
      </Card>
    </motion.div>
  );
}
