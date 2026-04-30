"use client";

import { ReactLenis } from "lenis/react";
import { useEffect, useState } from "react";

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  if (reducedMotion) return <>{children}</>;

  return (
    <ReactLenis
      root
      options={{
        anchors: true,
        autoRaf: true,
        duration: 1.75,
        easing: (time) => 1 - Math.pow(1 - time, 3),
        smoothWheel: true,
        wheelMultiplier: 0.72,
        touchMultiplier: 0.9,
      }}
    >
      {children}
    </ReactLenis>
  );
}
