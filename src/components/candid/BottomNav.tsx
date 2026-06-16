"use client";

import { useEffect, useState } from "react";
import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import { Home, Compass, Sparkles, UserRound, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useHaptics } from "@/hooks/use-haptics";
import { CANDID_THREAD_ID, candidThreadPresenceStorageKey, candidThreadReadStorageKey, candidThreadStorageKey } from "@/lib/candid/thread";

const navItems = [
  { href: "/candid/home", label: "home", icon: Home },
  { href: "/candid/signals", label: "signals", icon: Compass },
  { href: "/candid/aligns", label: "aligns", icon: Sparkles },
  { href: "/candid/you", label: "you", icon: UserRound },
];

function ThemeIsland() {
  const { mode, setMode } = useTheme();
  const { triggerLight } = useHaptics();

  return (
    <button
      type="button"
      onClick={() => { triggerLight(); setMode(mode === "dark" ? "light" : "dark"); }}
      className="shadow-2xl flex h-10 w-10 items-center justify-center rounded-full glass-card text-foreground-secondary backdrop-blur-md transition-colors active:scale-95 hover:text-foreground"
      aria-label="Toggle light and dark mode"
    >
      {mode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { isSignedIn, user } = useAuth();
  const { triggerLight } = useHaptics();
  const [threadHasPresence, setThreadHasPresence] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !user?.id || typeof window === "undefined") {
      setThreadHasPresence(false);
      return;
    }

    const updatePresence = () => {
      const savedPresence = window.localStorage.getItem(candidThreadPresenceStorageKey(user.id));
      const savedMessages = window.localStorage.getItem(candidThreadStorageKey(user.id));
      const readAt = Number(window.localStorage.getItem(candidThreadReadStorageKey(user.id)) ?? 0);

      if (savedPresence) {
        setThreadHasPresence(true);
        return;
      }

      if (!savedMessages) {
        setThreadHasPresence(false);
        return;
      }

      try {
        const messages = JSON.parse(savedMessages) as Array<{ role?: string; created_at?: string }>;
        const lastAiIndex = messages.findLastIndex((message) => message.role === "ai");
        const lastAi = messages[lastAiIndex];
        const lastAiTime = lastAi?.created_at ? new Date(lastAi.created_at).getTime() : lastAiIndex + 1;
        setThreadHasPresence(Boolean(lastAi) && lastAiTime > readAt);
      } catch {
        setThreadHasPresence(false);
      }
    };

    updatePresence();
    window.addEventListener("storage", updatePresence);
    window.addEventListener("focus", updatePresence);
    window.addEventListener("candid-thread-presence", updatePresence);

    return () => {
      window.removeEventListener("storage", updatePresence);
      window.removeEventListener("focus", updatePresence);
      window.removeEventListener("candid-thread-presence", updatePresence);
    };
  }, [isSignedIn, user?.id]);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-[90] h-28 pointer-events-none bg-gradient-to-t from-background via-background/95 to-transparent" aria-hidden="true" />
      <nav className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-[100] flex justify-center gap-2 px-3 pointer-events-none sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:gap-3 sm:px-6">
        <div className="pointer-events-auto glass-card shadow-2xl flex max-w-[calc(100vw-4.5rem)] items-center gap-0.5 rounded-full px-1.5 py-1.5 max-md:backdrop-blur-md md:backdrop-blur-3xl sm:max-w-none sm:gap-1 sm:px-2 sm:py-2">
        <Link
          href={`/candid/session/${CANDID_THREAD_ID}`}
          onClick={triggerLight}
          className={cn(
            "relative flex h-9 items-center rounded-full px-3 text-sm font-light tracking-tight transition-colors active:scale-95 sm:h-10 sm:px-4",
            pathname.startsWith("/candid/session") ? "text-accent" : "text-foreground hover:text-accent"
          )}
          aria-label="Candid AI Chat"
        >
          {threadHasPresence && !pathname.startsWith("/candid/session") ? (
            <span className="absolute top-1 right-2 h-1.5 w-1.5 rounded-full bg-accent/80 shadow-[0_0_12px_hsl(var(--accent)/0.85)] animate-[candid-breathe_2.8s_ease-in-out_infinite]" />
          ) : null}
          Candid
        </Link>
        <div className="mx-0.5 h-5 w-px bg-border/50 sm:mx-1" aria-hidden="true" />
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={triggerLight}
              className={cn(
                "relative flex h-9 min-w-0 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs font-light tracking-wide transition-colors active:scale-95 sm:h-auto sm:min-w-24 sm:gap-2 sm:px-4 sm:py-2",
                isActive ? "bg-accent text-accent-foreground" : "text-foreground-secondary sm:hover:text-foreground",
              )}
            >
              <Icon data-icon="inline-start" className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="max-[380px]:sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      <div className="pointer-events-auto flex items-center">
         <ThemeIsland />
      </div>
      </nav>
    </>
  );
}

function PresenceDot() {
  return (
    <span
      aria-hidden
      className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent/80 shadow-[0_0_12px_hsl(var(--accent)/0.85)] animate-[candid-breathe_2.8s_ease-in-out_infinite]"
    />
  );
}
