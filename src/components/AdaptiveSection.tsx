import { motion } from "framer-motion";

const personas = [
  { type: "founder-brained", feel: "sharp, efficient, pattern-aware" },
  { type: "reserved", feel: "patient, unhurried, emotionally careful" },
  { type: "analytical", feel: "precise, framework-oriented, curious" },
  { type: "extroverted", feel: "playful, warm, socially fluid" },
  { type: "internet-native", feel: "dry, referential, timing-aware" },
  { type: "emotionally open", feel: "soft, direct, deeply present" },
];

export default function AdaptiveSection() {
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
            different people feel different here
          </p>
          <h2 className="text-2xl md:text-4xl font-light leading-tight">
            candor adapts to who you are.
            <br />
            <span className="text-foreground-secondary">
              not the other way around.
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((persona, i) => (
            <motion.div
              key={persona.type}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.06 }}
              className="surface rounded-2xl px-5 py-4 soft-shadow group"
            >
              <p className="text-sm font-light text-foreground mb-1.5">
                {persona.type}
              </p>
              <p className="text-xs font-light text-foreground-secondary/60 leading-relaxed">
                candor feels{" "}
                <span className="text-foreground-secondary/80">
                  {persona.feel}
                </span>
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-center mt-10 text-sm font-light text-foreground-secondary/50"
        >
          socially adaptive, not mechanically scripted.
        </motion.p>
      </div>
    </section>
  );
}
