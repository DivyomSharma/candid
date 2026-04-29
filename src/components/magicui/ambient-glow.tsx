import { cn } from "@/lib/utils";

export function AmbientGlow({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="absolute left-1/2 top-12 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/15 blur-3xl animate-breathe" />
      <div className="absolute bottom-0 right-8 h-52 w-52 rounded-full bg-primary/10 blur-3xl animate-soft-pulse" />
    </div>
  );
}
