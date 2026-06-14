"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";

export function Gallery({ images }: { images: string[] }) {
  if (!images || images.length === 0) return null;

  return (
    <Card className="glass-card overflow-hidden border-none shadow-xl min-h-[250px] relative">
      {/* We just show the first image as a beautiful full-bleed cover for now */}
      <Image
        src={images[0]}
        alt="Profile Gallery"
        fill
        className="object-cover transition-transform duration-700 hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-4 left-4">
        <span className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/70 bg-background/40 backdrop-blur-md px-3 py-1 rounded-full">
          gallery
        </span>
      </div>
    </Card>
  );
}
