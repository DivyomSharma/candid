import { motion } from "framer-motion";
import { useTheme, themes } from "@/contexts/ThemeContext";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.5, duration: 0.6 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full surface soft-shadow backdrop-blur-sm border border-border/50">
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className="relative w-7 h-7 rounded-full transition-transform duration-300 hover:scale-110"
            style={{ backgroundColor: t.color }}
            title={t.label}
          >
            {theme === t.name && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 rounded-full border-2 border-accent"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
