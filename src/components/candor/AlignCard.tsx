import { motion } from "framer-motion";
import { Sparkles, X, DoorOpen, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PublicCandorProfile } from "@/lib/candor/matching";

export type Align = {
  id: string;
  score: number;
  observation?: string;
  why?: string;
  profile: PublicCandorProfile;
  myDmOn: boolean;
  theirDmOn: boolean;
  canText: boolean;
};

type AlignCardProps = {
  align: Align;
  onToggleDm: (align: Align) => void;
  onMaybeLater: () => void;
};

export function AlignCard({ align, onToggleDm, onMaybeLater }: AlignCardProps) {
  const router = useRouter();
  const p = align.profile;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    router.push(`/candor/aligns/${align.id}`);
  };

  const hasCover = !!p.coverUrl;
  const locationText = [p.district, p.city].filter(Boolean).join(", ");
  const chips = p.identityChips?.length ? p.identityChips : p.values;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="mb-8 w-full"
    >
      <Card
        onClick={handleCardClick}
        className="group relative cursor-pointer overflow-hidden rounded-[2rem] border-0 bg-transparent shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
      >
        <div className="absolute inset-0 z-0 bg-background/50 backdrop-blur-xl" />
        <div className="absolute inset-0 z-0 overflow-hidden">
          {hasCover ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.coverUrl || undefined}
                alt="Ambient cover"
                className="h-full w-full object-cover opacity-30 transition-opacity duration-700 mix-blend-luminosity group-hover:opacity-40"
              />
            </>
          ) : (
            <div 
              className="absolute inset-0 opacity-20 transition-opacity duration-700 group-hover:opacity-30" 
              style={{ background: `radial-gradient(circle at top right, ${p.avatarTone || 'var(--accent)'}, transparent 70%)` }} 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20 pointer-events-none" />
        </div>

        <CardContent className="relative z-10 flex min-h-[420px] flex-col justify-between p-6">
          <div className="flex w-full items-start justify-between">
            <div className="h-16 w-16" /> {/* Spacer for alignment */}

            <button
              onClick={onMaybeLater}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background/20 text-foreground-secondary backdrop-blur-md transition-colors hover:bg-background/40 hover:text-foreground"
              title="Maybe Later"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-auto flex flex-col pt-12">
            <h2 className="text-3xl font-light tracking-tight break-words whitespace-normal leading-tight text-foreground/90">
              {p.username}
              {p.age ? <span className="ml-2 text-2xl text-foreground-secondary/70">{p.age}</span> : null}
            </h2>
            {locationText && <p className="mt-1 text-xs font-light tracking-widest text-foreground-secondary uppercase">{locationText}</p>}

            {chips && chips.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {chips.slice(0, 4).map((chip, i) => (
                  <span
                    key={i}
                    className="rounded-full border border-white/5 bg-white/5 px-2.5 py-1 text-[10px] font-light lowercase tracking-wider text-foreground-secondary/90 backdrop-blur-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-white/5 pt-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-accent" />
                <span className="text-[10px] font-light uppercase tracking-[0.2em] text-accent/80">
                  candor noticed
                </span>
              </div>
              <p className="mt-2 text-sm font-light leading-relaxed text-foreground-secondary/90">
                {align.observation || "something subtle you both share."}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs font-light text-foreground-secondary flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                {align.canText ? "Door is open" : align.theirDmOn ? "They opened the door" : align.myDmOn ? "You opened the door" : "The door is closed"}
              </p>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDm(align);
                }}
                variant={align.myDmOn || align.canText ? "secondary" : "default"}
                className={`h-9 rounded-full px-4 text-xs font-light transition-all ${
                  align.myDmOn || align.canText
                    ? "bg-white/10 text-foreground hover:bg-white/20"
                    : "bg-accent/90 text-accent-foreground shadow-[0_0_15px_rgba(var(--accent),0.3)] hover:bg-accent hover:shadow-[0_0_20px_rgba(var(--accent),0.5)]"
                }`}
              >
                <DoorOpen className="mr-1.5 h-3.5 w-3.5" />
                {align.canText ? "Enter Room" : align.theirDmOn ? "Walk In" : align.myDmOn ? "Door is Open" : "Open Door"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
