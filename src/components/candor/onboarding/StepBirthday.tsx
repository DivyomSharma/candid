"use client";

import type { OnboardingData } from "./OnboardingWizard";

export function StepBirthday({
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
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-light mb-16 text-center text-foreground">
        When were you born?
      </h2>
      
      <div className="relative">
        <input
          type="date"
          value={data.birthday}
          onChange={(e) => updateData({ birthday: e.target.value })}
          className="appearance-none bg-transparent text-4xl font-light text-center outline-none border-b border-border/40 focus:border-foreground pb-2 transition-colors [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full cursor-pointer"
        />
      </div>
      
      <div className="mt-16 h-12 flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-full text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wide"
        >
          Back
        </button>
        {data.birthday && (
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
