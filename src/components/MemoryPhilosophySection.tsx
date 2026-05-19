import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function MemoryPhilosophySection() {
  return (
    <section className="py-32 md:py-48 px-6">
      <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-light leading-tight mb-6">
            not everything is remembered.
          </h2>
          <p className="text-sm font-light text-foreground-secondary tracking-wide">
            privacy by design. only what matters.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12"
        >
          <Link
            href="/candor/memory-controls"
            className="group flex items-center gap-2 text-xs font-light text-foreground-secondary/70 hover:text-foreground transition-colors"
          >
            inspect continuity
            <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
