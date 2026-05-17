import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function FadeParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0.6, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -24, scale: 0.2 }}
      transition={{ duration: 2.5, delay, repeat: Infinity, repeatDelay: 4 }}
      className="absolute w-1 h-1 rounded-full bg-accent/30"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );
}

const memoryTraits = [
  { label: "patterns", description: "how you tend to communicate" },
  { label: "emotional rhythm", description: "what conversation does to your energy" },
  { label: "chemistry signals", description: "what creates closeness" },
  { label: "relational continuity", description: "the thread between conversations" },
];

const trustSignals = [
  "deletable memory",
  "controllable continuity",
  "temporary raw history",
  "user-controlled memory",
];

export default function MemoryPhilosophySection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-light uppercase tracking-widest text-foreground-secondary mb-5">
            privacy by design
          </p>
          <h2 className="text-2xl md:text-4xl font-light leading-tight">
            candor remembers understanding,
            <br />
            <span className="text-foreground-secondary">not everything.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative surface rounded-2xl p-8 soft-shadow overflow-hidden mb-8"
        >
          {mounted
            ? Array.from({ length: 10 }).map((_, i) => <FadeParticle key={i} delay={i * 0.35} />)
            : null}

          <div className="relative z-10 space-y-4">
            <p className="text-xs font-light uppercase tracking-widest text-foreground-secondary/60 mb-4">
              what candor gradually retains
            </p>
            {memoryTraits.map((trait, i) => (
              <motion.div
                key={trait.label}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="flex items-baseline gap-3"
              >
                <span className="text-sm font-light text-foreground">
                  {trait.label}
                </span>
                <span className="text-xs font-light text-foreground-secondary/60">
                  - {trait.description}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {trustSignals.map((signal, i) => (
            <motion.span
              key={signal}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              className="px-4 py-2 rounded-full border border-border/40 text-xs font-light text-foreground-secondary/70"
            >
              {signal}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
