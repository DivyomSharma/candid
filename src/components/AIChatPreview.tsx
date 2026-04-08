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
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17c0-7 6-10 12-10" />
                <path d="M12 7l4 0l0 4" />
              </svg>
              <span className="text-[11px] font-medium tracking-wide uppercase text-accent">You</span>
            </div>
            <div className="max-w-[75%] px-5 py-3 rounded-2xl surface-secondary text-sm font-light">
              I think I struggle with being vulnerable early on.
            </div>
          </div>

          {/* User B */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 mb-1 px-1 flex-row-reverse">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }}>
                <path d="M4 17c0-7 6-10 12-10" />
                <path d="M12 7l4 0l0 4" />
              </svg>
              <span className="text-[11px] font-medium tracking-wide uppercase text-accent">Yours</span>
            </div>
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
            className="flex flex-col items-center"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c0 7-6 10-6 10h12s-6-3-6-10" />
                <circle cx="12" cy="17" r="1" />
              </svg>
              <span className="text-[10px] font-medium tracking-wide uppercase text-accent/60">Candor AI</span>
            </div>
            <div className="px-5 py-2.5 rounded-full border border-border/50 text-xs text-foreground-secondary/60 font-light italic">
              You both seem to value honesty. Would you like a thoughtful question?
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
