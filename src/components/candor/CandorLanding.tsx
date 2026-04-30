"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import Index from "@/landing/Index";

const AsciiBackground = dynamic(() => import("@/components/AsciiBackground"), { ssr: false });

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
