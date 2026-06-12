"use client";

import { useState, useEffect } from "react";

export function useVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState<number>(0);
  const [viewportOffset, setViewportOffset] = useState<number>(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;

    const handleResize = () => {
      setViewportHeight(vv.height);
      setViewportOffset(vv.offsetTop);
      
      // A common heuristic: if visual viewport is significantly smaller than window height,
      // it usually means the keyboard is open.
      setIsKeyboardOpen(vv.height < window.innerHeight * 0.8);
    };

    vv.addEventListener("resize", handleResize);
    vv.addEventListener("scroll", handleResize);

    // Initial check
    handleResize();

    return () => {
      vv.removeEventListener("resize", handleResize);
      vv.removeEventListener("scroll", handleResize);
    };
  }, []);

  return { viewportHeight, viewportOffset, isKeyboardOpen };
}
