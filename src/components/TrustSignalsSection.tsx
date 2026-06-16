import { motion } from "framer-motion";

const signals = [
  {
    label: "memory controls",
    detail: "inspect, edit, or delete what candid keeps about you",
  },
  {
    label: "deletable continuity",
    detail: "your relational history is yours to keep, soften, or remove",
  },
  {
    label: "privacy-first architecture",
    detail: "raw conversation transcripts stay temporary by design",
  },
  {
    label: "no manipulative loops",
    detail: "retention should come from relevance, not addiction mechanics",
  },
];

export default function TrustSignalsSection() {
  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className="text-sm font-light uppercase tracking-widest text-foreground-secondary mb-5">
            emotionally safe by design
          </p>
          <h2 className="text-2xl md:text-4xl font-light leading-tight">
            built for trust,
            <span className="text-foreground-secondary"> not dependency.</span>
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {signals.map((signal, i) => (
            <motion.div
              key={signal.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="surface rounded-2xl px-5 py-5 soft-shadow"
            >
              <p className="text-sm font-light text-foreground mb-1.5">
                {signal.label}
              </p>
              <p className="text-xs font-light leading-relaxed text-foreground-secondary/60">
                {signal.detail}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-12 text-center"
        >
          <p className="text-sm font-light text-foreground-secondary/50 leading-relaxed max-w-sm mx-auto">
            candid is not designed to replace human connection. the goal is helping people understand themselves, communicate more clearly, and discover stronger human compatibility.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
