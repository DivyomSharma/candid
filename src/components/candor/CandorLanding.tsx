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
    <>
      <AsciiBackground />
      <Index />
    </>
  );
}
