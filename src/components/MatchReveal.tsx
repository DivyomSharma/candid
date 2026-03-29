import { motion } from "framer-motion";

const insights = [
  "You both value emotional honesty",
  "You approach conflict with care",
  "You both need space to recharge",
  "You share a love for deep conversations",
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
          What you share
        </motion.p>

        <div className="grid gap-3">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="surface rounded-2xl px-6 py-4 soft-shadow"
            >
              <p className="text-sm font-light text-foreground/90">{insight}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
