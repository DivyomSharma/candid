import { motion } from "framer-motion";

const confettiColors = [
  "hsl(var(--glow) / 0.8)",
  "hsl(var(--glow) / 0.6)",
  "hsl(var(--glow) / 0.7)",
  "hsl(var(--glow) / 0.5)",
  "hsl(var(--glow) / 0.9)",
];

function ConfettiParticle({ angle, distance, delay, color, size }: {
  angle: number;
  distance: number;
  delay: number;
  color: string;
  size: number;
}) {
  const endX = Math.cos((angle * Math.PI) / 180) * distance;
  const endY = Math.sin((angle * Math.PI) / 180) * distance;

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      whileInView={{
        opacity: [1, 1, 0],
        x: endX,
        y: endY,
        scale: [1, 1, 0.5],
        rotate: angle * 3,
      }}
      viewport={{ once: true }}
      transition={{
        duration: 1.2,
        delay,
        ease: "easeOut",
      }}
      className="absolute"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: "50%",
        top: "50%",
      }}
    />
  );
}

export default function UnlockSection() {
  const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    angle: (360 / 60) * i + Math.random() * 10,
    distance: 150 + Math.random() * 200,
    delay: Math.random() * 0.3,
    size: 4 + Math.random() * 4,
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
  }));

  return (
    <section className="py-24 md:py-32 px-6 relative">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-md mx-auto text-center relative"
      >
        {/* Soft glow circle with confetti bursting from its center */}
        <div className="relative w-32 h-32 mx-auto mb-10">
          {/* Confetti - bursts from the 3D element center */}
          <div className="absolute inset-0 pointer-events-none">
            {confettiPieces.map((piece) => (
              <ConfettiParticle
                key={piece.id}
                angle={piece.angle}
                distance={piece.distance}
                delay={piece.delay}
                size={piece.size}
                color={piece.color}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="w-32 h-32 rounded-full soft-glow flex items-center justify-center"
            style={{ background: `radial-gradient(circle, hsl(var(--glow) / 0.15), transparent 70%)` }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full"
              style={{ background: `radial-gradient(circle, hsl(var(--glow) / 0.3), hsl(var(--glow) / 0.05))` }}
            />
          </motion.div>
        </div>

        <h2 className="text-2xl md:text-3xl font-light mb-4">
          You've unlocked someone <br />who understands you.
        </h2>

        <p className="font-cursive text-xl text-accent/80">
          this might feel different
        </p>
      </motion.div>
    </section>
  );
}
