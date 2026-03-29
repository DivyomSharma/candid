import { motion } from "framer-motion";

export default function EmotionalSection() {
  return (
    <section className="py-28 md:py-40 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-light leading-snug tracking-tight">
          You don't need more matches.
          <br />
          <span className="text-foreground-secondary">
            You need to feel{" "}
            <span className="font-cursive text-accent text-4xl md:text-6xl">understood</span>.
          </span>
        </h2>
      </motion.div>
    </section>
  );
}
