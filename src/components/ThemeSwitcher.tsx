import { motion } from "framer-motion";
import { useTheme, accents } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { mode, setMode, accent, setAccent } = useTheme();

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full surface soft-shadow backdrop-blur-sm border border-border/50">
      <button
        onClick={() => setMode(mode === "light" ? "dark" : "light")}
        className="w-5 h-5 flex items-center justify-center text-foreground-secondary hover:text-foreground transition-colors mr-1"
        title="Toggle dark mode"
      >
        {mode === "light" ? <Moon size={14} /> : <Sun size={14} />}
      </button>

      <div className="w-[1px] h-4 bg-border/50 mx-1"></div>

      {accents.map((t) => (
        <button
          key={t.name}
          onClick={() => setAccent(t.name)}
          className="relative w-5 h-5 rounded-full transition-transform duration-300 hover:scale-110"
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
