"use client";

import { useEffect } from "react";
import { syncOnboardingCookieAndRedirect } from "./actions";

export function SyncAndRedirect() {
  useEffect(() => {
    syncOnboardingCookieAndRedirect();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-background gap-4">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent opacity-80 candid-breathe">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
      </svg>
      <p className="text-sm text-muted-foreground font-light tracking-wide candid-breathe">Syncing environment...</p>
    </div>
  );
}
