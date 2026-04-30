"use client";

import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      {isOpen && (
        <div className="surface soft-shadow absolute bottom-12 flex flex-col items-center gap-2 rounded-full border border-border/50 px-2 py-3 backdrop-blur-md">
          {accents.map((a) => (
            <button
              key={a.name}
              type="button"
              aria-label={`${a.label} theme`}
              onClick={() => {
                setAccent(a.name);
                setIsOpen(false);
              }}
              className={cn(
                "h-[18px] w-[18px] rounded-full transition-transform active:scale-95",
                accent === a.name && "ring-1 ring-foreground/50 ring-offset-1 ring-offset-background",
              )}
              style={{ backgroundColor: mode === "dark" ? a.darkColor : a.lightColor }}
            />
          ))}
          <div className="h-px w-5 bg-border/50" />
          <button
            type="button"
            onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            className="flex h-7 w-7 items-center justify-center rounded-full text-foreground-secondary transition-colors active:scale-95"
            aria-label="Toggle light and dark mode"
          >
            {mode === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="soft-shadow flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/55 text-foreground-secondary backdrop-blur-md transition-colors active:scale-95"
        aria-expanded={isOpen}
        aria-label="Theme options"
      >
        {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center gap-2 px-3 pointer-events-none sm:bottom-5 sm:gap-3 sm:px-6">
      <div className="pointer-events-auto surface soft-shadow flex max-w-[calc(100vw-4.5rem)] items-center gap-0.5 rounded-full border border-border/50 px-1.5 py-1.5 backdrop-blur-md sm:max-w-none sm:gap-1 sm:px-2 sm:py-2">
        <Link
          href="/candor"
          className="flex h-9 items-center rounded-full px-3 text-sm font-light tracking-tight text-foreground transition-colors active:scale-95 sm:h-10 sm:px-4"
          aria-label="Candor landing page"
        >
          Candor
        </Link>
        <div className="mx-0.5 h-5 w-px bg-border/50 sm:mx-1" aria-hidden="true" />
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-light tracking-wide transition-colors active:scale-95 sm:h-auto sm:min-w-24 sm:gap-2 sm:px-4 sm:py-2",
                isActive ? "bg-accent text-accent-foreground" : "text-foreground-secondary sm:hover:text-foreground",
              )}
            >
              <Icon data-icon="inline-start" />
              <span className="max-[380px]:sr-only">{item.label}</span>
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
