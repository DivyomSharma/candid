import { motion } from "framer-motion";
import { useTheme, accents } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { mode, setMode, accent, setAccent } = useTheme();

  return (
    <div className="surface soft-shadow flex items-center gap-1 rounded-full border border-border/50 px-2 py-1.5 backdrop-blur-sm sm:gap-1.5 sm:px-3">
      <button
        type="button"
        onClick={() => setMode(mode === "light" ? "dark" : "light")}
        className="mr-0.5 flex h-5 w-5 items-center justify-center text-foreground-secondary transition-colors hover:text-foreground sm:mr-1"
        title="Toggle dark mode"
      >
        {mode === "light" ? <Moon size={14} /> : <Sun size={14} />}
      </button>

      <div className="mx-0.5 h-4 w-px bg-border/50 sm:mx-1"></div>

      {accents.map((t) => (
        <button
          key={t.name}
          type="button"
          onClick={() => setAccent(t.name)}
          className="relative h-4 w-4 rounded-full transition-transform duration-300 hover:scale-110 sm:h-5 sm:w-5"
          style={{ backgroundColor: mode === "light" ? t.lightColor : t.darkColor }}
          title={t.label}
        >
          {accent === t.name && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 rounded-full border-2 border-accent"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
