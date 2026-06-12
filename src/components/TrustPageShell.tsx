import Link from "next/link";
import type { ReactNode } from "react";

export default function TrustPageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="gradient-bg grain relative isolate min-h-dvh overflow-hidden">
      <div className="relative z-10">
        <section className="mx-auto max-w-4xl px-6 pb-24 pt-28 sm:px-8 md:px-10">
          <div className="rounded-[2rem] border border-border/60 bg-[hsl(var(--surface)/0.74)] px-6 py-10 shadow-[0_24px_80px_-32px_hsl(var(--foreground)/0.22)] backdrop-blur-xl sm:px-10 sm:py-14">
            <div className="mb-10 flex items-center justify-between gap-6">
              <Link href="/candor" className="text-lg font-light tracking-wide text-foreground transition hover:text-foreground-secondary">
                candor
              </Link>
              <div className="flex flex-wrap items-center justify-end gap-3 text-xs uppercase tracking-[0.28em] text-foreground-secondary/70">
                <span>{eyebrow}</span>
                <span className="h-px w-10 bg-border/70" />
                <Link href="/candor" className="tracking-[0.2em] text-foreground-secondary/60 transition hover:text-foreground">
                  back to candor
                </Link>
              </div>
            </div>

            <div className="max-w-3xl space-y-5">
              <h1 className="text-3xl font-light tracking-[-0.03em] text-foreground sm:text-5xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-foreground-secondary sm:text-base">{intro}</p>
            </div>

            <div className="mt-12 space-y-10 text-sm leading-7 text-foreground-secondary sm:text-[15px]">
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
