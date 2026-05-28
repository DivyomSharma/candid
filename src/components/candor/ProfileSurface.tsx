"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Share2, Sparkles, UserRound } from "lucide-react";
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
  onEditClick,
  publicMode = false,
}: {
  profile: CandorProfilePresentation;
  heading: string;
  subheading: string;
  showBottomNav?: boolean;
  actionSlot?: React.ReactNode;
  onEditClick?: () => void;
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

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-4 pb-32 pt-16 sm:px-6 sm:pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[700px] flex-col gap-6 sm:gap-8">
        {publicMode ? (
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">{heading}</h1>
            <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">{subheading}</p>
          </motion.div>
        ) : null}

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="contents">
          {/* HERO PROFILE CARD */}
          <Card className="surface overflow-hidden border-border/50 bg-card/45 backdrop-blur-sm">
            <div className="relative h-48 sm:h-56" style={{ background: profile.bannerTone }}>
              <div className="absolute inset-0 bg-background/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                <div className="flex items-center gap-5">
                  <Avatar className="h-20 w-20 sm:h-28 sm:w-28 border-2 border-border/60 bg-background/70 shadow-lg shrink-0">
                    <AvatarFallback className="bg-background/80 text-3xl font-light text-foreground shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
                      {profile.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="mb-1 sm:mb-2">
                    <h2 className="text-2xl sm:text-4xl font-light tracking-tight">{profile.username}</h2>
                    <p className="text-xs sm:text-sm font-light uppercase tracking-[0.24em] text-accent/80 mt-1">{profile.handle}</p>
                    <p className="mt-3 text-xs sm:text-sm font-light text-foreground-secondary flex items-center gap-2">
                      {[profile.age, profile.city].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-start sm:self-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={shareProfile}
                    className="rounded-full border-border/50 bg-background/50 px-4 font-light backdrop-blur-md hover:bg-accent/10"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    share
                  </Button>
                  {onEditClick && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onEditClick}
                      className="rounded-full border-border/50 bg-background/50 px-4 font-light backdrop-blur-md hover:bg-accent/10"
                    >
                      edit
                    </Button>
                  )}
                  {actionSlot}
                </div>
              </div>
            </div>

            <CardContent className="flex flex-col gap-6 p-6 pt-5">
              <p className="text-lg sm:text-xl font-light leading-8 text-foreground/90 italic">
                "{profile.atmosphericLine}"
              </p>
              {!publicMode ? (
                <p className="text-sm font-light leading-6 text-foreground-secondary">{subheading}</p>
              ) : null}
            </CardContent>
          </Card>

          {/* SOCIAL ATMOSPHERE */}
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
                <Sparkles className="h-4 w-4 text-accent" />
                social atmosphere
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-3">
              <div className="flex flex-wrap gap-2.5">
                {profile.socialAtmosphere.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-border/40 bg-background/30 px-4 py-2 text-sm font-light text-foreground-secondary shadow-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CONNECTION STYLE */}
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
                <UserRound className="h-4 w-4 text-accent" />
                connection style
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 pt-3">
              {profile.connectionStyle.map((style, i) => (
                <p
                  key={style}
                  className="rounded-2xl border border-border/30 bg-background/20 px-4 py-3 text-sm font-light leading-6 text-foreground-secondary"
                >
                  {style}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* THINGS THEY LIGHT UP ABOUT */}
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
                <Sparkles className="h-4 w-4 text-accent" />
                things they light up about
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 pt-3">
              {profile.thingsTheyLightUpAbout.map((item, index) => (
                <p
                  key={item}
                  className={
                    index === 0
                      ? "rounded-[22px] border border-accent/25 bg-background/28 px-5 py-4 text-base font-light leading-7 text-foreground"
                      : "rounded-2xl border border-border/30 bg-background/20 px-4 py-3 text-sm font-light leading-6 text-foreground-secondary"
                  }
                >
                  {item}
                </p>
              ))}
            </CardContent>
          </Card>

          {/* CONVERSATION ENERGY */}
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
                <UserRound className="h-4 w-4 text-accent" />
                conversation energy
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-5 pt-3 sm:grid-cols-2">
              {profile.conversationEnergy.map((energy) => (
                <div key={energy} className="rounded-2xl border border-border/40 bg-background/30 p-4">
                  <p className="text-sm font-light leading-6 text-foreground-secondary break-words">
                    {energy}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {!publicMode ? (
            <Link
              href="/memory-controls"
              className="text-right text-xs font-light uppercase tracking-[0.18em] text-foreground-secondary/60 transition hover:text-foreground"
            >
              privacy & continuity
            </Link>
          ) : null}
        </motion.div>

        {!publicMode ? (
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(profile.publicPath)}
              className="rounded-full px-4 font-light text-foreground-secondary hover:bg-background/40 hover:text-foreground"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              preview
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/memory-controls")}
              className="rounded-full px-4 font-light text-foreground-secondary hover:bg-background/40 hover:text-foreground"
            >
              privacy & continuity
            </Button>
          </div>
        ) : null}
      </section>
      {showBottomNav ? <BottomNav /> : null}
    </main>
  );
}

