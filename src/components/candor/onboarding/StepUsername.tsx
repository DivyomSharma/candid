"use client";

import { useEffect, useRef } from "react";
import type { OnboardingData } from "./OnboardingWizard";

export function StepUsername({
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-light mb-2 text-center text-foreground">
        pick something people can remember.
      </h2>
      <p className="text-sm text-muted-foreground font-light mb-12">
        you can always change this later.
      </p>
      
      <div className="relative w-full max-w-[300px]">
        <span className="absolute left-0 bottom-2 text-3xl font-light text-muted-foreground/40">@</span>
        <input
          ref={inputRef}
          type="text"
          value={data.username}
          onChange={(e) => updateData({ username: e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '') })}
          placeholder="username"
          className="w-full pl-8 text-3xl font-light bg-transparent border-b border-border/40 focus:border-foreground outline-none pb-2 transition-colors placeholder:text-muted/30"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onNext();
            }
          }}
        />
      </div>
      
      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-[300px]">
        {/* Suggest some based on name if name exists */}
        {data.name && data.name.length > 2 && (
          <>
            <button onClick={() => updateData({ username: data.name.toLowerCase().replace(/\s+/g, '') })} className="text-xs px-3 py-1 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors">
              {data.name.toLowerCase().replace(/\s+/g, '')}
            </button>
            <button onClick={() => updateData({ username: `${data.name.toLowerCase().replace(/\s+/g, '')}_` })} className="text-xs px-3 py-1 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-colors">
              {data.name.toLowerCase().replace(/\s+/g, '')}_
            </button>
          </>
        )}
      </div>

      <div className="mt-16 h-12 flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-full text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wide"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className={`px-6 py-2 rounded-full border transition-colors text-sm tracking-wide ${
            data.username.length > 2 
              ? "border-border/50 hover:bg-foreground/5 text-foreground" 
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {data.username.length > 2 ? "Continue" : "Skip"}
        </button>
      </div>
    </div>
  );
}
