"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plane, MapPin } from "lucide-react";

const VACATIONS = [
  { name: "Kyoto, Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800" },
  { name: "Amalfi Coast, Italy", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=800" },
  { name: "Banff, Canada", image: "https://images.unsplash.com/photo-1544333323-16788fc312c1?q=80&w=800" },
  { name: "Santorini, Greece", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800" },
  { name: "Reykjavik, Iceland", image: "https://images.unsplash.com/photo-1504893524553-b8eeab3facf2?q=80&w=800" },
  { name: "Bali, Indonesia", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800" }
];

export function SuggestedVacation() {
  const [seed] = useState(() => Math.floor(Math.random() * VACATIONS.length));
  const vacation = useMemo(() => VACATIONS[seed], [seed]);

  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl overflow-hidden relative group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={vacation.image}
        alt={vacation.name}
        className="absolute inset-0 h-full w-full object-cover opacity-40 mix-blend-luminosity transition-all duration-700 group-hover:opacity-60 group-hover:mix-blend-normal group-hover:scale-105"
      />
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
