"use client";

import { useCallback } from "react";

export function useHaptics() {
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {
        // Ignore errors (e.g. if the user hasn't interacted with the page yet)
      }
    }
  }, []);

  const triggerLight = useCallback(() => vibrate(10), [vibrate]);
  const triggerMedium = useCallback(() => vibrate(50), [vibrate]);
  const triggerHeavy = useCallback(() => vibrate([100, 50, 100]), [vibrate]);

  return { vibrate, triggerLight, triggerMedium, triggerHeavy };
}
