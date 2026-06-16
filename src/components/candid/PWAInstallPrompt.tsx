"use client";

import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { AmbientGlyph } from "./art/AmbientGlyph";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if already dismissed or installed
    const hasDismissed = localStorage.getItem("candid-pwa-dismissed");
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (hasDismissed || isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a slight delay so it doesn't interrupt immediate load
      setTimeout(() => setIsOpen(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("candid-pwa-dismissed", "true");
    setIsOpen(false);
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => {
      if (!open) handleDismiss();
      setIsOpen(open);
    }}>
      <DrawerContent className="bg-background/80 backdrop-blur-3xl border-t border-border/40 outline-none pb-8">
        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-border/50 mt-4 mb-2" />
        <DrawerHeader className="text-center sm:text-center px-6">
          <div className="mx-auto mb-6 flex justify-center text-accent/80">
            <AmbientGlyph icon={Download} />
          </div>
          <DrawerTitle className="text-2xl font-light tracking-wide text-foreground mb-2">
            keep candid near
          </DrawerTitle>
          <DrawerDescription className="text-base text-foreground-secondary/70 font-light mx-auto max-w-[280px] leading-relaxed">
            install it to your home screen. it feels native, works offline, and keeps your memories safe.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 pt-0 flex flex-col gap-3 max-w-[320px] mx-auto w-full mt-4">
          <Button 
            onClick={handleInstall} 
            className="w-full rounded-full bg-accent text-primary-foreground hover:bg-accent/90 h-12 text-lg font-light shadow-xl"
          >
            add to home screen
          </Button>
          <Button 
            onClick={handleDismiss} 
            variant="ghost" 
            className="w-full rounded-full h-12 font-light text-foreground-secondary hover:text-foreground"
          >
            maybe later
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
