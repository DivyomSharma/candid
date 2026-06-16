import { motion } from "framer-motion";

const optimizedFor = [
  "emotional nuance",
  "conversational texture",
  "social intelligence",
  "compatibility understanding",
  "relational atmosphere",
];

const notOptimizedFor = [
  "productivity workflows",
  "dopamine-driven swiping",
  "task completion",
];

export default function ChemistrySection() {
  return (
    <section className="py-28 md:py-36 px-6">
      <div className="max-w-xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
        >
          <p className="text-sm font-light uppercase tracking-widest text-foreground-secondary mb-5">
            designed for chemistry, not performance
          </p>
          <h2 className="text-3xl md:text-5xl font-light leading-tight mb-10">
            optimized for how people{" "}
            <span className="font-cursive text-accent text-4xl md:text-6xl">
              actually
            </span>{" "}
            connect.
          </h2>
        </motion.div>

        {/* What Candid IS for */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {optimizedFor.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.4 }}
              className="px-4 py-2.5 rounded-full surface border border-border/40 text-sm font-light text-foreground/80"
            >
              {item}
            </motion.span>
          ))}
        </motion.div>

        {/* What Candid is NOT */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3"
        >
          {notOptimizedFor.map((item, i) => (
            <motion.span
              key={item}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
              className="px-4 py-2 rounded-full border border-border/20 text-xs font-light text-foreground-secondary/40 line-through decoration-foreground-secondary/20"
            >
              {item}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
