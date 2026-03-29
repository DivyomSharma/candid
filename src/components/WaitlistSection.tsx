import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import DoodleArrow from "./DoodleArrow";

export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);

    toast.success("You've been added to the waitlist!");
    setSubmitted(true);
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

        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 px-5 py-3.5 rounded-full surface border border-border/50 text-sm font-light
                         placeholder:text-foreground-secondary/50 focus:outline-none focus:ring-1 focus:ring-accent/40
                         transition-all duration-300"
            />
            <div className="relative flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -left-8 md:-left-10"
              >
                <DoodleArrow direction="right" size="sm" />
              </motion.div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-7 py-3.5 rounded-full bg-accent text-primary-foreground text-sm font-medium
                           hover:scale-105 transition-transform duration-300 soft-shadow whitespace-nowrap disabled:opacity-70 disabled:hover:scale-100"
              >
                {isLoading ? "Joining..." : "Join the waitlist"}
              </button>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-foreground-secondary text-sm font-light mb-1">
              You're in. We'll be in touch.
            </p>
            <p className="font-cursive text-accent text-lg">take your time</p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
