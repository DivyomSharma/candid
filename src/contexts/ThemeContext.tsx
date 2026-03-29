import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type ThemeAccent = "rose" | "sky" | "lavender" | "honey";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  accent: ThemeAccent;
  setAccent: (a: ThemeAccent) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  setMode: () => {},
  accent: "rose",
  setAccent: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const accents: { name: ThemeAccent; label: string; color: string }[] = [
  { name: "rose", label: "Rose", color: "#F8EDEE" },
  { name: "sky", label: "Sky", color: "#EEF4F8" },
  { name: "lavender", label: "Lavender", color: "#F3EFF7" },
  { name: "honey", label: "Honey", color: "#F9F6E9" },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("candor-mode");
    return (saved as ThemeMode) || "dark";
  });

  const [accent, setAccentState] = useState<ThemeAccent>(() => {
    const saved = localStorage.getItem("candor-accent");
    return (saved as ThemeAccent) || "rose";
  });

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem("candor-mode", m);
  };

  const setAccent = (a: ThemeAccent) => {
    setAccentState(a);
    localStorage.setItem("candor-accent", a);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    document.documentElement.setAttribute("data-accent", accent);
  }, [mode, accent]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}
