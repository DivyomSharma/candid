"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OnboardingData } from "./OnboardingWizard";

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

  const renderContent = () => {
    switch (subStep) {
      case 1:
        return (
          <motion.div key="city" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center w-full">
            <h2 className="text-2xl font-light mb-12 text-center text-foreground">Where are you based?</h2>
            <input
              type="text"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
              placeholder="e.g. New York, London, Tokyo"
              className="w-full max-w-[300px] text-center text-3xl font-light bg-transparent border-b border-border/40 focus:border-foreground outline-none pb-2 transition-colors placeholder:text-muted/30"
              onKeyDown={(e) => { 
                if (e.key === "Enter" && data.city) {
                  e.preventDefault();
                  handleNext(); 
                }
              }}
            />
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
