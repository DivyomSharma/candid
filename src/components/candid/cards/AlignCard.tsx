"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AlignCardProps {
  username: string;
  initials: string;
  tier: string;
  observation: string;
  avatarTone: string;
  className?: string;
  onClick?: () => void;
}

export function AlignCard({ username, initials, tier, observation, avatarTone, className, onClick }: AlignCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={cn("group cursor-pointer", className)}
      onClick={onClick}
    >
      <Card className="overflow-hidden border-none shadow-none bg-transparent relative flex flex-col items-center justify-center text-center p-8">
        <div 
          className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000 blur-3xl rounded-full" 
          style={{ background: `radial-gradient(circle at center, ${avatarTone} 0%, transparent 70%)` }} 
        />
        
        <CardContent className="p-0 relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-700 animate-[candid-breathe_3s_ease-in-out_infinite]" 
              style={{ background: avatarTone, transform: 'scale(1.5)' }} 
            />
            <Avatar className="h-24 w-24 border-none relative z-10">
              <AvatarFallback className="font-light text-2xl bg-card/20 backdrop-blur-md text-foreground shadow-lg">{initials}</AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex flex-col items-center gap-2 mt-2">
            <span className="text-lg font-light text-foreground tracking-wide">
              {username}
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-foreground-secondary/70 font-light">
              {tier}
            </span>
          </div>
          
          <p className="text-sm font-light text-foreground-secondary/70 italic mt-2 max-w-[200px] leading-relaxed">
            {observation}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
