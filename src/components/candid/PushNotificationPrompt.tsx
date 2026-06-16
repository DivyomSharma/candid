"use client";

import { useEffect, useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Bell, X } from "lucide-react";
import { AmbientGlyph } from "./art/AmbientGlyph";

export function PushNotificationPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported and we haven't asked yet
    const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported && Notification.permission === "default") {
      const hasDismissed = localStorage.getItem("candid-push-dismissed");
      if (!hasDismissed) {
        // Delay the prompt so it's not overwhelming on first load
        const timer = setTimeout(() => setIsOpen(true), 15000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleEnable = async () => {
    if (!isSupported) return;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        // Register push manager here later when VAPID keys are ready
        console.log("Push permission granted.");
      }
    } catch (e) {
      console.error("Error requesting push permission", e);
    } finally {
      setIsOpen(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("candid-push-dismissed", "true");
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
            <AmbientGlyph icon={Bell} />
          </div>
          <DrawerTitle className="text-2xl font-light tracking-wide text-foreground mb-2">
            quiet reminders
          </DrawerTitle>
          <DrawerDescription className="text-base text-foreground-secondary/70 font-light mx-auto max-w-[280px] leading-relaxed">
            allow notifications for new signals, aligns, and when candid has a thought for you.
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 pt-0 flex flex-col gap-3 max-w-[320px] mx-auto w-full mt-4">
          <Button 
            onClick={handleEnable} 
            className="w-full rounded-full bg-accent text-primary-foreground hover:bg-accent/90 h-12 text-lg font-light shadow-xl"
          >
            enable
          </Button>
          <Button 
            onClick={handleDismiss} 
            variant="ghost" 
            className="w-full rounded-full h-12 font-light text-foreground-secondary hover:text-foreground"
          >
            not right now
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
