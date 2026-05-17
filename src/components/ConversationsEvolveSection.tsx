import { motion } from "framer-motion";

const evolutions = [
  { label: "pacing", description: "candor learns when to move faster, when to let silence breathe, and when the thread needs a sideways turn." },
  { label: "chemistry", description: "what creates resonance between you and other people becomes clearer with continuity." },
  { label: "conversational energy", description: "how your energy shifts across topics, moods, and social atmospheres slowly becomes legible." },
  { label: "emotional rhythm", description: "the cadence of how you open up, pull back, joke, soften, and return." },
];

export default function ConversationsEvolveSection() {
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
            conversations evolve
          </p>
          <h2 className="text-2xl md:text-4xl font-light leading-tight">
            more like getting to know someone.
            <br />
            <span className="text-foreground-secondary">
              less like operating software.
            </span>
          </h2>
        </motion.div>

        <div className="space-y-5">
          {evolutions.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06 }}
              className="flex items-start gap-4 group"
            >
              <div className="mt-2 flex-shrink-0">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5,
                  }}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: `hsl(var(--glow) / 0.6)`,
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-light text-foreground mb-1">
                  {item.label}
                </p>
                <p className="text-sm font-light leading-relaxed text-foreground-secondary/70">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
