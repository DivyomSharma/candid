"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, UserRound, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, accents } from "@/contexts/ThemeContext";

const navItems = [
  { href: "/candor/home", label: "home", icon: Home },
  { href: "/candor/aligns", label: "aligns", icon: Sparkles },
  { href: "/candor/you", label: "you", icon: UserRound },
];

function ThemeIsland() {
  const { mode, setMode, accent, setAccent } = useTheme();

  return (
    <div className="group relative flex items-center h-10 overflow-hidden rounded-full border border-border/50 bg-background/50 backdrop-blur-md transition-all duration-500 ease-out w-10 hover:w-[180px] soft-shadow cursor-pointer">
      <button 
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        className="flex h-full w-10 shrink-0 items-center justify-center text-foreground-secondary hover:text-foreground transition-colors"
      >
        {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      
      <div className="h-4 w-px bg-border/50 shrink-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

      <div className="flex items-center gap-2 pl-3 pr-2 opacity-0 transition-opacity duration-300 delay-100 group-hover:opacity-100">
        {accents.map((a) => (
          <button
            key={a.name}
            onClick={(e) => {
              e.stopPropagation();
              setAccent(a.name);
            }}
            className={cn(
              "h-[18px] w-[18px] rounded-full transition-transform hover:scale-110",
              accent === a.name && "ring-1 ring-foreground/50 ring-offset-1 ring-offset-background"
            )}
            style={{ backgroundColor: mode === "dark" ? a.darkColor : a.lightColor }}
          />
        ))}
      </div>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-5 z-40 flex justify-center gap-3 px-6 pointer-events-none">
      <div className="pointer-events-auto surface soft-shadow flex items-center gap-1 rounded-full border border-border/50 px-2 py-2 backdrop-blur-md">
        <Link
          href="/candor"
          className="flex h-10 items-center rounded-full px-4 text-sm font-light tracking-tight text-foreground transition-colors hover:text-foreground-secondary"
          aria-label="Candor landing page"
        >
          Candor
        </Link>
        <div className="mx-1 h-5 w-px bg-border/50" aria-hidden="true" />
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-24 items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-light tracking-wide transition-colors",
                isActive ? "bg-accent text-accent-foreground" : "text-foreground-secondary hover:text-foreground",
              )}
            >
              <Icon data-icon="inline-start" />
              {item.label}
            </Link>
          );
        })}
      </div>
      
      <div className="pointer-events-auto flex items-center">
         <ThemeIsland />
      </div>
    </nav>
  );
}
