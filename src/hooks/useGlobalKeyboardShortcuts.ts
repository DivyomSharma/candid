"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useGlobalKeyboardShortcuts() {
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      const isInput = document.activeElement?.tagName === "INPUT";
      const isTextarea = document.activeElement?.tagName === "TEXTAREA";
      const isOnboarding = pathname?.startsWith("/candid/onboarding");

      // Global Enter Key Behavior (works across entire PWA)
      if (e.key === "Enter" && !isTextarea) {
        // Find all buttons on the page
        const buttons = Array.from(document.querySelectorAll("button"));
        
        // Define primary action text we want Enter to trigger
        const primaryTexts = ["Continue", "Begin", "Enter Candid", "Save", "Submit", "Send"];
        
        const primaryBtn = buttons.find(b => {
          const text = b.innerText.trim();
          return primaryTexts.includes(text);
        });

        if (primaryBtn && !primaryBtn.disabled) {
          e.preventDefault();
          primaryBtn.click();
        }
      }

      // Onboarding-Specific Arrow Key Behavior
      if (isOnboarding && !isInput && !isTextarea) {
        if (e.key === "ArrowRight") {
          const buttons = Array.from(document.querySelectorAll("button"));
          const nextBtn = buttons.find(b => 
            b.innerText.trim() === "Continue" || 
            b.innerText.trim() === "Skip" || 
            b.innerText.trim() === "Begin" ||
            b.innerText.trim() === "Enter Candid"
          );
          if (nextBtn && !nextBtn.disabled) {
            e.preventDefault();
            nextBtn.click();
          }
        } else if (e.key === "ArrowLeft") {
          const buttons = Array.from(document.querySelectorAll("button"));
          const backBtn = buttons.find(b => b.innerText.trim() === "Back");
          if (backBtn && !backBtn.disabled) {
            e.preventDefault();
            backBtn.click();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pathname]);
}
