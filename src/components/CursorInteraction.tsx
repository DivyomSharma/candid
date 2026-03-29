import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  type: "heart" | "star" | "sparkle";
}

export default function CursorInteraction() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Add particles on mouse move
      if (Math.random() > 0.7) {
        const newParticle: Particle = {
          id: Date.now() + Math.random(),
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
          type: Math.random() > 0.6 ? "heart" : Math.random() > 0.5 ? "star" : "sparkle",
        };

        setParticles((prev) => [...prev.slice(-15), newParticle]);
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Auto-remove particles
  useEffect(() => {
    const interval = setInterval(() => {
      setParticles((prev) => prev.slice(1));
    }, 200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9997] overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute"
          initial={{ opacity: 1, scale: 0, x: particle.x, y: particle.y }}
          animate={{
            opacity: [1, 1, 0],
            scale: [0, 1.2, 0.8],
            y: particle.y - 30,
          }}
          transition={{ duration: 0.8 }}
        >
          {particle.type === "heart" && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="hsl(var(--glow) / 0.6)">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          )}
          {particle.type === "star" && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="hsl(var(--glow) / 0.5)">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
          {particle.type === "sparkle" && (
            <svg width="8" height="8" viewBox="0 0 24 24" fill="hsl(var(--glow) / 0.7)">
              <path d="M12 0v8m0 8v8m8-8h-8m-8 0h8" />
            </svg>
          )}
        </motion.div>
      ))}


    </div>
  );
}
