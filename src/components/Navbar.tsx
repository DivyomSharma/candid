import { motion } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";
import DoodleArrow from "./DoodleArrow";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-10 py-5"
    >
      <span className="text-lg font-light tracking-wide">candor</span>
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <a
          href="#waitlist"
          className="text-xs text-foreground-secondary hover:text-foreground transition-colors duration-300 tracking-wide flex items-center gap-1"
        >
          join waitlist
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <DoodleArrow direction="down" size="sm" />
          </motion.span>
        </a>
      </div>
    </motion.nav>
  );
}
