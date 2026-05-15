import type { CandorMemory } from "@/lib/candor/types";

export type PublicCandorProfile = {
  username: string;
  handle: string;
  avatarInitials: string;
  avatarTone: string;
  line: string;
  title: string;
  about: string;
  values: string[];
  conversation: string[];
  storySignal: string;
  situation: {
    title: string;
    setup: string;
    response: string;
  };
};

export type AlignmentResonance =
  | "familiar"
  | "shared rhythm"
  | "natural flow"
  | "strong resonance"
  | "rare alignment";

export function buildPublicProfile(
  memory: CandorMemory,
  userId = "candor",
  identity?: { username?: string | null; handle?: string | null },
): PublicCandorProfile {
  const values = memory.values.slice(0, 3);
  const needs = memory.communicationNeeds.slice(0, 2);
  const appreciates = memory.appreciatesInPeople.slice(0, 2);
  const themes = memory.lifeThemes.slice(0, 2);
  const username = identity?.username?.trim() || usernameFrom(userId, memory);
  const title = titleFrom(memory);
  const about = aboutFrom(memory);

  return {
    username,
    handle: identity?.handle?.trim() || `@${username.toLowerCase().replace(/\s+/g, ".")}`,
    avatarInitials: initialsFrom(username),
    avatarTone: avatarToneFrom(userId),
    line: oneLineFrom(memory),
    title,
    about,
    values: fallback(values, ["honesty", "emotional safety"]),
    conversation: fallback(
      [
        ...needs.map((need) => `opens better with ${need}`),
        ...appreciates.map((item) => `notices ${item}`),
        ...themes.map((theme) => `has been shaped by ${theme}`),
      ],
      ["likes conversations that move slowly"],
    ).slice(0, 4),
    storySignal: storySignalFrom(memory),
    situation: situationFrom(memory),
  };
}

export function alignmentScore(a: CandorMemory, b: CandorMemory) {
  const sharedValues = overlap(a.values, b.values);
  const sharedThemes = overlap(a.lifeThemes, b.lifeThemes);
  const communicationFit = overlap(a.communicationNeeds, b.appreciatesInPeople) + overlap(b.communicationNeeds, a.appreciatesInPeople);
  const softnessFit = overlap(a.softSpots, b.communicationNeeds) + overlap(b.softSpots, a.communicationNeeds);
  return sharedValues * 4 + sharedThemes * 2 + communicationFit * 2 + softnessFit + 1;
}

export function alignmentLanguage(memory: CandorMemory, other: CandorMemory) {
  const value = shared(aList(memory.values), aList(other.values)) ?? memory.values[0] ?? "something real";
  const need = memory.communicationNeeds[0] ?? other.appreciatesInPeople[0] ?? "gentle honesty";
  return `this could feel easy around ${value}. ${need} may make the conversation open naturally.`;
}

export function resonanceLabel(score: number): AlignmentResonance {
  if (score >= 13) return "rare alignment";
  if (score >= 10) return "strong resonance";
  if (score >= 7) return "natural flow";
  if (score >= 5) return "shared rhythm";
  return "familiar";
}

function titleFrom(memory: CandorMemory) {
  const value = memory.values[0];
  const theme = memory.lifeThemes[0];
  if (value && theme) return `more at home in honest conversations than surface ones`;
  if (value) return `seems guided by ${value}`;
  if (theme) return `has been shaped by ${theme}`;
  return "still being understood";
}

function aboutFrom(memory: CandorMemory) {
  const need = memory.communicationNeeds[0];
  const softSpot = memory.softSpots[0];
  if (need && softSpot) return `seems to settle more with ${need}, especially when ${softSpot} is nearby.`;
  if (need) return `opens more easily with ${need}.`;
  if (softSpot) return `that sensitive spot around ${softSpot} still seems to matter.`;
  return "candor is still learning about them.";
}

function oneLineFrom(memory: CandorMemory) {
  const value = memory.values[0];
  const need = memory.communicationNeeds[0];
  if (value && need) return `seems more comfortable with ${value} than performance, and opens better with ${need}.`;
  if (value) return `seems drawn to ${value} over surface talk.`;
  if (need) return `opens better with ${need}.`;
  return "candor is still learning about them.";
}

function storySignalFrom(memory: CandorMemory) {
  const theme = memory.lifeThemes[0];
  const value = memory.values[0];
  if (theme && value) return `may like stories about ${value} and ${theme}.`;
  if (theme) return `may like stories about ${theme}.`;
  return "may like quiet stories about small choices.";
}

function situationFrom(memory: CandorMemory): PublicCandorProfile["situation"] {
  const need = memory.communicationNeeds[0] ?? "gentle directness";
  const softSpot = memory.softSpots[0] ?? "being misunderstood";

  return {
    title: "when the mood changes",
    setup: "something feels different, but no one has said why.",
    response: `they may pause first. ${need} helps. if it touches ${softSpot}, they may need time.`,
  };
}

function usernameFrom(userId: string, memory: CandorMemory) {
  const seed = memory.values[0] ?? memory.lifeThemes[0] ?? userId;
  const clean = seed.replace(/[^a-z0-9 ]/gi, " ").trim();
  if (clean) return titleCase(clean).split(" ").slice(0, 2).join(" ");
  return `Candor ${userId.slice(0, 4).toUpperCase()}`;
}

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";
}

function avatarToneFrom(userId: string) {
  const tones = [
    "linear-gradient(135deg, hsl(var(--accent) / 0.38), hsl(var(--surface-secondary)))",
    "linear-gradient(135deg, hsl(var(--glow) / 0.28), hsl(var(--background)))",
    "linear-gradient(135deg, hsl(var(--foreground) / 0.14), hsl(var(--accent) / 0.30))",
  ];
  const index = userId.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % tones.length;
  return tones[index];
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function overlap(a: string[], b: string[]) {
  const bSet = new Set(b);
  return a.filter((item) => bSet.has(item)).length;
}

function shared(a: string[], b: string[]) {
  const bSet = new Set(b);
  return a.find((item) => bSet.has(item));
}

function aList(items: string[]) {
  return items.map((item) => item.toLowerCase());
}

function fallback(items: string[], backup: string[]) {
  return items.length ? items : backup;
}
