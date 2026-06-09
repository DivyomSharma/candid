"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CandorPersonalProfile } from "@/lib/candor/personal-profile";
import type { CandorProfileV4 } from "@/lib/candor/types";

const emptyProfile: CandorPersonalProfile = {
  username: null,
  displayName: null,
  dob: null,
  genderIdentity: null,
  city: null,
  relationshipPreference: null,
  shortBio: null,
  occupation: null,
  education: null,
};

const emptyProfileV4: CandorProfileV4 = {
  currently: { building: "", watching: "", reading: "", listening: "", thinking: "" },
  tonight: [],
  shelf: [],
  openLoops: { thinkingAbout: "", recommending: "", defending: "" },
  smallThings: [],
  socialLinks: {},
  photos: [],
  badges: [],
};

const SMALL_THINGS_PRESETS = [
  "window seat", "voice notes", "late replies", "museum dates", "black coffee",
  "dogs", "rain", "film photography", "one-on-one conversations", "vinyl records",
  "green tea", "night walks", "slow sundays", "airport arrivals", "bookstores"
];

type PersonalProfileEditorProps = {
  profile: CandorPersonalProfile | null;
  profileV4: CandorProfileV4 | null;
  onSaved: (profile: CandorPersonalProfile, profileV4: CandorProfileV4) => void;
};

export function PersonalProfileEditor({ profile, profileV4, onSaved }: PersonalProfileEditorProps) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CandorPersonalProfile>(profile ?? emptyProfile);
  const [draftV4, setDraftV4] = useState<CandorProfileV4>(profileV4 ?? emptyProfileV4);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    if (profile) setDraft(profile);
    if (profileV4) setDraftV4(profileV4);
  }, [profile, profileV4]);

  const updateProfile = (key: keyof CandorPersonalProfile, value: string) => {
    setDraft((curr) => ({ ...curr, [key]: value || null }));
    setSaveState("idle");
  };

  const updateCurrently = (key: keyof CandorProfileV4["currently"], value: string) => {
    setDraftV4((curr) => ({
      ...curr,
      currently: { ...curr.currently, [key]: value }
    }));
    setSaveState("idle");
  };

  const updateOpenLoops = (key: keyof CandorProfileV4["openLoops"], value: string) => {
    setDraftV4((curr) => ({
      ...curr,
      openLoops: { ...curr.openLoops, [key]: value }
    }));
    setSaveState("idle");
  };

  const toggleSmallThing = (item: string) => {
    setDraftV4((curr) => {
      const list = curr.smallThings || [];
      const next = list.includes(item)
        ? list.filter((x) => x !== item)
        : [...list, item];
      return { ...curr, smallThings: next };
    });
    setSaveState("idle");
  };

  const updateSocialLink = (platform: string, value: string) => {
    setDraftV4((curr) => ({
      ...curr,
      socialLinks: { ...curr.socialLinks, [platform]: value }
    }));
    setSaveState("idle");
  };

  const updateShelf = (key: string, value: string) => {
    setDraftV4((curr) => {
      const shelf = [...(curr.shelf || [])];
      const idx = shelf.findIndex((x) => x.key === key);
      if (idx >= 0) {
        if (!value) {
          shelf.splice(idx, 1);
        } else {
          shelf[idx] = { key, value };
        }
      } else if (value) {
        shelf.push({ key, value });
      }
      return { ...curr, shelf };
    });
    setSaveState("idle");
  };

  const getShelfValue = (key: string) => {
    return draftV4.shelf?.find((x) => x.key === key)?.value ?? "";
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveState("idle");

    try {
      // 1. Save standard profile fields
      const res1 = await fetch("/api/candor/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: draft })
      });

      // 2. Save V4 profile fields
      const res2 = await fetch("/api/candor/me/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileV4: draftV4 })
      });

      if (res1.ok && res2.ok) {
        const d1 = await res1.json();
        const d2 = await res2.json();
        onSaved(d1.profile, d2.profileV4);
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    } catch (e) {
      console.error(e);
      setSaveState("error");
    } finally {
      setIsSaving(false);
    }
  };

  const stepsCount = 7;
  const progressPercent = ((step + 1) / stepsCount) * 100;

  const nextStep = () => {
    if (step < stepsCount - 1) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  // Slide transitions
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -150 : 150,
      opacity: 0
    })
  };

  const [dir, setDir] = useState(1);
  const changeStep = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  return (
    <div className="flex flex-col h-[70vh] justify-between relative px-2">
      {/* Progress Bar */}
      <div className="w-full bg-border/20 h-1.5 rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
          className="bg-accent h-full rounded-full"
        />
      </div>

      {/* Main Flow Container */}
      <div className="flex-1 relative overflow-hidden flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full flex flex-col gap-6"
          >
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className="space-y-4">
                <p className="text-xs font-light uppercase tracking-wider text-accent">Step 1 of 7 • Call Signs</p>
                <h2 className="text-2xl font-light text-foreground">What should people call you?</h2>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">display name</span>
                    <Input
                      value={draft.displayName ?? ""}
                      onChange={(e) => updateProfile("displayName", e.target.value)}
                      placeholder="e.g. Divyom Sharma"
                      className="rounded-2xl border-border/40 bg-background/20 h-12"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">username</span>
                    <Input
                      value={draft.username ?? ""}
                      onChange={(e) => updateProfile("username", e.target.value)}
                      placeholder="e.g. divyom.sharma"
                      className="rounded-2xl border-border/40 bg-background/20 h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Location & Context */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-light uppercase tracking-wider text-accent">Step 2 of 7 • Home Base</p>
                <h2 className="text-2xl font-light text-foreground">What city feels like home?</h2>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">city</span>
                    <Input
                      value={draft.city ?? ""}
                      onChange={(e) => updateProfile("city", e.target.value)}
                      placeholder="e.g. Delhi, India"
                      className="rounded-2xl border-border/40 bg-background/20 h-12"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">occupation</span>
                      <Input
                        value={draft.occupation ?? ""}
                        onChange={(e) => updateProfile("occupation", e.target.value)}
                        placeholder="e.g. Builder, Student"
                        className="rounded-2xl border-border/40 bg-background/20 h-12"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">date of birth</span>
                      <Input
                        type="date"
                        value={draft.dob ?? ""}
                        onChange={(e) => updateProfile("dob", e.target.value)}
                        className="rounded-2xl border-border/40 bg-background/20 h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Currently */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs font-light uppercase tracking-wider text-accent">Step 3 of 7 • Active Rhythm</p>
                <h2 className="text-2xl font-light text-foreground">What are you currently loseing yourself in?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">💻 building</span>
                    <Input
                      value={draftV4.currently?.building ?? ""}
                      onChange={(e) => updateCurrently("building", e.target.value)}
                      placeholder="e.g. candor app"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">🎬 watching</span>
                    <Input
                      value={draftV4.currently?.watching ?? ""}
                      onChange={(e) => updateCurrently("watching", e.target.value)}
                      placeholder="e.g. past lives"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">📚 reading</span>
                    <Input
                      value={draftV4.currently?.reading ?? ""}
                      onChange={(e) => updateCurrently("reading", e.target.value)}
                      placeholder="e.g. norwegian wood"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">🎵 listening</span>
                    <Input
                      value={draftV4.currently?.listening ?? ""}
                      onChange={(e) => updateCurrently("listening", e.target.value)}
                      placeholder="e.g. bon iver"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">☁ thinking about</span>
                    <Input
                      value={draftV4.currently?.thinking ?? ""}
                      onChange={(e) => updateCurrently("thinking", e.target.value)}
                      placeholder="e.g. moving cities"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Shelf */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-xs font-light uppercase tracking-wider text-accent">Step 4 of 7 • On My Shelf</p>
                <h2 className="text-2xl font-light text-foreground">What represents your taste?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">favorite movie</span>
                    <Input
                      value={getShelfValue("favorite movie")}
                      onChange={(e) => updateShelf("favorite movie", e.target.value)}
                      placeholder="e.g. before sunrise"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">favorite album</span>
                    <Input
                      value={getShelfValue("favorite album")}
                      onChange={(e) => updateShelf("favorite album", e.target.value)}
                      placeholder="e.g. for emma"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">favorite book</span>
                    <Input
                      value={getShelfValue("favorite book")}
                      onChange={(e) => updateShelf("favorite book", e.target.value)}
                      placeholder="e.g. catcher in the rye"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">favorite café</span>
                    <Input
                      value={getShelfValue("favorite café")}
                      onChange={(e) => updateShelf("favorite café", e.target.value)}
                      placeholder="e.g. Blue Tokai"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Open Loops */}
            {step === 4 && (
              <div className="space-y-4">
                <p className="text-xs font-light uppercase tracking-wider text-accent">Step 5 of 7 • Open Loops</p>
                <h2 className="text-2xl font-light text-foreground">What occupies your thoughts lately?</h2>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">still thinking about...</span>
                    <Input
                      value={draftV4.openLoops?.thinkingAbout ?? ""}
                      onChange={(e) => updateOpenLoops("thinkingAbout", e.target.value)}
                      placeholder="e.g. why nostalgia hurts"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">i'll never stop recommending...</span>
                    <Input
                      value={draftV4.openLoops?.recommending ?? ""}
                      onChange={(e) => updateOpenLoops("recommending", e.target.value)}
                      placeholder="e.g. before trilogy"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">currently defending...</span>
                    <Input
                      value={draftV4.openLoops?.defending ?? ""}
                      onChange={(e) => updateOpenLoops("defending", e.target.value)}
                      placeholder="e.g. movies should have intermissions"
                      className="rounded-2xl border-border/40 bg-background/20 h-11"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Small Things */}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-xs font-light uppercase tracking-wider text-accent">Step 6 of 7 • Small Things</p>
                <h2 className="text-2xl font-light text-foreground">Select the details that make you, you.</h2>
                <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto pr-1">
                  {SMALL_THINGS_PRESETS.map((item) => {
                    const isSelected = draftV4.smallThings?.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleSmallThing(item)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-light transition-all active:scale-95 ${
                          isSelected
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border/40 bg-background/15 text-foreground-secondary hover:border-accent/40"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 6: Social Links & Complete */}
            {step === 6 && (
              <div className="space-y-4">
                <p className="text-xs font-light uppercase tracking-wider text-accent">Step 7 of 7 • Connections</p>
                <h2 className="text-2xl font-light text-foreground">Where else do you exist online?</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {["instagram", "spotify", "letterboxd", "github", "x"].map((platform) => (
                    <div key={platform} className="flex flex-col gap-1">
                      <span className="text-[10px] font-light uppercase tracking-widest text-foreground-secondary/70">{platform} username</span>
                      <Input
                        value={draftV4.socialLinks?.[platform] ?? ""}
                        onChange={(e) => updateSocialLink(platform, e.target.value)}
                        placeholder={`e.g. @${platform}_user`}
                        className="rounded-2xl border-border/40 bg-background/20 h-11"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="border-t border-border/30 pt-4 flex items-center justify-between mt-6">
        <Button
          type="button"
          variant="ghost"
          onClick={prevStep}
          disabled={step === 0}
          className="rounded-full px-4 text-foreground-secondary/70 disabled:opacity-30"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>

        <div className="flex gap-2">
          {step < stepsCount - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="rounded-full bg-accent px-5 text-primary-foreground hover:bg-accent/90"
            >
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90 flex items-center gap-1.5"
            >
              {isSaving ? (
                "Saving..."
              ) : saveState === "saved" ? (
                <>
                  Saved <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Save Profile <Save className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      {saveState === "error" && (
        <p className="text-right text-xs text-destructive mt-2">could not save. try again.</p>
      )}
    </div>
  );
}
