import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface DoodleProps {
  type: "heart" | "star" | "moon" | "scribble" | "eyes" | "sparkle";
  delay: number;
  duration: number;
  startX: number;
  startY: number;
  scale: number;
  rotation: number;
}

function HeartDoodle({ scale, rotation }: { scale: number; rotation: number }) {
  return (
    <motion.svg
      width={20 * scale}
      height={20 * scale}
      viewBox="0 0 24 24"
      fill="none"
      stroke="hsl(var(--glow) / 0.5)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ rotate: rotation }}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [rotation, rotation + 10, rotation - 10, rotation],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </motion.svg>
  );
}

function StarDoodle({ scale, rotation }: { scale: number; rotation: number }) {
  return (
    <motion.svg
      width={16 * scale}
      height={16 * scale}
      viewBox="0 0 24 24"
      fill="none"
      stroke="hsl(var(--glow) / 0.5)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ rotate: rotation }}
      animate={{
        scale: [1, 1.15, 1],
        rotate: [rotation, rotation + 180, rotation],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </motion.svg>
  );
}

function MoonDoodle({ scale, rotation }: { scale: number; rotation: number }) {
  return (
    <motion.svg
      width={18 * scale}
      height={18 * scale}
      viewBox="0 0 24 24"
      fill="none"
      stroke="hsl(var(--glow) / 0.5)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ rotate: rotation }}
      animate={{
        scale: [1, 1.1, 1],
        rotate: [rotation, rotation + 20, rotation - 20, rotation],
        y: [0, -5, 0],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </motion.svg>
  );
}

function ScribbleDoodle({ scale, rotation }: { scale: number; rotation: number }) {
  return (
    <motion.svg
      width={24 * scale}
      height={24 * scale}
      viewBox="0 0 48 48"
      fill="none"
      stroke="hsl(var(--glow) / 0.4)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ rotate: rotation }}
      animate={{
        scale: [1, 1.05, 1],
        x: [0, 3, -3, 0],
      }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path d="M12 20 Q16 12 24 16 Q32 20 36 12 M8 28 Q14 24 20 28 Q26 32 32 28 Q38 24 42 28 M10 36 Q16 34 22 38 Q28 42 34 38 Q40 34 44 36" />
    </motion.svg>
  );
}

function EyesDoodle({ scale, rotation }: { scale: number; rotation: number }) {
  return (
    <motion.svg
      width={28 * scale}
      height={20 * scale}
      viewBox="0 0 28 20"
      fill="none"
      style={{ rotate: rotation }}
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {/* Left eye */}
      <motion.ellipse
        cx="8"
        cy="10"
        rx="5"
        ry="6"
        fill="none"
        stroke="hsl(var(--glow) / 0.6)"
        strokeWidth="1.5"
        animate={{
          ry: [6, 1, 6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
      <motion.circle
        cx="8"
        cy="10"
        r="2"
        fill="hsl(var(--glow) / 0.8)"
        animate={{
          cy: [10, 9, 10],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      {/* Right eye */}
      <motion.ellipse
        cx="20"
        cy="10"
        rx="5"
        ry="6"
        fill="none"
        stroke="hsl(var(--glow) / 0.6)"
        strokeWidth="1.5"
        animate={{
          ry: [6, 1, 6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      />
      <motion.circle
        cx="20"
        cy="10"
        r="2"
        fill="hsl(var(--glow) / 0.8)"
        animate={{
          cy: [10, 9, 10],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.svg>
  );
}

function SparkleDoodle({ scale, rotation }: { scale: number; rotation: number }) {
  return (
    <motion.svg
      width={14 * scale}
      height={14 * scale}
      viewBox="0 0 24 24"
      fill="none"
      stroke="hsl(var(--glow) / 0.6)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ rotate: rotation }}
      animate={{
        scale: [0.8, 1.2, 0.8],
        opacity: [0.4, 0.8, 0.4],
        rotate: [rotation, rotation + 90, rotation],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <path d="M12 0v8m0 8v8m8-8h-8m-8 0h8" />
    </motion.svg>
  );
}

const DOODLE_TYPES: DoodleProps["type"][] = ["heart", "star", "moon", "scribble", "eyes", "sparkle"];

function Doodle({ type, delay, duration, startX, startY, scale, rotation }: DoodleProps) {
  const renderDoodle = () => {
    switch (type) {
      case "heart":
        return <HeartDoodle scale={scale} rotation={rotation} />;
      case "star":
        return <StarDoodle scale={scale} rotation={rotation} />;
      case "moon":
        return <MoonDoodle scale={scale} rotation={rotation} />;
      case "scribble":
        return <ScribbleDoodle scale={scale} rotation={rotation} />;
      case "eyes":
        return <EyesDoodle scale={scale} rotation={rotation} />;
      case "sparkle":
        return <SparkleDoodle scale={scale} rotation={rotation} />;
    }
  };

  return (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ left: startX, top: startY }}
    >
      <motion.div
        initial={{
          x: 0,
          y: 0,
          opacity: 0,
          scale: 0.5,
        }}
        animate={{
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          opacity: [0, 0.7, 0.7, 0],
          scale: [0.5, 1, 1, 0.5],
        }}
        transition={{
          duration,
          delay,
          repeat: Infinity,
          repeatDelay: Math.random() * 2,
          ease: "easeInOut",
        }}
      >
        {renderDoodle()}
      </motion.div>
    </motion.div>
  );
}

export default function FloatingDoodles() {
  const [doodles, setDoodles] = useState<DoodleProps[]>([]);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setIsDesktop(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      setScrollHeight(Math.max(document.documentElement.scrollHeight, window.innerHeight));
    };
    
    // Slight delay to ensure DOM is fully rendered for accurate scrollHeight
    setTimeout(updateSize, 100);
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!scrollHeight) return;

    const generateDoodles = () => {
      // Reduced number of doodles to keep the site light and subtle
      const newDoodles: DoodleProps[] = Array.from({ length: 15 }, () => ({
        type: DOODLE_TYPES[Math.floor(Math.random() * DOODLE_TYPES.length)],
        delay: Math.random() * 2,
        duration: 4 + Math.random() * 4,
        startX: Math.random() * window.innerWidth,
        startY: Math.random() * scrollHeight,
        scale: 0.5 + Math.random() * 1.0,
        rotation: Math.random() * 360,
      }));
      setDoodles(newDoodles);
    };

    generateDoodles();
  }, [scrollHeight]);

  if (!isDesktop) return null;

  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none z-40 overflow-hidden" style={{ height: scrollHeight }}>
      {doodles.map((doodle, i) => (
        <Doodle key={i} {...doodle} />
      ))}
    </div>
  );
}
