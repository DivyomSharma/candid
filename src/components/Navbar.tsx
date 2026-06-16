import { motion } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 md:px-10"
    >
      <span className="text-lg font-light tracking-wide">candid</span>
      <div className="flex justify-end">
        <ThemeSwitcher />
      </div>
    </motion.nav>
  );
}
