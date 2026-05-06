import type {
  CandorInteractionProfile,
  CandorMemory,
  CandorMode,
  CandorStructure,
  PresenceState,
} from "@/lib/candor/types";

const MAX_ITEMS = 12;
const MAX_RESPONSES = 6;
const MAX_SUPPRESSED = 8;

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
    presenceState: createDefaultPresenceState(),
    responseHistory: [],
    recentStructures: [],
    suppressedPhrases: [],
    interactionProfile: createEmptyInteractionProfile(),
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
    seenScenarios: cleanList(input.seenScenarios, 40),
    alignmentReady: Boolean(input.alignmentReady),
    notes: cleanList(input.notes, 20),
    presenceState: normalizePresenceState(input.presenceState),
    responseHistory: cleanResponses(input.responseHistory),
    recentStructures: cleanStructures(input.recentStructures),
    suppressedPhrases: cleanList(input.suppressedPhrases, MAX_SUPPRESSED),
    interactionProfile: normalizeInteractionProfile(input.interactionProfile),
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
    presenceState: normalizePresenceState(incoming.presenceState ?? existing.presenceState),
    responseHistory: cleanResponses(incoming.responseHistory ?? existing.responseHistory),
    recentStructures: cleanStructures(incoming.recentStructures ?? existing.recentStructures),
    suppressedPhrases: mergeList(existing.suppressedPhrases, incoming.suppressedPhrases, MAX_SUPPRESSED),
    interactionProfile: mergeInteractionProfiles(existing.interactionProfile, incoming.interactionProfile),
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

export function updateTurnMemory(
  memory: CandorMemory,
  input: {
    mode: CandorMode;
    structure: CandorStructure;
    reply: string;
    presenceState: PresenceState;
  },
) {
  return {
    ...memory,
    turnCount: memory.turnCount + 1,
    lastModes: [...memory.lastModes, input.mode].slice(-6),
    recentStructures: [...memory.recentStructures, input.structure].slice(-6),
    responseHistory: [...memory.responseHistory, normalizeReply(input.reply)].slice(-MAX_RESPONSES),
    suppressedPhrases: buildSuppressedPhrases([...memory.responseHistory, input.reply]),
    presenceState: input.presenceState,
  };
}

export function recordInteractionSignals(
  memory: CandorMemory,
  input: {
    choicePattern?: string | null;
    insightType?: string | null;
    accepted?: boolean | null;
    engagementSignal?: string | null;
  },
) {
  const profile = memory.interactionProfile;

  return {
    ...memory,
    interactionProfile: {
      choicePatterns: mergeList(profile.choicePatterns, input.choicePattern ? [input.choicePattern] : []),
      acceptedInsightTypes:
        input.accepted && input.insightType
          ? mergeList(profile.acceptedInsightTypes, [input.insightType])
          : profile.acceptedInsightTypes,
      rejectedInsightTypes:
        input.accepted === false && input.insightType
          ? mergeList(profile.rejectedInsightTypes, [input.insightType])
          : profile.rejectedInsightTypes,
      engagementSignals: mergeList(
        profile.engagementSignals,
        input.engagementSignal ? [input.engagementSignal] : [],
      ),
    },
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

export function buildTraitCluster(memory: CandorMemory) {
  const parts = [
    memory.values[0],
    memory.lifeThemes[0],
    memory.communicationNeeds[0],
    memory.softSpots[0],
  ]
    .filter(Boolean)
    .slice(0, 3);

  return parts.length ? parts.join(" | ") : "emerging";
}

function createDefaultPresenceState(): PresenceState {
  return {
    clarity: "low",
    curiosity: "medium",
    resonance: "low",
  };
}

function createEmptyInteractionProfile(): CandorInteractionProfile {
  return {
    choicePatterns: [],
    acceptedInsightTypes: [],
    rejectedInsightTypes: [],
    engagementSignals: [],
  };
}

function normalizePresenceState(value: unknown): PresenceState {
  const input = value as Partial<PresenceState> | undefined;

  return {
    clarity: level(input?.clarity),
    curiosity: level(input?.curiosity, "medium"),
    resonance: level(input?.resonance),
  };
}

function normalizeInteractionProfile(value: unknown): CandorInteractionProfile {
  const input = value as Partial<CandorInteractionProfile> | undefined;
  const empty = createEmptyInteractionProfile();

  return {
    choicePatterns: cleanList(input?.choicePatterns, 20) || empty.choicePatterns,
    acceptedInsightTypes: cleanList(input?.acceptedInsightTypes, 20) || empty.acceptedInsightTypes,
    rejectedInsightTypes: cleanList(input?.rejectedInsightTypes, 20) || empty.rejectedInsightTypes,
    engagementSignals: cleanList(input?.engagementSignals, 20) || empty.engagementSignals,
  };
}

function mergeInteractionProfiles(existing: CandorInteractionProfile, incoming?: Partial<CandorInteractionProfile>) {
  return {
    choicePatterns: mergeList(existing.choicePatterns, incoming?.choicePatterns, 20),
    acceptedInsightTypes: mergeList(existing.acceptedInsightTypes, incoming?.acceptedInsightTypes, 20),
    rejectedInsightTypes: mergeList(existing.rejectedInsightTypes, incoming?.rejectedInsightTypes, 20),
    engagementSignals: mergeList(existing.engagementSignals, incoming?.engagementSignals, 20),
  };
}

function cleanResponses(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map(normalizeReply)
    .filter(Boolean)
    .slice(-MAX_RESPONSES);
}

function cleanStructures(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is CandorStructure =>
        item === "fragment" ||
        item === "observation" ||
        item === "contrast" ||
        item === "question" ||
        item === "silence",
    )
    .slice(-6);
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

function buildSuppressedPhrases(responses: string[]) {
  return Array.from(
    new Set(
      responses
        .slice(-4)
        .flatMap((reply) => {
          const line = normalizeReply(reply);
          const words = line.split(/\s+/).filter(Boolean);
          const openings = [words.slice(0, 2).join(" "), words.slice(0, 3).join(" ")].filter(Boolean);
          const pauses = ["hmm...", "yeah...", "maybe..."].filter((pause) => line.includes(pause));
          return [...openings, ...pauses];
        })
        .filter(Boolean),
    ),
  ).slice(-MAX_SUPPRESSED);
}

function normalizeReply(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 180);
}

function level(value: unknown, fallback: PresenceState["clarity"] = "low"): PresenceState["clarity"] {
  return value === "low" || value === "medium" || value === "high" ? value : fallback;
}
