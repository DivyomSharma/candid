"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircleMore, Sparkles, UserRound, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme, accents } from "@/contexts/ThemeContext";

const navItems = [
  { href: "/candor/home", label: "candor", icon: MessageCircleMore },
  { href: "/candor/aligns", label: "aligns", icon: Sparkles },
  { href: "/candor/you", label: "you", icon: UserRound },
];

function MobileThemeIsland() {
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

function DesktopThemeIsland() {
  const { mode, setMode, accent, setAccent } = useTheme();

  return (
    <div className="group relative hidden h-10 w-10 cursor-pointer items-center overflow-hidden rounded-full border border-border/50 bg-background/50 backdrop-blur-md transition-all duration-500 ease-out hover:w-[180px] sm:flex soft-shadow">
      <button
        type="button"
        onClick={() => setMode(mode === "dark" ? "light" : "dark")}
        className="flex h-full w-10 shrink-0 items-center justify-center text-foreground-secondary transition-colors hover:text-foreground"
        aria-label="Toggle light and dark mode"
      >
        {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <div className="h-4 w-px shrink-0 bg-border/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="flex items-center gap-2 pl-3 pr-2 opacity-0 transition-opacity duration-300 delay-100 group-hover:opacity-100">
        {accents.map((a) => (
          <button
            key={a.name}
            type="button"
            aria-label={`${a.label} theme`}
            onClick={(event) => {
              event.stopPropagation();
              setAccent(a.name);
            }}
            className={cn(
              "h-[18px] w-[18px] rounded-full transition-transform hover:scale-110",
              accent === a.name && "ring-1 ring-foreground/50 ring-offset-1 ring-offset-background",
            )}
            style={{ backgroundColor: mode === "dark" ? a.darkColor : a.lightColor }}
          />
        ))}
      </div>
    </div>
  );
}

function ThemeIsland() {
  return (
    <>
      <div className="sm:hidden">
        <MobileThemeIsland />
      </div>
      <DesktopThemeIsland />
    </>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-4 z-40 flex justify-center gap-2 px-3 pointer-events-none sm:bottom-5 sm:gap-3 sm:px-6">
      <div className="pointer-events-auto surface soft-shadow flex max-w-[calc(100vw-4.5rem)] items-center gap-0.5 rounded-full border border-border/50 px-1.5 py-1.5 backdrop-blur-md sm:max-w-none sm:gap-1 sm:px-2 sm:py-2">
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
