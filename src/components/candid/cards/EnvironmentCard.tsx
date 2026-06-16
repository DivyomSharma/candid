"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
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

function WeatherParticles({ condition }: { condition: string }) {
  const isRain = condition.toLowerCase().includes("rain") || condition.toLowerCase().includes("shower");
  const isSnow = condition.toLowerCase().includes("snow");
  const isClear = condition.toLowerCase().includes("clear");
  const prefersReducedMotion = useReducedMotion();
  
  const [particleCount, setParticleCount] = useState(40);

  useEffect(() => {
    if (prefersReducedMotion) {
      setParticleCount(0);
      return;
    }
    const updateCount = () => {
      setParticleCount(window.innerWidth < 768 ? 8 : 40);
    };
    updateCount();
    window.addEventListener("resize", updateCount);
    return () => window.removeEventListener("resize", updateCount);
  }, [prefersReducedMotion]);
  
  if (particleCount === 0) return null;

  const particles = Array.from({ length: particleCount });
  
  if (isRain) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-900/40">
        {particles.map((_, i) => (
          <motion.div
            key={`rain-${i}`}
            className="absolute bg-white/20 w-[1.5px] h-[20px] rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`
            }}
            animate={{
              y: [0, 300],
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 0.5 + Math.random() * 0.3,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 1
            }}
          />
        ))}
      </div>
    );
  }

  if (isSnow) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-800/40">
        {particles.map((_, i) => (
          <motion.div
            key={`snow-${i}`}
            className="absolute bg-white/40 w-[4px] h-[4px] rounded-full blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-${Math.random() * 20}%`
            }}
            animate={{
              y: [0, 300],
              x: [0, Math.random() * 40 - 20],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    );
  }

  if (isClear) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-950/60">
        {particles.map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute bg-white/60 w-[2px] h-[2px] rounded-full blur-[1px]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.1, 0.8, 0.1],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>
    );
  }

  // Fallback (clouds/fog)
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none bg-slate-900/50">
      {particles.slice(0, 10).map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute bg-white/5 w-[150px] h-[150px] rounded-full blur-[40px]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            x: [0, 100, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
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
        const res = await fetch("/api/candid/me/weather");
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
      className={cn("cursor-pointer group h-full relative overflow-hidden rounded-3xl [contain:layout_paint_style]", className)}
    >
      <Card className="glass-card overflow-hidden border border-border/40 bg-card/30 max-md:backdrop-blur-md md:backdrop-blur-3xl transition-colors hover:border-accent/30 shadow-xl relative min-h-[240px] h-full">
        <WeatherParticles condition={data.condition} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
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
