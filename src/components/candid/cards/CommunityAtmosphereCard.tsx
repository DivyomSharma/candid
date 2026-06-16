"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface CommunityAtmosphereCardProps {
  ambientThought?: string;
  title?: string;
  items?: Array<{ icon: string | React.ElementType; label: string }>;
  className?: string;
}

export function CommunityAtmosphereCard({ ambientThought, title, items, className }: CommunityAtmosphereCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.8 }}
      className={cn("group cursor-pointer h-full", className)}
    >
      <Card className="overflow-hidden border-none shadow-none bg-card/5 backdrop-blur-md relative flex items-center justify-center p-8 min-h-[160px] h-full">
        {/* Soft glow */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-1000 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
        
        <CardContent className="p-0 relative z-10 w-full flex flex-col items-center justify-center text-center">
          {items && items.length > 0 ? (
            <div className="flex flex-col items-start gap-3 w-full max-w-[200px] mx-auto">
              {title && <h3 className="text-sm font-medium tracking-widest uppercase text-foreground-secondary/70 mb-2">{title}</h3>}
              {items.map((item, idx) => {
                const Icon = typeof item.icon === "string" ? null : item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3 text-foreground-secondary/90 group-hover:text-foreground transition-colors duration-500">
                    {Icon ? <Icon className="w-4 h-4" /> : <span className="text-lg leading-none">{item.icon as string}</span>}
                    <span className="text-sm font-light">{item.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xl font-light tracking-wide text-foreground-secondary/80 group-hover:text-foreground/90 transition-colors duration-700 leading-relaxed max-w-[280px]">
              {ambientThought}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
