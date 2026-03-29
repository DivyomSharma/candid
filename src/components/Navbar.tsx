import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-5"
    >
      <span className="text-lg font-light tracking-wide">candor</span>
      <a
        href="#waitlist"
        className="text-xs text-foreground-secondary hover:text-foreground transition-colors duration-300 tracking-wide"
      >
        join waitlist
      </a>
    </motion.nav>
  );
}
