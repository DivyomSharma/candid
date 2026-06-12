"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { OnboardingData } from "./OnboardingWizard";

const IDENTITY_QUESTIONS = [
  {
    id: "q1_home",
    title: "Which feels more like home?",
    options: ["Rain", "Coffee", "Library", "Forest", "City", "Cinema", "Vinyl"]
  },
  {
    id: "q2_place",
    title: "Choose one.",
    options: ["Late train", "Museum", "Bookstore", "Night drive", "Sunrise", "Ocean", "Mountain"]
  },
  {
    id: "q3_stays",
    title: "What usually stays with you longer?",
    options: ["music", "films", "people", "places", "words", "silence"]
  },
  {
    id: "q4_you",
    title: "Which feels more like you?",
    options: ["being understood", "being admired"]
  },
  {
    id: "q5_time",
    title: "Choose one.",
    options: ["slow mornings", "late nights"]
  },
  {
    id: "q6_action",
    title: "Choose one.",
    options: ["walking", "texting", "calling"]
  }
];

export function StepIdentity({
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
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSelect = (option: string) => {
    const q = IDENTITY_QUESTIONS[currentIndex];
    updateData({ 
      identityChoices: { ...data.identityChoices, [q.id]: option }
    });
    
    // Slight delay before moving to next so they see the tap
    setTimeout(() => {
      if (currentIndex < IDENTITY_QUESTIONS.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        onNext();
      }
    }, 300);
  };

  const handleBack = () => {
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
    else onBack();
  };

  const question = IDENTITY_QUESTIONS[currentIndex];

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <AnimatePresence mode="wait">
        <motion.div 
          key={question.id}
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 1.05 }} 
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center w-full"
        >
          <h2 className="text-2xl font-light mb-12 text-center text-foreground font-cursive text-3xl">
            {question.title}
          </h2>
          <div className="flex flex-wrap justify-center gap-3 w-full max-w-[400px]">
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                className={`py-3 px-6 rounded-full border transition-all text-md font-light tracking-wide ${
                  data.identityChoices[question.id] === opt 
                    ? 'bg-foreground text-background border-foreground scale-95' 
                    : 'bg-transparent border-border/40 text-foreground hover:bg-surface/50 hover:border-border'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-16 h-12 flex gap-4">
        <button onClick={handleBack} className="px-6 py-2 rounded-full text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wide">
          Back
        </button>
        <button 
          onClick={() => {
            if (currentIndex < IDENTITY_QUESTIONS.length - 1) setCurrentIndex(i => i + 1);
            else onNext();
          }} 
          className="px-6 py-2 rounded-full border border-transparent text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wide"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
