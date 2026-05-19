import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const archetypes = [
  "emotionally careful",
  "socially fluid",
  "quietly intense",
  "warmth-first",
  "grounded realist",
  "expressive thinker",
  "deeply independent",
  "playful avoidant",
  "structured mind",
  "emotionally perceptive",
  "soft but guarded",
  "calm observer",
  "intellectually restless",
  "socially adaptive",
  "emotionally direct"
];

export default function AdaptiveSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % archetypes.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-light leading-tight">
            candor adapts to your rhythm.
          </h2>
          <p className="mt-5 text-sm font-light text-foreground-secondary tracking-wide">
            not everyone opens the same way.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative h-20 w-full flex items-center justify-center"
        >
          {archetypes.map((archetype, index) => (
            <motion.div
              key={archetype}
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{
                opacity: index === currentIndex ? 1 : 0,
                y: index === currentIndex ? 0 : index < currentIndex ? -15 : 15,
                filter: index === currentIndex ? "blur(0px)" : "blur(4px)",
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute text-xl md:text-3xl font-light text-accent/80 tracking-wide text-center"
            >
              {archetype}
            </motion.div>
          ))}
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-12 text-xs font-light text-foreground-secondary/40 uppercase tracking-[0.2em]"
        >
          open, not seeking
        </motion.p>
      </div>
    </section>
  );
}
