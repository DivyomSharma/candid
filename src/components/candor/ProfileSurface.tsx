"use client";

import { useMemo, useState, useEffect } from "react";
import { Link } from "next-view-transitions";
import { 
  ExternalLink, 
  Share2, 
  Sparkles, 
  UserRound, 
  ArrowRight, 
  Laptop, 
  Film, 
  BookOpen, 
  Music, 
  Brain, 
  Coffee, 
  Heart, 
  Compass, 
  ShieldCheck, 
  HelpCircle,
  Instagram,
  Github,
  Twitter,
  Settings,
  Edit3, 
  Check
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BottomNav } from "@/components/candor/BottomNav";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import type { CandorProfilePresentation } from "@/lib/candor/profile";
import type { CandorMemory, CandorBadge } from "@/lib/candor/types";
import { AmbientGlyph } from "@/components/candor/art/AmbientGlyph";
import { WeatherWidget } from "@/components/candor/widgets/WeatherWidget";
import { ZodiacWidget } from "@/components/candor/widgets/ZodiacWidget";
import { ShelfItemCard } from "@/components/candor/widgets/ShelfItemCard";
import { ProfileWall, type ProfileModuleData } from "@/components/candor/ProfileWall";

// Custom premium brand SVG icons
const SpotifyIcon = () => (
  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.305-1.76-8.786-.965-.335.076-.668-.135-.744-.47-.077-.335.136-.668.47-.744 3.81-.87 7.076-.496 9.71 1.112.295.18.387.563.207.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.69-1.654-6.79-2.135-9.97-1.17-.413.125-.845-.107-.97-.52-.125-.413.107-.845.52-.97 3.63-1.102 8.14-.572 11.23 1.327.367.226.487.707.26 1.073zm.106-2.835C14.692 8.91 9.34 8.732 6.223 9.68c-.534.162-1.097-.142-1.26-.676-.162-.534.142-1.097.676-1.26 3.583-1.087 9.475-.877 13.9 1.75.48.284.64.9.356 1.38-.284.48-.9.64-1.38.356z"/>
  </svg>
);

const LetterboxdIcon = () => (
  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
    <path d="M7.8 12a4.2 4.2 0 1 1 8.4 0 4.2 4.2 0 0 1-8.4 0zm8.4 0a4.2 4.2 0 0 0 4.2-4.2A4.2 4.2 0 0 0 16.2 12zm-8.4 0a4.2 4.2 0 0 1-4.2-4.2A4.2 4.2 0 0 1 7.8 12z" />
  </svg>
);

const XIcon = () => (
  <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600",
  "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600"
];

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
  const [viewerTraits, setViewerTraits] = useState<CandorMemory | null>(null);



  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") return profile.publicPath;
    return `${window.location.origin}${profile.publicPath}`;
  }, [profile.publicPath]);

  useEffect(() => {
    if (publicMode) {
      fetch("/api/candor/me/traits")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.memory) {
            setViewerTraits(data.memory);
          }
        })
        .catch((err) => console.error("Error fetching viewer traits:", err));
    }
  }, [publicMode]);

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
        // Fallback below
      }
    }
    await navigator.clipboard.writeText(fullUrl);
  };

  const v4 = useMemo(() => profile.profileV4 || {
    currently: { building: "", watching: "", reading: "", listening: "", thinking: "" },
    tonight: [],
    shelf: [],
    openLoops: { thinkingAbout: "", recommending: "", defending: "" },
    smallThings: [],
    socialLinks: {},
    photos: [],
    badges: [],
  }, [profile.profileV4]);

  const statuses = useMemo(() => {
    const list: Array<{ label: string; value: string }> = [];
    if (v4.currently?.building) list.push({ label: "Building", value: v4.currently.building });
    if (v4.currently?.watching) list.push({ label: "Watching", value: v4.currently.watching });
    if (v4.currently?.listening) list.push({ label: "Listening", value: v4.currently.listening });
    if (v4.currently?.thinking) list.push({ label: "Thinking about", value: v4.currently.thinking });
    if (v4.currently?.reading) list.push({ label: "Reading", value: v4.currently.reading });
    return list;
  }, [v4.currently]);

  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (statuses.length <= 1) return;
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [statuses.length]);

  const visibleBadges = useMemo(() => {
    if (!v4.badges) return [];
    return v4.badges
      .filter((b: CandorBadge | string) => {
        const confidence = typeof b === "string" ? 0.95 : (b.confidence ?? 0.5);
        return confidence > 0.90;
      })
      .map((b: CandorBadge | string) => typeof b === "string" ? b : b.label)
      .slice(0, 3);
  }, [v4.badges]);

  const overlaps = useMemo(() => {
    if (!viewerTraits || !v4) return null;
    const viewerV4 = viewerTraits.profileV4;
    if (!viewerV4) return null;

    const sharedThings: string[] = [];

    const tOverlap = (v4.smallThings || []).filter((x) => 
      (viewerV4.smallThings || []).map((s: string) => s.toLowerCase()).includes(x.toLowerCase())
    );
    if (tOverlap.length > 0) {
      sharedThings.push(`both of you love ${tOverlap.join(", ")}`);
    }

    (v4.shelf || []).forEach((item) => {
      const match = (viewerV4.shelf || []).find((x: { key: string; value: string }) => 
        x.key.toLowerCase() === item.key.toLowerCase() && 
        x.value.toLowerCase() === item.value.toLowerCase()
      );
      if (match) {
        sharedThings.push(`both share the same ${item.key} (${item.value})`);
      }
    });

    const currentlyKeys: Array<keyof typeof v4.currently> = ["listening", "watching", "reading"];
    currentlyKeys.forEach((key) => {
      const targetVal = v4.currently?.[key];
      const viewerVal = viewerV4.currently?.[key];
      if (targetVal && viewerVal && targetVal.toLowerCase().trim() === viewerVal.toLowerCase().trim()) {
        sharedThings.push(`both are currently ${key === "listening" ? "listening to" : key === "watching" ? "watching" : "reading"} ${targetVal}`);
      }
    });

    return sharedThings;
  }, [viewerTraits, v4]);

  const socialLinksConfig = useMemo(() => {
    const links = v4.socialLinks || {};
    return [
      { key: "instagram", label: "Instagram", icon: <Instagram className="h-4 w-4" />, url: (val: string) => `https://instagram.com/${val.replace("@", "")}` },
      { key: "spotify", label: "Spotify", icon: <SpotifyIcon />, url: (val: string) => `https://open.spotify.com/user/${val}` },
      { key: "letterboxd", label: "Letterboxd", icon: <LetterboxdIcon />, url: (val: string) => `https://letterboxd.com/${val}` },
      { key: "github", label: "GitHub", icon: <Github className="h-4 w-4" />, url: (val: string) => `https://github.com/${val}` },
      { key: "x", label: "X", icon: <XIcon />, url: (val: string) => `https://x.com/${val.replace("@", "")}` }
    ].filter(cfg => links[cfg.key]);
  }, [v4.socialLinks]);

  const photosList = v4.photos || [];

  const observation = profile.whatCandorNotices?.[0] || "not enough interactions yet.";

  const turnCount = profile.alignmentAndDepth?.meaningfulConversations ?? 0;
  const isProfileLocked = turnCount < 2;
  const primaryMeta = [profile.age, profile.city].filter(Boolean);
  const secondaryMeta = [profile.occupation, profile.education].filter(Boolean);
  
  // Find a favorite album for the SpinningVinyl widget
  const favoriteAlbum = useMemo(() => {
    return v4.shelf?.find((s: Record<string, unknown>) => s.key === "album");
  }, [v4.shelf]);

  const profileModules = useMemo(() => {
    let baseLayout = profile.profileV4.layout;
    if (!baseLayout || baseLayout.length === 0) {
      baseLayout = [
        { id: "candor-noticed", order: 0, visible: true, pinned: false },
        { id: "gallery", order: 1, visible: true, pinned: false },
        { id: "public-read", order: 2, visible: true, pinned: false },
        { id: "conversation-energy", order: 3, visible: true, pinned: false },
        { id: "current-curiosity", order: 4, visible: true, pinned: false },
        { id: "small-joys", order: 5, visible: true, pinned: false },
        { id: "seasonal-mood", order: 6, visible: true, pinned: false },
        { id: "shelf", order: 7, visible: true, pinned: false },
        { id: "questions-worth-asking", order: 8, visible: true, pinned: false },
        { id: "signature-objects", order: 9, visible: true, pinned: false },
      ];
    }
    
    // Sort by order
    const sorted = [...baseLayout].sort((a, b) => a.order - b.order);
    
    const mapped: ProfileModuleData[] = [];
    for (const mod of sorted) {
      if (!mod.visible) continue;
      
      const type = mod.id;
      let props: Record<string, unknown> = {};
      
      switch (mod.id) {
        case "candor-noticed":
          if (!profile.whatCandorNotices?.[0]) continue;
          props = { observation: profile.whatCandorNotices[0] };
          break;
        case "public-read":
          if (!profile.publicReadSentence) continue;
          props = { sentence: profile.publicReadSentence };
          break;
        case "conversation-energy": {
          const chips = [profile.socialPreferences?.[0], profile.interests?.[0], profile.lifestylePreferences?.[0]].filter(Boolean);
          if (chips.length === 0) continue;
          props = { chips };
          break;
        }
        case "current-curiosity":
          if (!profile.interests || profile.interests.length < 2) continue;
          props = { topics: profile.interests.slice(0, 3) };
          break;
        case "small-joys":
          if (!v4.smallThings || v4.smallThings.length === 0) continue;
          props = { joys: v4.smallThings };
          break;
        case "questions-worth-asking":
          if (!profile.questionsWorthAsking || profile.questionsWorthAsking.length === 0) continue;
          props = { questions: profile.questionsWorthAsking };
          break;
        case "signature-objects":
          if (!profile.signatureObjects) continue;
          props = { objects: profile.signatureObjects };
          break;
        case "shelf":
          if (!v4.shelf || v4.shelf.length === 0) continue;
          props = { title: "on my shelf", items: v4.shelf };
          break;
        case "seasonal-mood":
          props = { season: "summer", mood: "slow mornings, iced coffee, long books" };
          break;
        case "gallery":
          if (!v4.photos || v4.photos.length === 0) continue;
          props = { images: v4.photos };
          break;
      }
      
      mapped.push({ id: mod.id, type, visible: mod.visible, pinned: mod.pinned, props });
    }
    
    return mapped;
  }, [profile, v4]);

  return (
    <main className="gradient-bg grain relative min-h-dvh overflow-x-hidden px-4 pb-40 pt-16 sm:px-6 sm:pt-20">
      <AmbientGlow />
      
      {/* Ambient Line Art Background */}
      <AmbientGlyph icon={UserRound} />

      <section className="relative z-10 mx-auto flex max-w-[900px] flex-col gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4 }}
        >
          <Card className="surface relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md">
            {profile.coverUrl ? (
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <Image src={profile.coverUrl} alt="Cover" fill sizes="100vw" priority className="object-cover mix-blend-luminosity" />
              </div>
            ) : (
              <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: profile.bannerTone }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
            
            <CardContent className="relative z-10 flex min-h-[280px] flex-col gap-8 px-6 py-8 sm:px-8 md:min-h-[280px] md:flex-row md:items-start md:gap-10 md:pb-24 lg:px-10">
              {actionSlot && (
                <div className="absolute right-5 top-5 z-20 flex items-center justify-end sm:right-7 sm:top-7">
                  {actionSlot}
                </div>
              )}

              <div className="flex min-w-0 flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
                <div className="relative group shrink-0">
                  <motion.div
                    animate={{
                      scale: [1, 1.08, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 rounded-full bg-accent blur-md"
                    style={{ scale: 1.15 }}
                  />
                  <Avatar className="relative z-10 h-24 w-24 border-2 border-border/80 bg-background/90 shadow-2xl sm:h-28 sm:w-28">
                    {profile.coverUrl ? (
                      <Image src={profile.coverUrl} className="object-cover" alt={profile.username} fill sizes="(max-width: 768px) 112px, 112px" />
                    ) : (
                      <AvatarFallback className="bg-background/80 text-3xl font-light text-foreground shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] sm:text-4xl">
                        {profile.initials}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>

                <div className="min-w-0 space-y-3 md:max-w-[430px] lg:max-w-[520px]">
                  <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                    <h2 className="min-w-0 break-words text-3xl font-light leading-tight tracking-tight sm:text-4xl">{profile.username}</h2>
                    {visibleBadges.map((b) => (
                      <span key={b} className="rounded-full bg-accent/10 border border-accent/20 px-2.5 py-0.5 text-[10px] font-medium text-accent tracking-wide uppercase">
                        {b}
                      </span>
                    ))}
                  </div>
                  <p className="break-all text-xs font-light uppercase tracking-[0.24em] text-accent">{profile.handle}</p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 text-sm font-light text-foreground-secondary/90">
                    {primaryMeta.length > 0 && <span>{primaryMeta.join(" • ")}</span>}
                    {primaryMeta.length > 0 && secondaryMeta.length > 0 && <span className="opacity-40">•</span>}
                    {secondaryMeta.length > 0 && <span>{secondaryMeta.join(" • ")}</span>}
                  </div>

                  <div className="mt-3 flex min-h-[3.75rem] items-start justify-center overflow-visible md:justify-start">
                    <AnimatePresence mode="wait">
                      {statuses.length > 0 ? (
                        <motion.p
                          key={statusIndex}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="max-w-[36rem] text-sm font-light italic leading-6 text-foreground/80"
                        >
                          <span className="text-accent not-italic font-normal mr-1.5">{statuses[statusIndex].label}:</span>
                          "{statuses[statusIndex].value}"
                        </motion.p>
                      ) : (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="max-w-[36rem] text-sm font-light italic leading-6 text-foreground/80"
                        >
                          "{profile.bio}"
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-center gap-3 md:absolute md:bottom-8 md:right-8 md:justify-end lg:right-10">
                {!publicMode ? (
                  <>
                    <Button
                      type="button"
                      onClick={onEditClick || (() => router.push("/candor/session/ongoing?mode=improve"))}
                      className="flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-accent-foreground shadow-lg transition-all hover:scale-105 hover:bg-accent/90 sm:px-7"
                      title="Edit Profile"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Edit Profile</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={shareProfile}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-border/50 bg-background/50 p-0 backdrop-blur-md transition-all hover:scale-105 hover:bg-accent/10"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/memory-controls")}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-border/50 bg-background/50 p-0 backdrop-blur-md transition-all hover:scale-105 hover:bg-accent/10"
                      title="Settings"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={shareProfile}
                      className="flex h-11 w-11 items-center justify-center rounded-full border-border/50 bg-background/50 p-0 backdrop-blur-md transition-all hover:scale-105 hover:bg-accent/10"
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {isProfileLocked && !publicMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center text-center py-20 px-6"
          >
            <div className="relative mb-8">
              <span className="absolute inset-0 rounded-full bg-accent/20 blur-xl animate-[candor-breathe_2.8s_ease-in-out_infinite]" style={{ width: 48, height: 48, margin: 'auto' }} />
              <div className="relative h-12 w-12 rounded-full border border-accent/30 bg-background/60 backdrop-blur-md flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-accent/70" />
              </div>
            </div>
            <h3 className="text-xl font-light text-foreground mb-3">your profile is still forming</h3>
            <p className="text-sm font-light text-foreground-secondary/70 max-w-sm leading-relaxed mb-8">
              talk to candor. answer signals. the more it understands, the more this space reveals.
            </p>
            <Button
              type="button"
              onClick={() => router.push("/candor/session/ongoing")}
              className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90 font-light flex items-center gap-2"
            >
              start a conversation <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {!isProfileLocked && (
          <div className="mt-8">
            <ProfileWall initialModules={profileModules} isOwner={!publicMode} />
          </div>
        )}

        {publicMode && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <Card className="surface border-border/30 bg-card/15 backdrop-blur-md overflow-hidden">
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-xs font-light uppercase tracking-[0.2em] text-accent flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  alignment overlap
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                {!viewerTraits ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-sm font-light text-foreground-secondary">
                      sign in to see what you and {profile.username} have in common.
                    </p>
                    <Button
                      onClick={() => router.push(`/candor/login?next=${encodeURIComponent(profile.publicPath)}`)}
                      className="rounded-full bg-accent px-5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-accent/90 self-start sm:self-center"
                    >
                      sign in
                    </Button>
                  </div>
                ) : overlaps && overlaps.length > 0 ? (
                  <div className="space-y-2.5">
                    <p className="text-sm font-light text-foreground-secondary mb-1">
                      here are the threads connecting you two:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {overlaps.map((item, idx) => (
                        <span key={idx} className="rounded-full border border-accent/25 bg-accent/5 px-3.5 py-2 text-xs font-light text-foreground flex items-center gap-1.5">
                          <Heart className="h-3.5 w-3.5 text-accent" />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-light text-foreground-secondary/70">
                    you both have distinct shapes of identity. start a conversation to see what unfolds.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {photosList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            <h3 className="text-xs font-light uppercase tracking-[0.2em] text-foreground-secondary/70 px-1">atmosphere</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {photosList.map((url, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className={`relative overflow-hidden rounded-2xl border border-border/30 bg-background/25 ${
                    index === 0 ? "aspect-[4/5] sm:col-span-1" : "aspect-square"
                  }`}
                >
                  <Image
                    src={url}
                    alt={`Atmosphere ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover opacity-80 hover:opacity-95 transition-opacity"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!publicMode && (
          <motion.div 
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            onClick={() => router.push("/candor/session/ongoing?mode=improve")}
            className="cursor-pointer group relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-r from-accent/5 to-glow/5 p-8 backdrop-blur-md shadow-lg mt-6"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-glow/5 opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-xl font-light text-foreground">Does this still feel like you?</h3>
                <p className="text-sm font-light text-foreground-secondary leading-relaxed max-w-xl">
                  your rhythm changes, shelf evolves, and tastes shift. talk to candor to update your profile naturally.
                </p>
              </div>
              <Button 
                type="button"
                className="rounded-full bg-accent px-6 py-2 text-primary-foreground group-hover:scale-105 transition-transform flex items-center gap-2 font-light self-start md:self-center"
              >
                talk to candor <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {!publicMode && (
          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(profile.publicPath)}
              className="rounded-full px-4 font-light text-foreground-secondary hover:bg-background/40 hover:text-foreground flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              preview public read
            </Button>
          </div>
        )}
      </section>
      {showBottomNav && <BottomNav />}
    </main>
  );
}
