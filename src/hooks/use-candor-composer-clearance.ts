"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const DEFAULT_COMPOSER_CLEARANCE = 200;
const READABLE_BOTTOM_GAP = 24;

export function useCandorComposerClearance<T extends HTMLElement>() {
  const composerRef = useRef<T | null>(null);
  const [composerClearance, setComposerClearance] = useState(DEFAULT_COMPOSER_CLEARANCE);

  const measureComposerClearance = useCallback(() => {
    const composer = composerRef.current;
    if (!composer || typeof window === "undefined") return;

    const rect = composer.getBoundingClientRect();
    const viewportBottom = window.visualViewport
      ? window.visualViewport.offsetTop + window.visualViewport.height
      : window.innerHeight;
    const fixedBottomGap = Math.max(0, viewportBottom - rect.bottom);
    const nextClearance = Math.ceil(rect.height + fixedBottomGap + READABLE_BOTTOM_GAP);

    setComposerClearance((current) => (Math.abs(current - nextClearance) > 1 ? nextClearance : current));
  }, []);

  useLayoutEffect(() => {
    measureComposerClearance();

    const composer = composerRef.current;
    if (!composer || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(measureComposerClearance);
    observer.observe(composer);

    return () => observer.disconnect();
  }, [measureComposerClearance]);

  useEffect(() => {
    measureComposerClearance();

    window.addEventListener("resize", measureComposerClearance);
    window.addEventListener("orientationchange", measureComposerClearance);
    window.visualViewport?.addEventListener("resize", measureComposerClearance);
    window.visualViewport?.addEventListener("scroll", measureComposerClearance);

    return () => {
      window.removeEventListener("resize", measureComposerClearance);
      window.removeEventListener("orientationchange", measureComposerClearance);
      window.visualViewport?.removeEventListener("resize", measureComposerClearance);
      window.visualViewport?.removeEventListener("scroll", measureComposerClearance);
    };
  }, [measureComposerClearance]);

  return { composerRef, composerClearance, measureComposerClearance };
}
