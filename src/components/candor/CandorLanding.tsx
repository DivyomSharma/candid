"use client";

import { useEffect } from "react";
import CustomCursor from "@/components/CustomCursor";
import FloatingDoodles from "@/components/FloatingDoodles";
import Index from "@/landing/Index";

export default function CandorLanding() {
  useEffect(() => {
    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    document.addEventListener("contextmenu", preventContextMenu);
    return () => document.removeEventListener("contextmenu", preventContextMenu);
  }, []);

  return (
    <>
      <CustomCursor />
      <FloatingDoodles />
      <Index />
    </>
  );
}
