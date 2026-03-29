import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Hide cursor when not moving
      if (Math.abs(e.clientX - lastMousePos.x) > 2 || Math.abs(e.clientY - lastMousePos.y) > 2) {
        setIsVisible(true);
      }
      setLastMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseEnter = () => setIsVisible(true);
    const handleMouseLeave = () => setIsVisible(false);

    const handleMouseDown = () => setIsHovering(true);
    const handleMouseUp = () => setIsHovering(false);

    // Hide cursor over interactive elements
    const handleElementHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "A" ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.closest("a") ||
        target.closest("button") ||
        target.closest("input")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    // Hide cursor after delay
    let hideTimeout: NodeJS.Timeout;
    const handleActivity = () => {
      setIsVisible(true);
      clearTimeout(hideTimeout);
      hideTimeout = setTimeout(() => setIsVisible(false), 1500);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleElementHover);
    document.addEventListener("mousemove", handleActivity);
    document.addEventListener("scroll", handleActivity);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleElementHover);
      document.removeEventListener("mousemove", handleActivity);
      document.removeEventListener("scroll", handleActivity);
      clearTimeout(hideTimeout);
    };
  }, [lastMousePos]);

  return (
    <>
      {/* Main heart cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        animate={{
          x: position.x - 12,
          y: position.y - 12,
          scale: isHovering ? 1.4 : 1,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          x: { type: "tween", duration: 0 },
          y: { type: "tween", duration: 0 },
          scale: { type: "spring", stiffness: 300, damping: 20 },
          opacity: { duration: 0.15 }
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      </motion.div>
    </>
  );
}
