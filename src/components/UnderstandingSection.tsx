import { motion } from "framer-motion";

const signals = [
  {
    label: "conversational rhythm",
    detail:
      "the system gradually understands how you communicate: pacing, depth, curiosity, and when conversation opens naturally.",
  },
  {
    label: "emotional movement",
    detail:
      "not just what you say, but what the exchange does to your energy, your openness, and your sense of ease.",
  },
  {
    label: "chemistry tendencies",
    detail:
      "patterns in what draws you in, what feels natural, what smooths the pacing, and what creates closeness.",
  },
  {
    label: "relational atmosphere",
    detail:
      "the texture of how you connect: warmth, directness, playfulness, restraint, and emotional safety.",
  },
];

export default function UnderstandingSection() {
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
            understanding before connection
          </p>
          <h2 className="text-3xl md:text-5xl font-light leading-tight mb-6">
            most platforms start with profiles.
            <br />
            <span className="text-foreground-secondary">
              candor starts with conversation.
            </span>
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {signals.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="border-t border-border/40 pt-5"
            >
              <h3 className="text-base font-light text-foreground mb-2">
                {item.label}
              </h3>
              <p className="text-sm font-light leading-7 text-foreground-secondary">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
