import type { CandorMemory } from "@/lib/candor/types";

export type PublicCandorProfile = {
  title: string;
  about: string;
  values: string[];
  conversation: string[];
};

export function buildPublicProfile(memory: CandorMemory): PublicCandorProfile {
  const values = memory.values.slice(0, 3);
  const needs = memory.communicationNeeds.slice(0, 2);
  const appreciates = memory.appreciatesInPeople.slice(0, 2);
  const themes = memory.lifeThemes.slice(0, 2);

  return {
    title: titleFrom(memory),
    about: aboutFrom(memory),
    values: fallback(values, ["honesty", "emotional safety"]),
    conversation: fallback(
      [
        ...needs.map((need) => `opens better with ${need}`),
        ...appreciates.map((item) => `notices ${item}`),
        ...themes.map((theme) => `has been shaped by ${theme}`),
      ],
      ["likes conversations that move slowly"],
    ).slice(0, 4),
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
