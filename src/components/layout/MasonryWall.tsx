"use client";

import React from "react";
import Masonry from "react-masonry-css";
import { cn } from "@/lib/utils";

interface MasonryWallProps {
  children: React.ReactNode;
  className?: string;
  columnClassName?: string;
  breakpointCols?: number | Record<string | number, number>;
}

export function MasonryWall({
  children,
  className,
  columnClassName,
  breakpointCols = {
    default: 5,
    1536: 4, // 2xl
    1280: 3, // xl
    1024: 2, // lg / tablet landscape
    768: 2,  // md / tablet portrait
    640: 1,  // sm / mobile
  },
}: MasonryWallProps) {
  return (
    <Masonry
      breakpointCols={breakpointCols}
      className={cn("flex w-auto -ml-6", className)}
      columnClassName={cn("pl-6 bg-clip-padding", columnClassName)}
    >
      {React.Children.map(children, (child) => (
        <div className="mb-6">
          {child}
        </div>
      ))}
    </Masonry>
  );
}
