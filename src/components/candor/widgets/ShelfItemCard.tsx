"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Film, Music, BookOpen, Coffee, Compass } from "lucide-react";
import { useRouter } from "next/navigation";

export function ShelfItemCard({ item }: { item: { key: string; value: string } }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let type = "";
    if (item.key.includes("movie") || item.key.includes("film") || item.key.includes("cinema")) type = "movie";
    else if (item.key.includes("album") || item.key.includes("music") || item.key.includes("song")) type = "album";
    else if (item.key.includes("book") || item.key.includes("novel") || item.key.includes("read")) type = "ebook";

    if (type) {
      fetch(`/api/candor/search/media?q=${encodeURIComponent(item.value)}&type=${type}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.results && data.results.length > 0) {
            // Replace 100x100 with larger resolution
            const url = data.results[0].artworkUrl100?.replace("100x100bb", "600x600bb") || data.results[0].artworkUrl100;
            setImageUrl(url);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [item.key, item.value]);

  const handleClick = () => {
    router.push(`/candor/session/ongoing?q=Why+did+you+suggest+the+${encodeURIComponent(item.key)}+"${encodeURIComponent(item.value)}"?`);
  };

  const getIcon = () => {
    if (item.key.includes("movie") || item.key.includes("film")) return <Film className="h-3.5 w-3.5 text-accent/80" />;
    if (item.key.includes("album") || item.key.includes("music")) return <Music className="h-3.5 w-3.5 text-accent/80" />;
    if (item.key.includes("book") || item.key.includes("read")) return <BookOpen className="h-3.5 w-3.5 text-accent/80" />;
    if (item.key.includes("caf")) return <Coffee className="h-3.5 w-3.5 text-accent/80" />;
    return <Compass className="h-3.5 w-3.5 text-accent/80" />;
  };

  return (
    <div 
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/30 bg-background/20 hover:border-accent/30 hover:bg-background/40 transition-all flex items-center shadow-sm"
    >
      {imageUrl && (
        <div className="h-[4.5rem] w-[4.5rem] shrink-0 border-r border-border/30 relative bg-muted/20">
          <Image src={imageUrl} alt={item.value} fill sizes="72px" className="object-cover" />
        </div>
      )}
      <div className="p-3.5 space-y-1 flex-1">
        <span className="text-[9px] uppercase tracking-widest text-foreground-secondary/60 font-light block line-clamp-1">{item.key}</span>
        <span className="text-sm font-light text-foreground flex items-center gap-2 line-clamp-2 leading-tight">
          {!imageUrl && getIcon()}
          {item.value}
        </span>
      </div>
    </div>
  );
}
