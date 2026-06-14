"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export function SignatureObjects({ objects }: { objects: string[] }) {
  if (!objects || objects.length === 0) return null;
  return (
    <Card className="glass-card border-none bg-gradient-to-t from-background/10 to-transparent shadow-none flex flex-col justify-center min-h-[140px]">
      <CardContent className="p-8 flex items-center justify-center gap-6">
        {objects.slice(0, 3).map((obj, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.8 }}
            className="text-4xl filter drop-shadow-md"
          >
            {obj}
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
