import { motion } from "framer-motion";

export default function CandorPhilosophySection() {
  return (
    <section className="px-6 py-32 md:py-48 flex items-center justify-center">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9 }}
        >
          <h2 className="text-4xl font-light leading-tight md:text-6xl tracking-wide mb-8">
            open, not seeking.
          </h2>
          <p className="text-sm md:text-base font-light leading-7 text-foreground-secondary/70 mx-auto max-w-lg">
            connection without performance. mutual openness matters more than pursuit. no forced trajectory.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
