"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const VACATIONS = [
  { name: "Kyoto, Japan" },
  { name: "Amalfi Coast, Italy" },
  { name: "Banff, Canada" },
  { name: "Santorini, Greece" },
  { name: "Reykjavik, Iceland" },
  { name: "Bali, Indonesia" }
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
        console.error(err);
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
      ) : imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt={vacation.name}
          className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity transition-all duration-700 group-hover:opacity-60 group-hover:mix-blend-normal group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-accent/10" />
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
