"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OnboardingData } from "./OnboardingWizard";
import { Search, Film, Disc, BookOpen, Check } from "lucide-react";
import Image from "next/image";

interface MediaResult {
  id: string;
  title: string;
  subtitle: string;
  coverUrl: string;
}

export function StepMedia({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [subStep, setSubStep] = useState<"movie" | "album" | "book">("movie");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const typeValue = subStep === "movie" ? "movie" : subStep === "album" ? "album" : "ebook";
        const res = await fetch(`/api/candid/search/media?q=${encodeURIComponent(query)}&type=${typeValue}`);
        const json = await res.json();
        
        if (json.results) {
          const mapped = json.results.map((r: Record<string, unknown>) => ({
            id: (r.trackId ?? r.collectionId)?.toString() || "",
            title: (r.trackName || r.collectionName) as string || "",
            subtitle: (r.artistName || r.director) as string || "",
            coverUrl: r.artworkUrl100 ? (r.artworkUrl100 as string).replace("100x100bb", "600x600bb") : "",
          })).filter((r: MediaResult) => r.title && r.coverUrl);
          
          setResults(mapped);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, subStep]);

  const getShelfItem = (type: string) => {
    return data.shelf_items?.find(i => i.type === type);
  };

  const selectMedia = (media: MediaResult, type: "film" | "album" | "book") => {
    const existing = data.shelf_items || [];
    const filtered = existing.filter(i => i.type !== type);
    updateData({
      shelf_items: [
        ...filtered,
        {
          type,
          title: media.title,
          coverUrl: media.coverUrl,
          reason: media.subtitle,
        }
      ]
    });
    setQuery("");
    setResults([]);
    
    // Auto advance
    if (type === "film") setSubStep("album");
    else if (type === "album") setSubStep("book");
    else handleNext();
  };

  const handleNext = () => {
    onNext();
  };

  const renderSearch = (
    typeTitle: string, 
    typeValue: "movie" | "album" | "ebook", 
    shelfType: "film" | "album" | "book",
    Icon: React.ElementType
  ) => {
    const selected = getShelfItem(shelfType);

    return (
      <motion.div key={shelfType} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center w-full max-w-md">
        <Icon className="w-12 h-12 text-foreground/20 mb-6" />
        <h2 className="text-3xl font-light mb-2 text-center text-foreground">Your favorite {typeTitle}?</h2>
        <p className="text-muted-foreground text-sm font-light mb-8">Let's add it to your shelf.</p>
        
        {selected ? (
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="relative w-40 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <Image src={selected.coverUrl as string} alt={selected.title as string} fill sizes="160px" className="object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    updateData({ shelf_items: (data.shelf_items || []).filter(i => i.type !== shelfType) });
                  }}
                  className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-xs font-medium text-white"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">{selected.title as string}</p>
              <p className="text-muted-foreground text-sm">{selected.reason as string}</p>
            </div>
            <button 
              onClick={() => {
                if (shelfType === "film") setSubStep("album");
                else if (shelfType === "album") setSubStep("book");
                else handleNext();
              }}
              className="mt-6 px-8 py-3 rounded-full bg-foreground text-background font-medium"
            >
              Continue
            </button>
          </div>
        ) : (
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search for a ${typeTitle}...`}
              className="w-full text-lg font-light bg-surface/30 border border-border/50 rounded-2xl focus:border-foreground outline-none py-3 pl-12 pr-4 transition-colors placeholder:text-muted/30"
            />
            {isSearching && (
              <div className="absolute right-4 top-4 w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
            )}
            {results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden shadow-2xl z-50 max-h-[300px] overflow-y-auto">
                {results.map(r => (
                  <button
                    key={r.id}
                    onClick={() => selectMedia(r, shelfType)}
                    className="w-full text-left p-3 hover:bg-foreground/5 transition-colors flex items-center gap-4 border-b border-border/10 last:border-0"
                  >
                    <div className="w-12 h-16 relative shrink-0 rounded-md shadow-sm overflow-hidden">
                      <Image src={r.coverUrl} alt={r.title} fill sizes="48px" className="object-cover" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate font-medium text-foreground">{r.title}</span>
                      <span className="text-xs text-muted-foreground truncate">{r.subtitle}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[60vh]">
      <AnimatePresence mode="wait">
        {subStep === "movie" && renderSearch("movie", "movie", "film", Film)}
        {subStep === "album" && renderSearch("album", "album", "album", Disc)}
        {subStep === "book" && renderSearch("book", "ebook", "book", BookOpen)}
      </AnimatePresence>

      <div className="mt-12 h-12 flex gap-4">
        <button 
          onClick={() => {
            if (subStep === "book") setSubStep("album");
            else if (subStep === "album") setSubStep("movie");
            else onBack();
          }} 
          className="px-6 py-2 rounded-full text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wide"
        >
          Back
        </button>
        {!getShelfItem(subStep === "movie" ? "film" : subStep === "album" ? "album" : "book") && (
          <button 
            onClick={() => {
              if (subStep === "movie") setSubStep("album");
              else if (subStep === "album") setSubStep("book");
              else handleNext();
            }} 
            className="px-6 py-2 rounded-full border border-border/50 hover:bg-foreground/5 transition-colors text-sm tracking-wide text-muted-foreground"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}
