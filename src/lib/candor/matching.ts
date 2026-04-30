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
  return `you may connect around ${value}. ${need} may help the conversation.`;
}

function titleFrom(memory: CandorMemory) {
  const value = memory.values[0];
  const theme = memory.lifeThemes[0];
  if (value && theme) return `cares about ${value} and has dealt with ${theme}`;
  if (value) return `cares about ${value}`;
  if (theme) return `has dealt with ${theme}`;
  return "still being understood";
}

function aboutFrom(memory: CandorMemory) {
  const need = memory.communicationNeeds[0];
  const softSpot = memory.softSpots[0];
  if (need && softSpot) return `they may take time to open up, especially around ${softSpot}. ${need} helps.`;
  if (need) return `they open up more with ${need}.`;
  if (softSpot) return `they may feel hurt around ${softSpot}.`;
  return "candor is still learning about them.";
}

function oneLineFrom(memory: CandorMemory) {
  const value = memory.values[0];
  const need = memory.communicationNeeds[0];
  if (value && need) return `cares about ${value}. opens up with ${need}.`;
  if (value) return `cares about ${value}.`;
  if (need) return `opens up with ${need}.`;
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
