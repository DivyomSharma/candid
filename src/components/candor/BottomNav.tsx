"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/candor/home", label: "home", icon: Home },
  { href: "/candor/you", label: "you", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-5 z-40 flex justify-center px-6">
      <div className="surface soft-shadow flex items-center gap-1 rounded-full border border-border/50 px-2 py-2 backdrop-blur-md">
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
    </nav>
  );
}
