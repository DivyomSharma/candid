"use client";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SmoothScrollProvider } from "@/components/candid/SmoothScrollProvider";
import { useGlobalKeyboardShortcuts } from "@/hooks/useGlobalKeyboardShortcuts";

export function Providers({ children }: { children: React.ReactNode }) {
  useGlobalKeyboardShortcuts();

  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
