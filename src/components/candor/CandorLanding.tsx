"use client";

import { useEffect } from "react";
import Index from "@/landing/Index";

export default function CandorLanding() {
  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);
    return () => document.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  return (
    <main className="gradient-bg grain relative isolate min-h-screen overflow-hidden">
      <div className="relative z-10">
        <Index />
      </div>
    </main>
  );
}
