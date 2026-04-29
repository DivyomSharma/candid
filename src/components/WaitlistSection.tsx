import { useState } from "react";
import { motion } from "framer-motion";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");

  const enterCandor = () => {
    window.location.href = "/candor/home";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    enterCandor();
  };

  return (
    <section id="waitlist" className="py-24 md:py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-md mx-auto text-center"
      >
        <h2 className="text-2xl md:text-3xl font-light mb-3">
          Be part of something more honest
        </h2>
        <p className="text-foreground-secondary text-sm font-light mb-10">
          No rush. We'll reach out when it's time.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="flex-1 px-5 py-3.5 rounded-full surface border border-border/50 text-sm font-light
                       placeholder:text-foreground-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent/40
                       transition-all duration-300"
          />
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={enterCandor}
              className="px-7 py-3.5 rounded-full bg-accent text-primary-foreground text-sm font-medium
                         hover:scale-105 transition-transform duration-300 soft-shadow whitespace-nowrap disabled:opacity-70 disabled:hover:scale-100"
            >
              Enter Candor
            </button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}
