"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OnboardingData } from "./OnboardingWizard";
import { Search, MapPin } from "lucide-react";

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
}

export function StepDemographics({
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
  const [subStep, setSubStep] = useState(1);

  const handleNext = () => {
    if (subStep < 3) setSubStep(s => s + 1);
    else onNext();
  };

  const handleBack = () => {
    if (subStep > 1) setSubStep(s => s - 1);
    else onBack();
  };

  const [query, setQuery] = useState(data.city || "");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchCity = async (val: string) => {
    setQuery(val);
    if (val.length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5&language=en&format=json`);
      const json = await res.json();
      setResults(json.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const selectCity = (c: GeocodingResult) => {
    updateData({
      city: c.name,
      state: c.admin1 || "",
      country: c.country || "",
      lat: c.latitude,
      lon: c.longitude,
      timezone: c.timezone || "",
    });
    setQuery(`${c.name}${c.admin1 ? `, ${c.admin1}` : ''}, ${c.country}`);
    setResults([]);
    handleNext();
  };

  const renderContent = () => {
    switch (subStep) {
      case 1:
        return (
          <motion.div key="city" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-light mb-12 text-center text-foreground">Where are you based?</h2>
            <div className="relative w-full max-w-[300px]">
              <Search className="absolute left-0 top-2 h-6 w-6 text-muted-foreground/50" />
              <input
                type="text"
                value={query}
                onChange={(e) => searchCity(e.target.value)}
                placeholder="Search city..."
                className="w-full text-xl font-light bg-transparent border-b border-border/40 focus:border-foreground outline-none pb-2 pl-10 transition-colors placeholder:text-muted/30"
              />
              {results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-2xl z-50">
                  {results.map(r => (
                    <button
                      key={r.id}
                      onClick={() => selectCity(r)}
                      className="w-full text-left px-4 py-3 hover:bg-foreground/5 transition-colors flex items-center gap-3 border-b border-border/10 last:border-0"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-foreground">{r.name}</span>
                        <span className="text-[10px] text-muted-foreground truncate uppercase tracking-widest">{r.admin1 ? `${r.admin1}, ` : ''}{r.country}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="gender" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-light mb-8 text-center text-foreground">How do you identify?</h2>
            <div className="flex flex-col gap-3 w-full max-w-[240px]">
              {["Woman", "Man", "Non-binary", "Other", "Prefer not to say"].map((g) => (
                <button
                  key={g}
                  onClick={() => { updateData({ gender: g }); handleNext(); }}
                  className={`py-3 px-4 rounded-xl border transition-all text-sm font-medium ${data.gender === g ? 'bg-foreground text-background border-foreground' : 'bg-surface/30 border-border/40 text-foreground/80 hover:bg-surface'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="looking" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-light mb-8 text-center text-foreground">What brings you here?</h2>
            <div className="flex flex-wrap justify-center gap-3 w-full max-w-[320px]">
              {["Women", "Men", "Everyone", "Friendships", "Communities", "Conversations", "Not sure"].map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    const current = data.lookingFor;
                    const updated = current.includes(l) ? current.filter(x => x !== l) : [...current, l];
                    updateData({ lookingFor: updated });
                  }}
                  className={`py-2 px-4 rounded-full border transition-all text-sm ${data.lookingFor.includes(l) ? 'bg-foreground text-background border-foreground' : 'bg-transparent border-border/50 text-foreground/80 hover:border-foreground/50'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      <div className="mt-12 h-12 flex gap-4">
        <button onClick={handleBack} className="px-6 py-2 rounded-full text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wide">
          Back
        </button>
        <button onClick={handleNext} className={`px-6 py-2 rounded-full border transition-colors text-sm tracking-wide ${subStep === 1 && !data.city ? "border-transparent text-muted-foreground" : "border-border/50 hover:bg-foreground/5"}`}>
          {subStep === 1 && !data.city ? "Skip" : "Continue"}
        </button>
      </div>
    </div>
  );
}
