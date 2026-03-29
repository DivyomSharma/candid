import { motion } from "framer-motion";

interface DoodleArrowProps {
  direction?: "right" | "left" | "up" | "down";
  size?: "sm" | "md" | "lg";
  className?: string;
  animated?: boolean;
}

export default function DoodleArrow({
  direction = "right",
  size = "md",
  className = "",
  animated = false,
}: DoodleArrowProps) {
  const sizeMap = {
    sm: { width: 24, height: 24, strokeWidth: 1.5 },
    md: { width: 32, height: 32, strokeWidth: 2 },
    lg: { width: 48, height: 48, strokeWidth: 2.5 },
  };

  const { width, height, strokeWidth } = sizeMap[size];

  const rotation = {
    right: 0,
    down: 90,
    up: -90,
    left: 180,
  }[direction];

  return (
    <motion.svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={{ rotate: rotation }}
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: 1.2,
        ease: "easeInOut",
        opacity: { delay: 0.2 },
      }}
    >
      {/* Curvy doodle arrow path */}
      <motion.path
        d="M8 24 Q12 16 20 18 Q28 20 28 28 Q28 36 36 34 L40 32 M36 34 L38 28 M36 34 L34 38"
        stroke="hsl(var(--glow))"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 1,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
      {/* Subtle floating animation for interactive accent */}
      {animated && (
        <motion.animate
          attributeName="transform"
          attributeType="XML"
          type="translate"
          values="0 0; 0 3; 0 0"
          dur="3s"
          repeatCount="indefinite"
        />
      )}
    </motion.svg>
  );
}
