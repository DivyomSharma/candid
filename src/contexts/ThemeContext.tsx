import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type ThemeAccent = "rose" | "sky" | "lavender" | "honey" | "sand";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  accent: ThemeAccent;
  setAccent: (a: ThemeAccent) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "dark",
  setMode: () => {},
  accent: "sand",
  setAccent: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const accents: { name: ThemeAccent; label: string; lightColor: string; darkColor: string }[] = [
  { name: "sand", label: "Sand", lightColor: "hsl(28, 15%, 82%)", darkColor: "hsl(28, 9%, 61%)" },
  { name: "rose", label: "Rose", lightColor: "hsl(348, 40%, 82%)", darkColor: "hsl(350, 40%, 65%)" },
  { name: "sky", label: "Sky", lightColor: "hsl(207, 50%, 82%)", darkColor: "hsl(207, 50%, 60%)" },
  { name: "lavender", label: "Lavender", lightColor: "hsl(268, 40%, 82%)", darkColor: "hsl(268, 40%, 65%)" },
  { name: "honey", label: "Honey", lightColor: "hsl(48, 50%, 80%)", darkColor: "hsl(40, 45%, 65%)" },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [accent, setAccentState] = useState<ThemeAccent>("sand");

  useEffect(() => {
    const savedMode = localStorage.getItem("candid-mode") as ThemeMode | null;
    const savedAccent = localStorage.getItem("candid-accent") as ThemeAccent | null;

    if (savedMode) {
      setModeState(savedMode);
    }

    if (savedAccent) {
      setAccentState(savedAccent);
    }
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    if (typeof window !== "undefined") localStorage.setItem("candid-mode", m);
  };

  const setAccent = (a: ThemeAccent) => {
    setAccentState(a);
    if (typeof window !== "undefined") localStorage.setItem("candid-accent", a);
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
