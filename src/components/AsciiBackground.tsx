"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Draws a calm, slowly morphing ASCII field on a canvas.
 * Characters shift density based on a sine-wave pattern,
 * creating the illusion of a gently breathing surface.
 * Inherits the current theme's accent color via CSS custom properties.
 */

const CHARS = " .·:;+*#";
const CELL = 14;
const FONT_SIZE = 11;

export default function AsciiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    // Read accent color from CSS custom property
    const style = getComputedStyle(document.documentElement);
    const glowRaw = style.getPropertyValue("--glow").trim();
    const color = glowRaw ? `hsl(${glowRaw} / 0.18)` : "rgba(180,170,150,0.18)";

    ctx.font = `${FONT_SIZE}px "DM Sans", monospace`;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";

    const cols = Math.ceil(w / CELL) + 1;
    const rows = Math.ceil(h / CELL) + 1;
    const t = time * 0.0004;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * CELL;
        const y = row * CELL;

        // Multiple overlapping sine waves for organic feel
        const v1 = Math.sin(col * 0.12 + t) * Math.cos(row * 0.1 + t * 0.7);
        const v2 = Math.sin((col + row) * 0.08 + t * 0.5) * 0.5;
        const v3 = Math.cos(col * 0.05 - row * 0.06 + t * 0.3) * 0.3;
        const v = (v1 + v2 + v3 + 1.8) / 3.6; // normalize to 0..1

        const idx = Math.floor(v * (CHARS.length - 1));
        const ch = CHARS[idx];

        if (ch !== " ") {
          ctx.fillText(ch, x, y);
        }
      }
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}
