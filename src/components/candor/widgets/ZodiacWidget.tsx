"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Moon, Sun } from "lucide-react";
import { useMemo } from "react";

const ZODIAC_SIGNS = [
  { name: "Capricorn", start: [1, 1], end: [1, 19], icon: "♑\uFE0E", element: "Earth" },
  { name: "Aquarius", start: [1, 20], end: [2, 18], icon: "♒\uFE0E", element: "Air" },
  { name: "Pisces", start: [2, 19], end: [3, 20], icon: "♓\uFE0E", element: "Water" },
  { name: "Aries", start: [3, 21], end: [4, 19], icon: "♈\uFE0E", element: "Fire" },
  { name: "Taurus", start: [4, 20], end: [5, 20], icon: "♉\uFE0E", element: "Earth" },
  { name: "Gemini", start: [5, 21], end: [6, 20], icon: "♊\uFE0E", element: "Air" },
  { name: "Cancer", start: [6, 21], end: [7, 22], icon: "♋\uFE0E", element: "Water" },
  { name: "Leo", start: [7, 23], end: [8, 22], icon: "♌\uFE0E", element: "Fire" },
  { name: "Virgo", start: [8, 23], end: [9, 22], icon: "♍\uFE0E", element: "Earth" },
  { name: "Libra", start: [9, 23], end: [10, 22], icon: "♎\uFE0E", element: "Air" },
  { name: "Scorpio", start: [10, 23], end: [11, 21], icon: "♏\uFE0E", element: "Water" },
  { name: "Sagittarius", start: [11, 22], end: [12, 21], icon: "♐\uFE0E", element: "Fire" },
  { name: "Capricorn", start: [12, 22], end: [12, 31], icon: "♑\uFE0E", element: "Earth" }
];

function getZodiacSign(dob: string) {
  const date = new Date(dob);
  if (isNaN(date.getTime())) return null;

  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  for (const sign of ZODIAC_SIGNS) {
    if (
      (month === sign.start[0] && day >= sign.start[1]) ||
      (month === sign.end[0] && day <= sign.end[1])
    ) {
      return sign;
    }
  }
  return null;
}

export function ZodiacWidget({ dob }: { dob: string | null }) {
  const sign = useMemo(() => (dob ? getZodiacSign(dob) : null), [dob]);

  if (!sign) return null;

  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 opacity-10 p-4">
        <Sparkles className="h-16 w-16" />
      </div>
      <CardContent className="p-5 flex items-center justify-between relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-foreground-secondary/70 font-light block mb-1">
            Sun Sign
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-light text-foreground">{sign.name}</span>
            <span className="text-xs font-light text-foreground-secondary uppercase tracking-widest px-2 py-0.5 rounded-full border border-border/40">
              {sign.element}
            </span>
          </div>
        </div>
        <div className="text-4xl opacity-80 mix-blend-luminosity text-foreground" style={{ fontFamily: '"Apple Symbols", "Segoe UI Symbol", sans-serif' }}>
          {sign.icon}
        </div>
      </CardContent>
    </Card>
  );
}
