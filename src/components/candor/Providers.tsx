"use client";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SmoothScrollProvider } from "@/components/candor/SmoothScrollProvider";
import CustomCursor from "@/components/CustomCursor";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <CustomCursor />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
