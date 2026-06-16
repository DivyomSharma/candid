"use client";

import { useState, useRef, useEffect } from "react";
import type { OnboardingData } from "./OnboardingWizard";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => (CURRENT_YEAR - 18 - i).toString()); // Start 18 years ago

function WheelColumn({
  items,
  value,
  onChange,
  label
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const ITEM_HEIGHT = 48; // Must match the height of individual items (h-12 = 3rem = 48px)

  useEffect(() => {
    // Scroll to initial value
    if (containerRef.current) {
      const idx = items.indexOf(value);
      if (idx !== -1) {
        containerRef.current.scrollTop = idx * ITEM_HEIGHT;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollY = containerRef.current.scrollTop;
    const index = Math.round(scrollY / ITEM_HEIGHT);
    if (index >= 0 && index < items.length) {
      if (items[index] !== value) {
        onChange(items[index]);
      }
    }
  };

  // Mouse Drag Logic
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - containerRef.current.offsetTop);
    setScrollTop(containerRef.current.scrollTop);
    containerRef.current.style.scrollSnapType = 'none'; // Disable snapping while dragging
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const y = e.pageY - containerRef.current.offsetTop;
    const walk = (y - startY) * 1.5;
    containerRef.current.scrollTop = scrollTop - walk;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDragging(false);
    containerRef.current.style.scrollSnapType = 'y mandatory'; // Re-enable snapping
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextParent = e.currentTarget.parentElement?.parentElement?.nextElementSibling;
      const nextCol = nextParent?.querySelector('[tabindex="0"]') as HTMLElement;
      if (nextCol) nextCol.focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevParent = e.currentTarget.parentElement?.parentElement?.previousElementSibling;
      const prevCol = prevParent?.querySelector('[tabindex="0"]') as HTMLElement;
      if (prevCol) prevCol.focus();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <span className={`text-[10px] uppercase tracking-widest mb-2 transition-colors duration-200 ${
        isFocused ? "text-foreground font-semibold" : "text-muted-foreground/60"
      }`}>
        {label}
      </span>
      <div 
        className={`relative h-[144px] overflow-hidden rounded-xl transition-colors duration-200 ${
          isFocused ? "bg-foreground/[0.03]" : ""
        }`}
        style={{ WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)" }}
      >
        <div 
          ref={containerRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          tabIndex={0}
          className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar cursor-ns-resize outline-none focus-visible:ring-1 focus-visible:ring-foreground/20 rounded-xl"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'none' }}
        >
          {/* Top padding to allow first item to be centered */}
          <div className="h-[48px]"></div>
          
          {items.map((item, i) => (
            <div 
              key={item} 
              className={`h-[48px] flex items-center justify-center snap-center text-3xl font-light transition-colors duration-200 ${
                item === value ? "text-foreground" : "text-muted-foreground/30"
              }`}
            >
              {item}
            </div>
          ))}
          
          {/* Bottom padding to allow last item to be centered */}
          <div className="h-[48px]"></div>
        </div>
      </div>
    </div>
  );
}

export function StepBirthday({
  data,
  updateData,
  onNext,
  onBack,
}: {
  data: OnboardingData;
  updateData: (d: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  // HTML Date is YYYY-MM-DD
  // We'll parse it or use defaults
  const [year, month, day] = data.birthday 
    ? data.birthday.split("-") 
    : [YEARS[0], "01", "01"]; // Default to 18 years ago, Jan 01

  // Convert month "01" -> "Jan"
  const currentMonthStr = MONTHS[parseInt(month, 10) - 1] || "Jan";

  const updateDate = (newM: string, newD: string, newY: string) => {
    // Convert "Jan" -> "01"
    const mIdx = MONTHS.indexOf(newM) + 1;
    const mStr = mIdx.toString().padStart(2, "0");
    updateData({ birthday: `${newY}-${mStr}-${newD}` });
  };

  // If no birthday was set originally, initialize it so the Continue button appears
  useEffect(() => {
    if (!data.birthday) {
      updateDate(currentMonthStr, day, year);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-light mb-16 text-center text-foreground">
        When were you born?
      </h2>
      
      <div className="glass-card rounded-3xl p-8 flex gap-6 items-center shadow-2xl shadow-black/20">
        <WheelColumn 
          label="Month" 
          items={MONTHS} 
          value={currentMonthStr} 
          onChange={(m) => updateDate(m, day, year)} 
        />
        <WheelColumn 
          label="Day" 
          items={DAYS} 
          value={day} 
          onChange={(d) => updateDate(currentMonthStr, d, year)} 
        />
        <WheelColumn 
          label="Year" 
          items={YEARS} 
          value={year} 
          onChange={(y) => updateDate(currentMonthStr, day, y)} 
        />
        
        {/* Horizontal highlight line for the center item */}
        <div className="absolute left-6 right-6 h-[48px] border-y border-border/20 pointer-events-none mt-6 z-0" />
      </div>
      
      <div className="mt-16 h-12 flex gap-4">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-full text-muted-foreground hover:text-foreground transition-colors text-sm tracking-wide"
        >
          Back
        </button>
        {data.birthday && (
          <button
            onClick={onNext}
            className="px-6 py-2 rounded-full border border-border/50 hover:bg-foreground/5 text-foreground transition-colors text-sm tracking-wide shadow-sm"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
