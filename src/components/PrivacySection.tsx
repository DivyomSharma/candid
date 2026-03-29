import { motion } from "framer-motion";
import { useState, useEffect } from "react";

function DissolveParticle({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0.8, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -30, scale: 0.3 }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: 3 }}
      className="absolute w-1 h-1 rounded-full bg-accent/40"
      style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
    />
  );
}

export default function PrivacySection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-lg mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-2xl md:text-3xl font-light mb-6"
        >
          We don't keep what you share.
          <br />
          <span className="text-foreground-secondary">Only what helps us understand.</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative surface rounded-2xl p-8 mt-10 soft-shadow overflow-hidden"
        >
          {mounted &&
            Array.from({ length: 12 }).map((_, i) => (
              <DissolveParticle key={i} delay={i * 0.3} />
            ))}

          <div className="space-y-3 relative z-10">
            {["Conversations are temporary", "Only insights are retained", "No personal data stored long-term"].map(
              (text, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 0.6 }}
                  className="text-sm text-foreground-secondary font-light"
                >
                  {text}
                </motion.p>
              )
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
