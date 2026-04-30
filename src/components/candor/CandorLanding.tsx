"use client";

import { useEffect } from "react";
import AsciiBackground from "@/components/AsciiBackground";
import Index from "@/landing/Index";

export default function CandorLanding() {
  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);
    return () => document.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  return (
    <main className="gradient-bg grain relative isolate min-h-screen overflow-hidden">
      <AsciiBackground />
      <div className="relative z-10">
        <Index />
      </div>
    </main>
  );
}
