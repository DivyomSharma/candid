"use client";

import { useEffect, useRef } from "react";

/**
 * High-performance custom cursor using raw DOM transforms.
 * No React state, no Framer Motion re-renders on mousemove.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    if (!mediaQuery.matches) return;

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    ring.style.display = "block";
    dot.style.display = "block";

    let hovering = false;

    let raf = 0;
    let nextX = 0;
    let nextY = 0;

    const paint = () => {
      raf = 0;
      ring.style.transform = `translate3d(${nextX - 16}px, ${nextY - 16}px, 0) scale(${hovering ? 1.18 : 1})`;
      dot.style.transform = `translate3d(${nextX - 3}px, ${nextY - 3}px, 0)`;
    };

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      nextX = x;
      nextY = y;
      if (!raf) raf = requestAnimationFrame(paint);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      hovering =
        t.tagName === "A" ||
        t.tagName === "BUTTON" ||
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        Boolean(t.closest("a, button, input, textarea, [role='button']"));
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });

    const onChange = (e: MediaQueryListEvent) => {
      if (!e.matches) {
        ring.style.display = "none";
        dot.style.display = "none";
      }
    };
    mediaQuery.addEventListener("change", onChange);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      mediaQuery.removeEventListener("change", onChange);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const ringStyle: React.CSSProperties = {
    display: "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: "1px solid hsl(var(--accent) / 0.9)",
    pointerEvents: "none",
    zIndex: 9999,
    willChange: "transform",
    contain: "layout style paint",
    boxShadow: "0 0 0 1px hsl(var(--background) / 0.45), 0 0 18px hsl(var(--accent) / 0.35)",
  };

  const dotStyle: React.CSSProperties = {
    display: "none",
    position: "fixed",
    top: 0,
    left: 0,
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "hsl(var(--accent))",
    pointerEvents: "none",
    zIndex: 10000,
    willChange: "transform",
    contain: "layout style paint",
    boxShadow: "0 0 0 1px hsl(var(--background) / 0.65), 0 0 10px hsl(var(--accent) / 0.5)",
  };

  return (
    <>
      <div ref={ringRef} style={ringStyle} />
      <div ref={dotRef} style={dotStyle} />
    </>
  );
}
