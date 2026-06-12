"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTransitionRouter } from "next-view-transitions";
import { StepWelcome } from "./StepWelcome";
import { StepName } from "./StepName";
import { StepUsername } from "./StepUsername";
import { StepBirthday } from "./StepBirthday";
import { StepDemographics } from "./StepDemographics";
import { StepIdentity } from "./StepIdentity";
import { StepPhoto } from "./StepPhoto";
import { StepFinal } from "./StepFinal";

export type OnboardingData = {
  name: string;
  username: string;
  birthday: string;
  city: string;
  gender: string;
  lookingFor: string[];
  identityChoices: Record<string, string>;
  coverUrl?: string;
};

const TOTAL_STEPS = 9; // Including sub-steps roughly tracked

export function OnboardingWizard({ initialData }: { initialData?: Partial<OnboardingData> }) {
  const router = useTransitionRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    name: initialData?.name || "",
    username: initialData?.username || "",
    birthday: initialData?.birthday || "",
    city: initialData?.city || "",
    gender: initialData?.gender || "",
    lookingFor: initialData?.lookingFor || [],
    identityChoices: initialData?.identityChoices || {},
    coverUrl: initialData?.coverUrl || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
  };

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const completeOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/candor/me/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        router.push("/candor/home");
      } else {
        console.error("Failed to complete onboarding");
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      opacity: 0,
      y: direction > 0 ? 20 : -20,
      filter: "blur(8px)",
      scale: 0.98,
    }),
    center: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      scale: 1,
    },
    exit: (direction: number) => ({
      opacity: 0,
      y: direction < 0 ? 20 : -20,
      filter: "blur(8px)",
      scale: 1.02,
    }),
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepWelcome onNext={nextStep} />;
      case 2:
        return <StepName data={data} updateData={updateData} onNext={nextStep} />;
      case 3:
        return <StepUsername data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return <StepBirthday data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <StepDemographics data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 6:
        return <StepIdentity data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 7:
        return <StepPhoto data={data} updateData={updateData} onNext={nextStep} onBack={prevStep} />;
      case 8:
        return <StepFinal isSubmitting={isSubmitting} onComplete={completeOnboarding} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-6">
      {step > 1 && step < 8 && (
        <div className="absolute top-12 left-0 right-0 flex justify-center gap-1.5 z-20">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i < step - 1 ? "w-4 bg-foreground/80" : "w-1.5 bg-foreground/20"
              }`}
              initial={false}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
          className="w-full max-w-lg mx-auto flex flex-col items-center justify-center flex-1"
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
