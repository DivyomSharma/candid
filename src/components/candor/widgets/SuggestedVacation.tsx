"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const VACATIONS = [
  { name: "Kyoto, Japan", fallback: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80" },
  { name: "Amalfi Coast, Italy", fallback: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80" },
  { name: "Banff, Canada", fallback: "https://images.unsplash.com/photo-1608229822650-8b1e42a9b343?auto=format&fit=crop&q=80" },
  { name: "Santorini, Greece", fallback: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80" },
  { name: "Reykjavik, Iceland", fallback: "https://images.unsplash.com/photo-1476610287331-b711a62e4045?auto=format&fit=crop&q=80" },
  { name: "Bali, Indonesia", fallback: "https://images.unsplash.com/photo-1537565266750-f8f94d935f8c?auto=format&fit=crop&q=80" }
];

export function SuggestedVacation() {
  const [seed] = useState(() => Math.floor(Math.random() * VACATIONS.length));
  const vacation = useMemo(() => VACATIONS[seed], [seed]);
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      try {
        const res = await fetch(`/api/candor/pexels?q=${encodeURIComponent(vacation.name)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            setImageUrl(data.imageUrl);
          }
        }
      } catch (err) {
        console.error("Failed to fetch Pexels image, using fallback", err);
      } finally {
        setIsLoading(false);
      }
    }
    void fetchImage();
  }, [vacation.name]);

  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl overflow-hidden relative group h-full">
      {isLoading ? (
        <div className="absolute inset-0 bg-accent/5 animate-pulse" />
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl || vacation.fallback}
          alt={vacation.name}
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity transition-all duration-700 group-hover:opacity-60 group-hover:mix-blend-normal group-hover:scale-105"
        />
      )}
      
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
      
      <CardContent className="p-5 flex flex-col justify-end h-full min-h-[140px] relative z-10">
        <div className="flex items-center gap-1.5 mb-2 text-white/70">
          <Plane className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-widest font-light">
            Suggested Getaway
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" />
          <h4 className="text-lg font-medium text-white tracking-wide">
            {vacation.name}
          </h4>
        </div>
      </CardContent>
    </Card>
  );
}
