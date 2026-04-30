import Link from "next/link";
import { motion } from "framer-motion";
import ThemeSwitcher from "./ThemeSwitcher";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed left-0 right-0 top-0 z-40 flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5 md:px-10"
    >
      <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
        <span className="text-lg font-light tracking-wide">candor</span>
        <Link
          href="/candor/home"
          className="whitespace-nowrap text-xs tracking-wide text-foreground-secondary transition-colors duration-300 hover:text-foreground"
        >
          enter candor
        </Link>
      </div>
      <div className="flex justify-center sm:justify-end">
        <ThemeSwitcher />
      </div>
    </motion.nav>
  );
}
