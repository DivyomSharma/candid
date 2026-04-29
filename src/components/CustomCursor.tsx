import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsDesktop(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setIsHovering(true);
    const handleMouseUp = () => setIsHovering(false);

    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          Boolean(target.closest("a, button, input, textarea, [role='button']")),
      );
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleElementHover);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleElementHover);
    };
  }, [isDesktop]);

  if (!isDesktop) return null;

  return (
    <>
      <motion.div
        className="fixed pointer-events-none z-[9999] rounded-full border border-accent/90"
        animate={{
          x: position.x - 16,
          y: position.y - 16,
          scale: isHovering ? 1.45 : 1,
        }}
        transition={{
          x: { type: "tween", duration: 0 },
          y: { type: "tween", duration: 0 },
          scale: { type: "spring", stiffness: 320, damping: 24 },
        }}
        style={{
          width: 32,
          height: 32,
          boxShadow: "0 0 0 1px hsl(var(--background) / 0.45), 0 0 18px hsl(var(--accent) / 0.35)",
        }}
      />
      <motion.div
        className="fixed pointer-events-none z-[10000] rounded-full bg-accent"
        animate={{
          x: position.x - 3,
          y: position.y - 3,
          scale: isHovering ? 0.8 : 1,
        }}
        transition={{
          x: { type: "tween", duration: 0 },
          y: { type: "tween", duration: 0 },
          scale: { type: "spring", stiffness: 320, damping: 24 },
        }}
        style={{
          width: 6,
          height: 6,
          boxShadow: "0 0 0 1px hsl(var(--background) / 0.65), 0 0 10px hsl(var(--accent) / 0.5)",
        }}
      />
    </>
  );
}
