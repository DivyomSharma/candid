import { motion } from "framer-motion";

const alignAtmospheres = [
  "distant - the first signal. still exploratory, still light.",
  "familiar - something about the pacing already makes sense.",
  "natural flow - conversation starts to feel easier than expected.",
  "magnetic - the social chemistry begins to pull with more confidence.",
  "candid - openness arrives more naturally between you two.",
];

export default function MatchReveal() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-lg mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-foreground-secondary text-sm tracking-widest uppercase mb-12"
        >
          aligns become clearer over time
        </motion.p>

        <div className="grid gap-3">
          {alignAtmospheres.map((line, i) => (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="surface rounded-2xl px-6 py-4 soft-shadow"
            >
              <p className="text-sm font-light text-foreground/90">{line}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
