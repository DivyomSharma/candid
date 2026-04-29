import type { CandorMemory } from "@/lib/candor/types";

const MAX_ITEMS = 12;

export function createEmptyMemory(): CandorMemory {
  return {
    turnCount: 0,
    lastModes: [],
    values: [],
    softSpots: [],
    lifeThemes: [],
    relationalPatterns: [],
    communicationNeeds: [],
    appreciatesInPeople: [],
    seenScenarios: [],
    alignmentReady: false,
    notes: [],
  };
}

export function normalizeMemory(value: unknown): CandorMemory {
  if (!value || typeof value !== "object") return createEmptyMemory();

  const input = value as Partial<CandorMemory>;
  const empty = createEmptyMemory();

  return {
    turnCount: typeof input.turnCount === "number" ? input.turnCount : empty.turnCount,
    lastModes: Array.isArray(input.lastModes) ? input.lastModes.slice(-6) : empty.lastModes,
    values: cleanList(input.values),
    softSpots: cleanList(input.softSpots),
    lifeThemes: cleanList(input.lifeThemes),
    relationalPatterns: cleanList(input.relationalPatterns),
    communicationNeeds: cleanList(input.communicationNeeds),
    appreciatesInPeople: cleanList(input.appreciatesInPeople),
    seenScenarios: cleanList(input.seenScenarios),
    alignmentReady: Boolean(input.alignmentReady),
    notes: cleanList(input.notes),
  };
}

export function mergeMemory(existing: CandorMemory, incoming: Partial<CandorMemory>): CandorMemory {
  const merged: CandorMemory = {
    ...existing,
    values: mergeList(existing.values, incoming.values),
    softSpots: mergeList(existing.softSpots, incoming.softSpots),
    lifeThemes: mergeList(existing.lifeThemes, incoming.lifeThemes),
    relationalPatterns: mergeList(existing.relationalPatterns, incoming.relationalPatterns),
    communicationNeeds: mergeList(existing.communicationNeeds, incoming.communicationNeeds),
    appreciatesInPeople: mergeList(existing.appreciatesInPeople, incoming.appreciatesInPeople),
    seenScenarios: mergeList(existing.seenScenarios, incoming.seenScenarios, 40),
    notes: mergeList(existing.notes, incoming.notes, 20),
  };

  const knownSignals =
    merged.values.length +
    merged.softSpots.length +
    merged.lifeThemes.length +
    merged.relationalPatterns.length +
    merged.communicationNeeds.length +
    merged.appreciatesInPeople.length;

  merged.alignmentReady = knownSignals >= 10 && merged.values.length >= 2 && merged.turnCount >= 8;

  return merged;
}

export function updateTurnMemory(memory: CandorMemory, mode: CandorMemory["lastModes"][number]) {
  return {
    ...memory,
    turnCount: memory.turnCount + 1,
    lastModes: [...memory.lastModes, mode].slice(-6),
  };
}

export function extractLightMemory(message: string): Partial<CandorMemory> {
  const text = message.toLowerCase();
  const memory: Partial<CandorMemory> = {};

  if (/\b(family|mom|mother|dad|father|parents|sibling|brother|sister)\b/.test(text)) {
    memory.lifeThemes = ["family"];
  }

  if (/\b(work|career|job|boss|study|college|school|future|money)\b/.test(text)) {
    memory.lifeThemes = ["career pressure"];
  }

  if (/\b(friend|friends|best friend|group|people)\b/.test(text)) {
    memory.lifeThemes = ["friendships"];
  }

  if (/\b(honest|truth|lie|lied|real|transparent)\b/.test(text)) {
    memory.values = ["honesty"];
  }

  if (/\b(safe|comfort|secure|gentle|soft)\b/.test(text)) {
    memory.values = ["emotional safety"];
  }

  if (/\b(ignore|ignored|unseen|noticed|notice|chosen|priority)\b/.test(text)) {
    memory.softSpots = ["feeling unseen"];
  }

  if (/\b(left|leave|abandon|disappear|ghost)\b/.test(text)) {
    memory.softSpots = ["people leaving without clarity"];
  }

  if (/\b(i don't say|i didnt say|i stay quiet|i keep it|i hide)\b/.test(text)) {
    memory.relationalPatterns = ["holds back before asking directly"];
    memory.communicationNeeds = ["gentle directness"];
  }

  if (/\b(consistency|show up|effort|try|follow through)\b/.test(text)) {
    memory.appreciatesInPeople = ["follow-through"];
  }

  return memory;
}

function cleanList(value: unknown, max = MAX_ITEMS) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, max);
}

function mergeList(current: string[], incoming: unknown, max = MAX_ITEMS) {
  return cleanList([...current, ...cleanList(incoming, max)], max);
}
