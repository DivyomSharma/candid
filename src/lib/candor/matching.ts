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

export function buildPublicProfile(memory: CandorMemory, userId = "candor"): PublicCandorProfile {
  const values = memory.values.slice(0, 3);
  const needs = memory.communicationNeeds.slice(0, 2);
  const appreciates = memory.appreciatesInPeople.slice(0, 2);
  const themes = memory.lifeThemes.slice(0, 2);
  const username = usernameFrom(userId, memory);
  const title = titleFrom(memory);
  const about = aboutFrom(memory);

  return {
    username,
    handle: `@${username.toLowerCase().replace(/\s+/g, ".")}`,
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
  return `candor sees a possible align around ${value}, with room for ${need}.`;
}

function titleFrom(memory: CandorMemory) {
  const value = memory.values[0];
  const theme = memory.lifeThemes[0];
  if (value && theme) return `someone who carries ${value} through ${theme}`;
  if (value) return `someone who cares about ${value}`;
  if (theme) return `someone shaped by ${theme}`;
  return "someone still being understood";
}

function aboutFrom(memory: CandorMemory) {
  const need = memory.communicationNeeds[0];
  const softSpot = memory.softSpots[0];
  if (need && softSpot) return `they may open slowly, especially around ${softSpot}, but ${need} helps.`;
  if (need) return `they seem to open best with ${need}.`;
  if (softSpot) return `there is tenderness around ${softSpot}.`;
  return "candor is still learning the shape of them.";
}

function oneLineFrom(memory: CandorMemory) {
  const value = memory.values[0];
  const need = memory.communicationNeeds[0];
  if (value && need) return `moves toward ${value}, opens with ${need}.`;
  if (value) return `seems to care about ${value}.`;
  if (need) return `opens best with ${need}.`;
  return "someone candor is still understanding.";
}

function storySignalFrom(memory: CandorMemory) {
  const theme = memory.lifeThemes[0];
  const value = memory.values[0];
  if (theme && value) return `probably drawn to stories where ${value} has to survive ${theme}.`;
  if (theme) return `probably drawn to stories shaped by ${theme}.`;
  return "probably drawn to quiet stories where small choices reveal people.";
}

function situationFrom(memory: CandorMemory): PublicCandorProfile["situation"] {
  const need = memory.communicationNeeds[0] ?? "gentle directness";
  const softSpot = memory.softSpots[0] ?? "being misunderstood";

  return {
    title: "when the tone shifts",
    setup: "something feels different, but no one has said the real thing yet.",
    response: `they may wait, read the room, then open better with ${need}. if it touches ${softSpot}, they might need a little time.`,
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
