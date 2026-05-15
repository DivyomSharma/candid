"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Copy, ExternalLink, Share2, Sparkles, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BottomNav } from "@/components/candor/BottomNav";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import type { CandorProfilePresentation } from "@/lib/candor/profile";

export function ProfileSurface({
  profile,
  heading,
  subheading,
  showBottomNav = true,
  actionSlot,
  publicMode = false,
}: {
  profile: CandorProfilePresentation;
  heading: string;
  subheading: string;
  showBottomNav?: boolean;
  actionSlot?: React.ReactNode;
  publicMode?: boolean;
}) {
  const router = useRouter();
  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") return profile.publicPath;
    return `${window.location.origin}${profile.publicPath}`;
  }, [profile.publicPath]);

  const shareProfile = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${profile.username} on Candor`,
          text: profile.shareCards[0]?.lines.join(" ") ?? profile.bio,
          url: fullUrl,
        });
        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard.writeText(fullUrl);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(fullUrl);
  };

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-4 pb-32 pt-16 sm:px-6 sm:pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[700px] flex-col gap-6 sm:gap-8">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">{heading}</h1>
          <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">{subheading}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="contents">
          <Card className="surface overflow-hidden border-border/50 bg-card/45 backdrop-blur-sm">
            <div className="relative h-36" style={{ background: profile.bannerTone }}>
              <div className="absolute inset-0 bg-background/10" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
                <Avatar className="h-24 w-24 border border-border/60 bg-background/70 shadow-sm">
                  <AvatarFallback className="bg-background/70 text-2xl font-light text-foreground">
                    {profile.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="mb-1 flex items-center gap-2">
                  {actionSlot}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={shareProfile}
                    className="rounded-full border-border/50 bg-background/50 px-4 font-light backdrop-blur-md hover:bg-accent/10"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    share
                  </Button>
                </div>
              </div>
            </div>

            <CardContent className="flex flex-col gap-6 p-5 pt-7">
              <div>
                <p className="text-xs font-light uppercase tracking-[0.24em] text-accent/70">{profile.handle}</p>
                <h2 className="mt-2 text-3xl font-light tracking-tight">{profile.username}</h2>
                <p className="mt-3 text-base font-light leading-7 text-foreground-secondary break-words">{profile.bio}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {profile.observations.map((signal) => (
                  <SignalCard key={signal.label} {...signal} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
                <Sparkles className="h-4 w-4 text-accent" />
                what candor notices
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 pt-3">
              {profile.whatCandorNotices.map((item) => (
                <p key={item} className="rounded-2xl border border-border/40 bg-background/25 px-4 py-3 text-sm font-light leading-6 text-foreground-secondary break-words">
                  {item}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
                <UserRound className="h-4 w-4 text-accent" />
                social read
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 p-5 pt-3 sm:grid-cols-2">
              <TextBlock title="conversation themes" items={profile.conversationalThemes} />
              <TextBlock title="favorite gravity" items={profile.interests} />
              <TextBlock title="social tendencies" items={profile.socialPreferences} />
              <TextBlock title="lifestyle signals" items={profile.lifestylePreferences} />
            </CardContent>
          </Card>

          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardContent className="grid gap-6 p-5 md:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="text-xs font-light uppercase tracking-[0.22em] text-foreground-secondary">alignment style</p>
                <h3 className="mt-4 text-2xl font-light leading-8 break-words">{profile.alignmentStyle}</h3>
                <div className="mt-4 flex flex-col gap-2">
                  {profile.resonanceIndicators.map((item) => (
                    <p key={item} className="text-sm font-light leading-6 text-foreground-secondary break-words">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/35 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-light uppercase tracking-[0.22em] text-foreground-secondary">public profile</p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={copyLink}
                    className="h-8 rounded-full px-3 text-xs font-light text-foreground-secondary hover:bg-background/50 hover:text-foreground"
                  >
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    copy link
                  </Button>
                </div>
                <Link href={profile.publicPath} className="mt-4 flex items-center gap-2 text-base font-light text-foreground transition-colors hover:text-accent">
                  <span>{profile.publicPath}</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
                {publicMode ? (
                  <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">made to be read, compared, and quietly shared.</p>
                ) : (
                  <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">this is the version of you candor can share without saying too much.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
                <Sparkles className="h-4 w-4 text-accent" />
                share cards
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 pt-3 md:grid-cols-2">
              {profile.shareCards.map((card) => (
                <ShareCard key={card.kind} title={card.title} lines={card.lines} kind={card.kind} />
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {!publicMode ? (
          <div className="flex justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(profile.publicPath)}
              className="rounded-full px-4 font-light text-foreground-secondary hover:bg-background/40 hover:text-foreground"
            >
              preview public profile
            </Button>
          </div>
        ) : null}
      </section>
      {showBottomNav ? <BottomNav /> : null}
    </main>
  );
}

function SignalCard({ label, value, meter }: { label: string; value: string; meter: number }) {
  return (
    <div className="min-w-0 rounded-2xl border border-border/45 bg-background/30 p-4">
      <p className="text-[11px] font-light uppercase tracking-[0.2em] text-foreground-secondary">{label}</p>
      <p className="mt-2 min-h-10 text-sm font-light leading-5 break-words">{value}</p>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border/50">
        <div className="h-full rounded-full bg-accent/70" style={{ width: `${meter}%` }} />
      </div>
    </div>
  );
}

function TextBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-light uppercase tracking-[0.2em] text-foreground-secondary">{title}</p>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <p key={item} className="text-sm font-light leading-6 text-foreground-secondary break-words">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function ShareCard({
  kind,
  title,
  lines,
}: {
  kind: "story" | "post" | "x" | "banner";
  title: string;
  lines: string[];
}) {
  const sizeClass =
    kind === "story"
      ? "min-h-[260px]"
      : kind === "banner"
        ? "min-h-[160px] md:col-span-2"
        : "min-h-[190px]";

  return (
    <div className={`surface soft-shadow rounded-[20px] border border-border/50 bg-background/35 p-5 ${sizeClass}`}>
      <p className="text-[11px] font-light uppercase tracking-[0.22em] text-accent/75">{title}</p>
      <div className="mt-5 flex flex-col gap-3">
        {lines.map((line, index) => (
          <p
            key={`${line}-${index}`}
            className={index === 0 ? "text-xl font-light leading-8 text-foreground" : "text-sm font-light leading-6 text-foreground-secondary"}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
