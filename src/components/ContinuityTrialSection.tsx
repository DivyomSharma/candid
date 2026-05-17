import { motion } from "framer-motion";

const depthStates = ["spark", "rhythm", "patterns", "nuance", "continuity", "resonance"];

export default function ContinuityTrialSection() {
  return (
    <section className="py-28 md:py-36 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
          className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div>
            <p className="text-sm font-light uppercase tracking-widest text-foreground-secondary mb-5">
              experience continuity
            </p>
            <h2 className="text-3xl md:text-5xl font-light leading-tight mb-6">
              candor becomes more perceptive over time.
            </h2>
            <p className="text-foreground-secondary text-sm md:text-base font-light leading-7 max-w-xl">
              new users begin with a full seven-day continuity experience. it is complete, uninterrupted, and meant to let candor carry enough rhythm, chemistry, and emotional context for the difference to feel real before anything else gets explained.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative surface rounded-3xl p-8 md:p-10 soft-shadow overflow-hidden"
          >
            <div
              className="absolute inset-0 -z-0 opacity-30"
              style={{
                background: `radial-gradient(ellipse 70% 50% at 50% 40%, hsl(var(--glow) / 0.15), transparent)`,
              }}
            />

            <div className="relative z-10">
              <p className="text-xs font-light uppercase tracking-widest text-accent/70 mb-4">
                seven days of full continuity
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {depthStates.map((state) => (
                  <span
                    key={state}
                    className="rounded-full border border-border/45 bg-background/25 px-3 py-1.5 text-xs font-light text-foreground-secondary"
                  >
                    {state}
                  </span>
                ))}
              </div>

              <p className="text-sm font-light text-foreground-secondary leading-7">
                after that, candor softens back into echo instead of hard-locking the experience. the point is not punishment. the point is that longer continuity makes chemistry, pacing, and relational understanding feel more natural.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
