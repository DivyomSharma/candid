import { motion } from "framer-motion";

export default function AIChatPreview() {
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
          Conversations with care
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="surface rounded-3xl p-6 md:p-8 soft-shadow space-y-3"
        >
          {/* User A */}
          <div className="flex justify-start">
            <div className="max-w-[75%] px-5 py-3 rounded-2xl surface-secondary text-sm font-light">
              I think I struggle with being vulnerable early on.
            </div>
          </div>

          {/* User B */}
          <div className="flex justify-end">
            <div className="max-w-[75%] px-5 py-3 rounded-2xl bg-accent/20 text-sm font-light">
              Me too. I usually wait until I feel safe.
            </div>
          </div>

          {/* AI */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="px-5 py-2.5 rounded-full border border-border/50 text-xs text-foreground-secondary/60 font-light italic">
              You both seem to value honesty. Would you like a thoughtful question?
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
