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
    socialPreferences: [],
    lifestylePreferences: [],
    seenScenarios: [],
    answeredSignals: {},
    profileV4: createEmptyProfileV4(),
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
    socialPreferences: cleanList(input.socialPreferences),
    lifestylePreferences: cleanList(input.lifestylePreferences),
    seenScenarios: cleanList(input.seenScenarios, 40),
    answeredSignals: input.answeredSignals && typeof input.answeredSignals === "object" ? (input.answeredSignals as Record<string, string>) : {},
    profileV4: normalizeProfileV4(input.profileV4),
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
    socialPreferences: mergeList(existing.socialPreferences, incoming.socialPreferences),
    lifestylePreferences: mergeList(existing.lifestylePreferences, incoming.lifestylePreferences),
    seenScenarios: mergeList(existing.seenScenarios, incoming.seenScenarios, 40),
    answeredSignals: { ...existing.answeredSignals, ...incoming.answeredSignals },
    profileV4: mergeProfileV4(existing.profileV4, incoming.profileV4),
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
    merged.appreciatesInPeople.length +
    merged.socialPreferences.length +
    merged.lifestylePreferences.length;

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
  const updated = {
    ...memory,
    turnCount: memory.turnCount + 1,
    lastModes: [...memory.lastModes, input.mode].slice(-6),
    recentStructures: [...memory.recentStructures, input.structure].slice(-6),
    responseHistory: [...memory.responseHistory, normalizeReply(input.reply)].slice(-MAX_RESPONSES),
    suppressedPhrases: buildSuppressedPhrases([...memory.responseHistory, input.reply]),
    presenceState: input.presenceState,
  };

  if (updated.profileV4) {
    updated.profileV4.badges = calculateBadgeConfidences(updated);
  }

  return updated;
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
      ...profile,
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

  if (/\b(introvert|crowd|crowds|overwhelmed|social battery|too many people)\b/.test(text)) {
    memory.socialPreferences = ["needs recovery after too much social noise"];
  }

  if (/\b(texting|text back|replying|replies|double text|left on seen)\b/.test(text)) {
    memory.socialPreferences = ["texting rhythm means more than they admit"];
  }

  if (/\b(smoke|smoking|cigarette|cigarettes|vape|vaping)\b/.test(text)) {
    memory.lifestylePreferences = ["has a real opinion about smoking"];
  }

  if (/\b(drink|drinking|alcohol|sober|party|clubbing|rave)\b/.test(text)) {
    memory.lifestylePreferences = ["their relationship to nightlife matters"];
  }

  if (/\b(late night|3am|night owl|sleep schedule|insomnia|sleep)\b/.test(text)) {
    memory.lifestylePreferences = ["more awake at night than they pretend"];
  }

  if (/\b(travel|trip|vacation|airport|road trip)\b/.test(text)) {
    memory.lifestylePreferences = ["cares how travel feels, not just where it goes"];
  }

  if (/\b(gym|workout|run|fitness|lifting|pilates|training)\b/.test(text)) {
    memory.lifestylePreferences = ["feels steadier with some movement in the week"];
  }

  if (/\b(casual|commitment|serious relationship|long term|dating)\b/.test(text)) {
    memory.socialPreferences = ["wants clearer relationship intentions than surface talk suggests"];
  }

  return memory;
}

export function buildTraitCluster(memory: CandorMemory) {
  const parts = [
    memory.values[0],
    memory.lifeThemes[0],
    memory.communicationNeeds[0],
    memory.socialPreferences[0],
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
    interestSignals: {},
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
    interestSignals: normalizeInterestSignals(input?.interestSignals),
  };
}

function mergeInteractionProfiles(existing: CandorInteractionProfile, incoming?: Partial<CandorInteractionProfile>) {
  return {
    choicePatterns: mergeList(existing.choicePatterns, incoming?.choicePatterns, 20),
    acceptedInsightTypes: mergeList(existing.acceptedInsightTypes, incoming?.acceptedInsightTypes, 20),
    rejectedInsightTypes: mergeList(existing.rejectedInsightTypes, incoming?.rejectedInsightTypes, 20),
    engagementSignals: mergeList(existing.engagementSignals, incoming?.engagementSignals, 20),
    interestSignals: mergeInterestSignals(existing.interestSignals, incoming?.interestSignals),
  };
}

export function topInterestTopics(memory: CandorMemory, count = 4) {
  return Object.entries(memory.interactionProfile.interestSignals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([topic]) => topic);
}

export function interestLevelMap(memory: CandorMemory) {
  return Object.fromEntries(
    Object.entries(memory.interactionProfile.interestSignals).map(([topic, score]) => [
      topic,
      score >= 6 ? "very_high" : score >= 4 ? "high" : score >= 2 ? "medium" : "low",
    ]),
  );
}

export function addInterestSignals(memory: CandorMemory, interests: Record<string, number>) {
  return {
    ...memory,
    interactionProfile: {
      ...memory.interactionProfile,
      interestSignals: mergeInterestSignals(memory.interactionProfile.interestSignals, interests),
    },
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
        item === "silence" ||
        item === "playful",
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

function normalizeInterestSignals(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, number] => typeof entry[0] === "string" && typeof entry[1] === "number")
      .map(([topic, score]) => [topic.trim().toLowerCase(), Math.max(0, Math.min(9, Math.round(score)))])
      .filter(([topic]) => Boolean(topic)),
  );
}

function mergeInterestSignals(current: Record<string, number>, incoming: unknown) {
  const normalized = normalizeInterestSignals(incoming) as Record<string, number>;
  const merged = new Map<string, number>(Object.entries(current));

  for (const [topic, score] of Object.entries(normalized)) {
    merged.set(topic, Math.min(9, (merged.get(topic) ?? 0) + score));
  }

  return Object.fromEntries(
    [...merged.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12),
  );
}

import type { CandorProfileV4, CandorBadge } from "@/lib/candor/types";

export const BEHAVIORAL_BADGES = [
  { label: "Builder", keywords: ["founder", "startup", "developer", "programmer", "coding", "engineer", "build", "builder"] },
  { label: "Film Brain", keywords: ["movie", "movies", "film", "films", "cinema", "director", "letterboxd"] },
  { label: "Playlist Sharer", keywords: ["music", "album", "song", "songs", "playlist", "spotify"] },
  { label: "Reader", keywords: ["book", "books", "reading", "read", "novel", "literature", "author"] },
  { label: "Daydreamer", keywords: ["dreamer", "daydreaming", "daydream", "zoning out", "wandering mind", "lost in thought"] },
  { label: "Explorer", keywords: ["travel", "exploring", "hike", "hiking", "outdoors", "mountains", "adventure"] },
  { label: "Designer", keywords: ["designer", "design", "artist", "ui", "ux", "typeface", "typography", "branding"] },
  { label: "Observer", keywords: ["photography", "observer", "taking photos", "noticing details", "people watching"] },
  { label: "Writer", keywords: ["writer", "writing", "write", "poetry", "poet", "journal", "journaling"] },
  { label: "Night Owl", keywords: ["night owl", "late night", "3am", "nocturnal", "sleep schedule", "insomnia"] },
  { label: "Wanderer", keywords: ["wanderer", "wandering", "wanderlust", "traveling", "exploring cities"] },
  { label: "Gamer", keywords: ["gamer", "gaming", "games", "playstation", "xbox", "nintendo", "rpg"] },
  { label: "Album Listener", keywords: ["vinyl", "record", "listening to albums", "full album", "album listener"] },
  { label: "Rain Person", keywords: ["rain", "rainy days", "pluviophile", "thunderstorms", "rain person"] },
  { label: "Midnight Snacker", keywords: ["midnight snack", "midnight snacker", "midnight food", "late night eating"] },
  { label: "Café Hopper", keywords: ["café", "cafe", "cafés", "coffee shop", "coffee shops", "café hopper"] },
  { label: "Curious Mind", keywords: ["curious", "curiosity", "learning", "rabbit holes", "research spirals", "obsessed with"] },
  { label: "Theater Kid", keywords: ["theater", "broadway", "acting", "drama", "musical", "plays"] },
  { label: "Runner", keywords: ["runner", "running", "jogging", "marathon", "movement"] },
  { label: "Plant Parent", keywords: ["plants", "plant parent", "gardening", "monstera", "houseplants"] }
];

export function calculateBadgeConfidences(memory: CandorMemory): CandorBadge[] {
  const textSource: string[] = [];

  if (memory.profileV4?.currently) {
    const cur = memory.profileV4.currently;
    if (cur.building) textSource.push("building: " + cur.building);
    if (cur.watching) textSource.push("watching: " + cur.watching);
    if (cur.reading) textSource.push("reading: " + cur.reading);
    if (cur.listening) textSource.push("listening: " + cur.listening);
    if (cur.thinking) textSource.push("thinking: " + cur.thinking);
  }

  if (memory.profileV4?.shelf) {
    memory.profileV4.shelf.forEach(item => {
      textSource.push(`${item.key}: ${item.value}`);
    });
  }

  if (memory.profileV4?.smallThings) {
    textSource.push(...memory.profileV4.smallThings);
  }

  if (memory.profileV4?.tonight) {
    textSource.push(...memory.profileV4.tonight);
  }

  textSource.push(...(memory.values || []));
  textSource.push(...(memory.softSpots || []));
  textSource.push(...(memory.lifeThemes || []));
  textSource.push(...(memory.relationalPatterns || []));
  textSource.push(...(memory.communicationNeeds || []));
  textSource.push(...(memory.appreciatesInPeople || []));
  textSource.push(...(memory.socialPreferences || []));
  textSource.push(...(memory.lifestylePreferences || []));
  textSource.push(...(memory.notes || []));

  if (memory.profileV4?.socialLinks) {
    Object.keys(memory.profileV4.socialLinks).forEach(key => {
      textSource.push(`sociallink: ${key}`);
    });
  }

  const interestSignals = memory.interactionProfile?.interestSignals || {};
  const fullText = textSource.join(" ").toLowerCase();

  const existingBadgesMap = new Map<string, CandorBadge>();
  if (memory.profileV4?.badges) {
    memory.profileV4.badges.forEach((b: CandorBadge | string) => {
      const label = (typeof b === "string" ? b : b.label).trim();
      const normLabel = label.replace(/[^\w\s]/g, "").trim().toLowerCase();
      
      const badgeObj = typeof b === "string" ? {
        label,
        confidence: 0.95,
        source: "confirmed" as const
      } : {
        label: b.label,
        confidence: typeof b.confidence === "number" ? b.confidence : 0.95,
        source: (b.source === "confirmed" ? "confirmed" : "inferred") as "confirmed" | "inferred"
      };
      
      existingBadgesMap.set(normLabel, badgeObj);
    });
  }

  const result: CandorBadge[] = [];

  for (const bInfo of BEHAVIORAL_BADGES) {
    const label = bInfo.label;
    const cleanLabel = label.replace(/[^\w\s]/g, "").trim().toLowerCase();
    
    const existing = existingBadgesMap.get(cleanLabel);
    if (existing && existing.source === "confirmed") {
      result.push({
        label: existing.label,
        confidence: 1.0,
        source: "confirmed"
      });
      continue;
    }

    let score = 0.0;
    let keywordMatches = 0;
    for (const kw of bInfo.keywords) {
      if (fullText.includes(kw)) {
        keywordMatches += 1;
      }
    }
    
    if (keywordMatches > 0) {
      score += Math.min(0.5, keywordMatches * 0.15);
    }

    if (cleanLabel === "builder") {
      if (memory.profileV4?.currently?.building) score += 0.45;
      if (fullText.includes("founder") || fullText.includes("developer")) score += 0.35;
      if (interestSignals["startups"] >= 3) score += 0.25;
    } else if (cleanLabel === "film brain") {
      if (memory.profileV4?.currently?.watching) score += 0.45;
      if (fullText.includes("letterboxd") || fullText.includes("favorite movie") || fullText.includes("before sunrise")) score += 0.35;
      if (interestSignals["movies"] >= 3) score += 0.25;
    } else if (cleanLabel === "playlist sharer") {
      if (memory.profileV4?.socialLinks?.spotify) score += 0.55;
      if (fullText.includes("playlist") || fullText.includes("spotify") || fullText.includes("favorite album")) score += 0.25;
      if (interestSignals["music"] >= 3) score += 0.25;
    } else if (cleanLabel === "reader") {
      if (memory.profileV4?.currently?.reading) score += 0.45;
      if (fullText.includes("favorite book") || fullText.includes("reading") || fullText.includes("norwegian wood")) score += 0.35;
      if (interestSignals["philosophy"] >= 2 || interestSignals["psychology"] >= 2) score += 0.15;
    } else if (cleanLabel === "explorer") {
      if (fullText.includes("travel") || fullText.includes("mountains") || fullText.includes("exploring")) score += 0.45;
    } else if (cleanLabel === "designer") {
      if (fullText.includes("designer") || fullText.includes("typefaces") || fullText.includes("branding")) score += 0.55;
      if (interestSignals["design"] >= 3) score += 0.35;
    } else if (cleanLabel === "night owl") {
      if (fullText.includes("night owl") || fullText.includes("late night") || fullText.includes("3am")) score += 0.55;
      if (memory.profileV4?.tonight?.includes("awake") || memory.profileV4?.tonight?.includes("night")) score += 0.35;
    } else if (cleanLabel === "gamer") {
      if (interestSignals["games"] >= 3) score += 0.55;
      if (fullText.includes("gamer") || fullText.includes("gaming") || fullText.includes("playstation") || fullText.includes("nintendo")) score += 0.35;
    } else if (cleanLabel === "caf hopper") {
      if (fullText.includes("café") || fullText.includes("cafe") || fullText.includes("coffee shop")) score += 0.55;
    } else if (cleanLabel === "curious mind") {
      if (fullText.includes("curiosity") || fullText.includes("rabbit hole") || fullText.includes("research spiral")) score += 0.55;
    }

    let finalConfidence = score;
    if (finalConfidence >= 0.85) {
      finalConfidence = 0.92;
    } else {
      finalConfidence = Math.max(0.10, Math.min(0.89, finalConfidence));
    }

    result.push({
      label: bInfo.label,
      confidence: parseFloat(finalConfidence.toFixed(2)),
      source: "inferred"
    });
  }

  for (const [normLabel, existing] of existingBadgesMap.entries()) {
    const isBehavioral = BEHAVIORAL_BADGES.some(b => b.label.replace(/[^\w\s]/g, "").trim().toLowerCase() === normLabel);
    if (!isBehavioral && existing.source === "confirmed") {
      result.push(existing);
    }
  }

  return result;
}

export function applyUserCorrections(message: string, memory: CandorMemory): CandorMemory {
  const text = message.toLowerCase().trim();
  const negations = [
    /\b(don't|dont|do not|never|no|not|hate|dislike)\b/,
    /\b(remove|delete|clear)\b/
  ];

  const hasNegation = negations.some(pattern => pattern.test(text));
  if (!hasNegation) return memory;

  const updated = { ...memory };
  if (updated.profileV4) {
    updated.profileV4 = {
      ...updated.profileV4,
      currently: { ...updated.profileV4.currently },
      openLoops: { ...updated.profileV4.openLoops },
      shelf: [...updated.profileV4.shelf],
      smallThings: [...updated.profileV4.smallThings],
      tonight: [...updated.profileV4.tonight],
      badges: [...updated.profileV4.badges],
    };
  }

  const originalBadges = updated.profileV4?.badges || [];
  const keptBadges: CandorBadge[] = [];

  for (const badge of originalBadges) {
    const label = badge.label.toLowerCase();
    const badgeWords = label.split(" ");
    let isNegated = false;

    if (text.includes(label)) {
      isNegated = true;
    } else if (badgeWords.some(w => w.length > 3 && text.includes(w))) {
      isNegated = true;
    }

    if (isNegated) {
      continue;
    }
    keptBadges.push(badge);
  }

  const cleanedBadges = keptBadges.filter(badge => {
    const label = badge.label.toLowerCase();
    if (text.includes("chai") && label.includes("chai")) return false;
    if (text.includes("coffee") && label.includes("coffee")) return false;
    if (text.includes("pizza") && label.includes("pizza")) return false;
    return true;
  });

  if (updated.profileV4) {
    updated.profileV4.badges = cleanedBadges;
  }

  const keywordsToClean: string[] = [];
  if (text.includes("chai")) keywordsToClean.push("chai");
  if (text.includes("coffee")) keywordsToClean.push("coffee");
  if (text.includes("pizza")) keywordsToClean.push("pizza");

  const removedLabels = originalBadges
    .filter(b => !cleanedBadges.includes(b))
    .map(b => b.label.toLowerCase());

  for (const label of removedLabels) {
    keywordsToClean.push(label);
    label.split(" ").forEach(w => {
      if (w.length > 3) keywordsToClean.push(w);
    });
  }

  if (keywordsToClean.length > 0) {
    const filterFn = (item: string) => {
      const lowerItem = item.toLowerCase();
      return !keywordsToClean.some(kw => lowerItem.includes(kw));
    };

    updated.values = updated.values.filter(filterFn);
    updated.softSpots = updated.softSpots.filter(filterFn);
    updated.lifeThemes = updated.lifeThemes.filter(filterFn);
    updated.relationalPatterns = updated.relationalPatterns.filter(filterFn);
    updated.communicationNeeds = updated.communicationNeeds.filter(filterFn);
    updated.appreciatesInPeople = updated.appreciatesInPeople.filter(filterFn);
    updated.socialPreferences = updated.socialPreferences.filter(filterFn);
    updated.lifestylePreferences = updated.lifestylePreferences.filter(filterFn);
    updated.notes = updated.notes.filter(filterFn);
  }

  return updated;
}

export function createEmptyProfileV4(): CandorProfileV4 {
  return {
    currently: {
      building: "candor app",
      watching: "past lives",
      reading: "norwegian wood",
      listening: "bon iver",
      thinking: "moving cities"
    },
    tonight: ["awake", "rain", "coding", "indie"],
    shelf: [
      { key: "favorite movie", value: "before sunrise" },
      { key: "favorite album", value: "for emma, forever ago" },
      { key: "favorite book", value: "the catcher in the rye" }
    ],
    openLoops: {
      thinkingAbout: "why nostalgia hurts",
      recommending: "before trilogy",
      defending: "movies should have intermissions"
    },
    smallThings: ["window seat", "voice notes", "late replies", "museum dates", "black coffee"],
    socialLinks: {
      instagram: "divyom.sharma",
      github: "divyomsharma"
    },
    photos: [
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600",
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?q=80&w=600"
    ],
    badges: [
      { label: "Night Owl", confidence: 0.91, source: "inferred" },
      { label: "Builder", confidence: 0.98, source: "confirmed" }
    ]
  };
}

export function normalizeBadge(badge: unknown): CandorBadge | null {
  if (!badge) return null;
  if (typeof badge === "string") {
    const label = badge.trim();
    const cleanLabel = label.toLowerCase();
    if (cleanLabel === "chai lover" || cleanLabel === "coffee addict" || cleanLabel === "pizza lover") {
      return { label, confidence: 0.31, source: "inferred" };
    }
    const isBehavioral = BEHAVIORAL_BADGES.some(b => b.label.replace(/[^\w\s]/g, "").trim().toLowerCase() === cleanLabel.replace(/[^\w\s]/g, "").trim().toLowerCase());
    return {
      label,
      confidence: 0.95,
      source: isBehavioral ? "inferred" : "confirmed"
    };
  }
  if (typeof badge === "object" && badge !== null && "label" in badge) {
    const b = badge as { label: unknown; confidence?: unknown; source?: unknown };
    if (typeof b.label === "string") {
      return {
        label: b.label,
        confidence: typeof b.confidence === "number" ? b.confidence : 0.5,
        source: b.source === "confirmed" ? "confirmed" : "inferred"
      };
    }
  }
  return null;
}

function normalizeProfileV4(value: unknown): CandorProfileV4 {
  const empty = createEmptyProfileV4();
  if (!value || typeof value !== "object") return empty;
  const val = value as Partial<CandorProfileV4>;
  
  const cur = (val.currently || {}) as Record<string, string>;
  const loops = (val.openLoops || {}) as Record<string, string>;

  return {
    currently: {
      building: typeof cur.building === "string" ? cur.building.trim() : empty.currently.building,
      watching: typeof cur.watching === "string" ? cur.watching.trim() : empty.currently.watching,
      reading: typeof cur.reading === "string" ? cur.reading.trim() : empty.currently.reading,
      listening: typeof cur.listening === "string" ? cur.listening.trim() : empty.currently.listening,
      thinking: typeof cur.thinking === "string" ? cur.thinking.trim() : empty.currently.thinking,
    },
    tonight: Array.isArray(val.tonight) ? val.tonight.map(x => String(x).trim()).filter(Boolean) : empty.tonight,
    shelf: Array.isArray(val.shelf) 
      ? val.shelf.map(x => ({ key: String(x?.key || ""), value: String(x?.value || "") })).filter(x => x.key && x.value) 
      : empty.shelf,
    openLoops: {
      thinkingAbout: typeof loops.thinkingAbout === "string" ? loops.thinkingAbout.trim() : empty.openLoops.thinkingAbout,
      recommending: typeof loops.recommending === "string" ? loops.recommending.trim() : empty.openLoops.recommending,
      defending: typeof loops.defending === "string" ? loops.defending.trim() : empty.openLoops.defending,
    },
    smallThings: Array.isArray(val.smallThings) ? val.smallThings.map(x => String(x).trim()).filter(Boolean) : empty.smallThings,
    socialLinks: val.socialLinks && typeof val.socialLinks === "object" 
      ? Object.fromEntries(Object.entries(val.socialLinks).map(([k, v]) => [String(k).trim().toLowerCase(), String(v).trim()]).filter(([k, v]) => k && v))
      : empty.socialLinks,
    photos: Array.isArray(val.photos) ? val.photos.map(x => String(x).trim()).filter(Boolean) : empty.photos,
    badges: Array.isArray(val.badges) ? val.badges.map(normalizeBadge).filter((x): x is CandorBadge => !!x) : empty.badges,
  };
}

function mergeProfileV4(existing: CandorProfileV4, incoming?: Partial<CandorProfileV4>): CandorProfileV4 {
  if (!incoming) return existing;
  const merged = { ...existing };
  if (incoming.currently) merged.currently = { ...existing.currently, ...incoming.currently };
  if (incoming.tonight) merged.tonight = incoming.tonight;
  if (incoming.shelf) merged.shelf = incoming.shelf;
  if (incoming.openLoops) merged.openLoops = { ...existing.openLoops, ...incoming.openLoops };
  if (incoming.smallThings) merged.smallThings = incoming.smallThings;
  if (incoming.socialLinks) merged.socialLinks = { ...existing.socialLinks, ...incoming.socialLinks };
  if (incoming.photos) merged.photos = incoming.photos;
  if (incoming.badges) {
    merged.badges = Array.isArray(incoming.badges) 
      ? incoming.badges.map(normalizeBadge).filter((x): x is CandorBadge => !!x)
      : existing.badges;
  }
  return merged;
}
