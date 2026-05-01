import { motion } from "framer-motion";
import { useTheme, accents } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { mode, setMode, accent, setAccent } = useTheme();

  return (
    <div className="surface soft-shadow flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-2 backdrop-blur-sm sm:gap-1.5 sm:px-3 sm:py-1.5">
      <button
        type="button"
        onClick={() => setMode(mode === "light" ? "dark" : "light")}
        aria-label={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-secondary transition-colors hover:text-foreground sm:h-7 sm:w-7"
        title="Toggle dark mode"
      >
        {mode === "light" ? <Moon size={14} /> : <Sun size={14} />}
      </button>

      <div className="h-5 w-px bg-border/50 sm:h-4"></div>

      {accents.map((t) => (
        <button
          key={t.name}
          type="button"
          onClick={() => setAccent(t.name)}
          aria-label={`Switch accent to ${t.label}`}
          className="relative flex h-7 w-7 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 sm:h-6 sm:w-6"
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
