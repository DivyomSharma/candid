import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
  const { mode, setMode } = useTheme();

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
    </div>
  );
}
