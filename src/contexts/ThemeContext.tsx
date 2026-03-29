import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = "soft-dark" | "baby-pink" | "baby-blue" | "lavender" | "baby-yellow";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "soft-dark",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const themes: { name: ThemeName; label: string; color: string }[] = [
  { name: "soft-dark", label: "Night", color: "#1A1816" },
  { name: "baby-pink", label: "Rose", color: "#F8EDEE" },
  { name: "baby-blue", label: "Sky", color: "#EEF4F8" },
  { name: "lavender", label: "Lavender", color: "#F3EFF7" },
  { name: "baby-yellow", label: "Honey", color: "#F9F6E9" },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("candor-theme");
    return (saved as ThemeName) || "soft-dark";
  });

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
    localStorage.setItem("candor-theme", t);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
