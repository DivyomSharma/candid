import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Breathing gradient background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 animate-breathe"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 40%, hsl(var(--glow) / 0.12), transparent)`,
          }}
        />
        <div
          className="absolute inset-0 animate-breathe"
          style={{
            animationDelay: "3s",
            background: `radial-gradient(ellipse 60% 50% at 60% 60%, hsl(var(--glow) / 0.06), transparent)`,
          }}
        />
      </div>

      <div className="grain absolute inset-0 -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-2xl mx-auto"
      >
        <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-tight mb-6">
          No swipes.{" "}
          <br className="hidden md:block" />
          Just honest conversations.
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-foreground-secondary text-lg md:text-xl font-light max-w-lg mx-auto mb-10"
        >
          A space where you can be understood before you're seen.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="relative inline-block"
        >
          <a
            href="/candor/home"
            className="inline-block px-8 py-3.5 rounded-full bg-accent text-primary-foreground font-medium text-sm tracking-wide
                       hover:scale-105 transition-transform duration-300 soft-shadow"
          >
            Enter Candor
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10"
      >
        <div className="w-5 h-8 rounded-full border-2 border-foreground-secondary/30 flex justify-center pt-1.5">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-1 h-1 rounded-full bg-foreground-secondary/50"
          />
        </div>
      </motion.div>
    </section>
  );
}
