"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShelfItemCard } from "@/components/candor/widgets/ShelfItemCard";

export function ShelfModule({ title, items }: { title: string, items: Array<{ key: string, value: string }> }) {
  if (!items || items.length === 0) return null;
  return (
    <Card className="glass-card border-border/30 bg-card/20 backdrop-blur-3xl shadow-xl flex flex-col justify-between">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="text-[10px] font-light uppercase tracking-[0.2em] text-foreground-secondary/70">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-2 flex flex-col gap-3">
        {items.map((item) => (
          <ShelfItemCard key={item.key} item={item} />
        ))}
      </CardContent>
    </Card>
  );
}
