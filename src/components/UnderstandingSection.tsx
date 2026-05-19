import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const progression = [
  "spark",
  "rhythm",
  "patterns",
  "nuance",
  "continuity",
  "resonance"
];

export default function UnderstandingSection() {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStage((prev) => (prev < progression.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-light leading-tight">
            understanding changes the conversation.
          </h2>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-5 w-full">
          {progression.map((stage, i) => {
            const isActive = i <= activeStage;
            const isCurrent = i === activeStage;
            return (
              <div key={stage} className="flex items-center gap-3 md:gap-5">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`px-4 py-2 rounded-full border transition-all duration-700 ${
                    isCurrent
                      ? "border-accent/50 bg-accent/10 text-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]"
                      : isActive
                      ? "border-border/60 bg-background/50 text-foreground"
                      : "border-border/20 text-foreground-secondary/30"
                  }`}
                >
                  <span className="text-sm md:text-base font-light tracking-wide">
                    {stage}
                  </span>
                </motion.div>
                {i < progression.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isActive ? 1 : 0.2 }}
                    transition={{ duration: 0.5 }}
                    className="text-border/50 text-lg font-light"
                  >
                    →
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 text-sm font-light text-foreground-secondary/70 max-w-lg text-center"
        >
          conversation without urgency. naturally unfolding.
        </motion.p>
      </div>
    </section>
  );
}
