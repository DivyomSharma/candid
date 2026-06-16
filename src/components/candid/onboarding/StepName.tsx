"use client";

import { useEffect, useRef } from "react";
import type { OnboardingData } from "./OnboardingWizard";

export function StepName({
  data,
  updateData,
  onNext,
}: {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto focus with a slight delay for the animation
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-light mb-12 text-center text-muted-foreground">
        What should Candid call you?
      </h2>
      
      <input
        ref={inputRef}
        type="text"
        value={data.name}
        onChange={(e) => updateData({ name: e.target.value })}
        placeholder="your name"
        className="w-full max-w-[300px] text-center text-4xl font-light bg-transparent border-b border-border/40 focus:border-foreground outline-none pb-2 transition-colors placeholder:text-muted/30"
        onKeyDown={(e) => {
          if (e.key === "Enter" && data.name.trim().length > 0) {
            e.preventDefault();
            onNext();
          }
        }}
      />
      
      <div className="mt-16 h-12">
        {data.name.trim().length > 0 && (
          <button
            onClick={onNext}
            className="px-6 py-2 rounded-full border border-border/50 hover:bg-foreground/5 transition-colors text-sm tracking-wide"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
