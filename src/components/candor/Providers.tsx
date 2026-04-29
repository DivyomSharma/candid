"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SmoothScrollProvider } from "@/components/candor/SmoothScrollProvider";
import CustomCursor from "@/components/CustomCursor";

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ??
  "pk_test_ZGV2ZWxvcG1lbnQuY2xlcmsk";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ThemeProvider>
        <TooltipProvider>
          <CustomCursor />
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
