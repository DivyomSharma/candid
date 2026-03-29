import { motion } from "framer-motion";

export default function UnlockSection() {
  return (
    <section className="py-24 md:py-32 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="max-w-md mx-auto text-center"
      >
        {/* Soft glow circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-32 h-32 mx-auto mb-10 rounded-full soft-glow flex items-center justify-center"
          style={{ background: `radial-gradient(circle, hsl(var(--glow) / 0.15), transparent 70%)` }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full"
            style={{ background: `radial-gradient(circle, hsl(var(--glow) / 0.3), hsl(var(--glow) / 0.05))` }}
          />
        </motion.div>

        <h2 className="text-2xl md:text-3xl font-light mb-4">
          You've unlocked someone <br />who understands you.
        </h2>

        <p className="font-cursive text-xl text-accent/80">
          this might feel different
        </p>
      </motion.div>
    </section>
  );
}
