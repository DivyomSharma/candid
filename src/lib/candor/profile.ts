import { interestLevelMap, topInterestTopics } from "@/lib/candor/memory";
import type { CandorMemory } from "@/lib/candor/types";

export type CandorProfilePresentation = {
  username: string;
  handle: string;
  initials: string;
  publicPath: string;
  bannerTone: string;
  bio: string;
  coreIdentity: {
    lines: string[];
    fragments: string[];
    note: string;
  };
  understandingDepth: {
    phase: "spark" | "rhythm" | "patterns" | "nuance" | "continuity" | "resonance";
    line: string;
  };
  whatCandorNotices: string[];
  relationalSections: Array<{ title: string; items: string[] }>;
  conversationalThemes: string[];
  interests: string[];
  socialPreferences: string[];
  lifestylePreferences: string[];
  resonanceIndicators: string[];
  alignmentStyle: string;
  observations: Array<{ label: string; value: string; meter: number }>;
  shareCards: Array<{
    kind: "story" | "post" | "x" | "banner";
    title: string;
    lines: string[];
  }>;
};

export function buildCandorProfilePresentation(input: {
  memory: CandorMemory | null;
  username?: string | null;
  handle?: string | null;
  email?: string | null;
}) : CandorProfilePresentation {
  const { memory, email } = input;
  const baseName = input.username?.trim() || email?.split("@")[0]?.replace(/[._-]+/g, " ") || "someone";
  const username = titleCase(baseName);
  const rawHandle = input.handle?.trim() || `@${slugify(baseName)}`;
  const handle = rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
  const safeHandle = handle.replace(/^@/, "");

  const values = fallback(memory?.values, ["honesty"]);
  const needs = fallback(memory?.communicationNeeds, ["gentle directness"]);
  const softSpots = fallback(memory?.softSpots, ["feeling unseen"]);
  const interests = topInterestTopics(memory ?? emptyMemoryStub(), 5);
  const socialPreferences = fallback(memory?.socialPreferences, derivedSocialPreferences(memory));
  const lifestylePreferences = fallback(memory?.lifestylePreferences, derivedLifestylePreferences(memory, interests));
  const themes = dedupe([
    ...interests.map(themeLabel),
    ...fallback(memory?.lifeThemes, []),
    ...fallback(memory?.relationalPatterns, []),
  ]).slice(0, 5);
  const notices = buildNotices(memory, values, needs, interests);
  const resonanceIndicators = buildResonance(memory, socialPreferences, interests);
  const interestLevels = interestLevelMap(memory ?? emptyMemoryStub());
  const alignmentStyle = buildAlignmentStyle(values[0], needs[0], socialPreferences[0], interests[0]);
  const understandingDepth = buildUnderstandingDepth(memory);
  const coreIdentity = buildCoreIdentity({
    username,
    handle,
    values,
    needs,
    interests,
    socialPreferences,
    lifestylePreferences,
    turns: memory?.turnCount ?? 0,
  });

  return {
    username,
    handle,
    initials: initialsFrom(username),
    publicPath: `/u/${safeHandle}`,
    bannerTone: bannerFrom(values[0]),
    bio:
      memory && memory.turnCount >= 3
        ? `candor reads a mix of ${values[0]}, ${themeLabel(interests[0] ?? themes[0] ?? "quiet intensity")}, and ${softPhrase(needs[0])}.`
        : "candor is still reading the shape of this person.",
    coreIdentity,
    understandingDepth,
    whatCandorNotices: notices,
    relationalSections: buildRelationalSections({
      memory,
      interests,
      socialPreferences,
      lifestylePreferences,
      needs,
      values,
      resonanceIndicators,
    }),
    conversationalThemes: themes.length ? themes : ["the pattern is still forming"],
    interests: interests.length ? interests.map(themeLabel) : ["films that stay with you", "internet rabbit holes"],
    socialPreferences: socialPreferences.slice(0, 4),
    lifestylePreferences: lifestylePreferences.slice(0, 4),
    resonanceIndicators,
    alignmentStyle,
    observations: [
      {
        label: "conversational energy",
        value: interests[0] ? `${themeLabel(interests[0])} comes alive quickly` : "still warming up",
        meter: clamp(Object.keys(interestLevels).length * 15 + 24, 24, 96),
      },
      {
        label: "social pace",
        value: socialPreferences[0] ?? "still learning their pace",
        meter: clamp((memory?.socialPreferences.length ?? 0) * 16 + 20, 22, 92),
      },
      {
        label: "alignment style",
        value: alignmentStyle,
        meter: clamp((memory?.turnCount ?? 0) * 8 + 18, 18, 94),
      },
    ],
    shareCards: buildShareCards({ username, values, interests, socialPreferences, needs, resonanceIndicators }),
  };
}

function buildUnderstandingDepth(memory: CandorMemory | null): CandorProfilePresentation["understandingDepth"] {
  const turns = memory?.turnCount ?? 0;
  const signalCount =
    (memory?.values.length ?? 0) +
    (memory?.communicationNeeds.length ?? 0) +
    (memory?.socialPreferences.length ?? 0) +
    Object.keys(memory?.interactionProfile.interestSignals ?? {}).length;

  if (turns >= 18 && signalCount >= 10) return { phase: "resonance", line: "your continuity feels stronger lately" };
  if (turns >= 12) return { phase: "continuity", line: "candor is carrying more of the thread now" };
  if (turns >= 8 || signalCount >= 7) return { phase: "nuance", line: "the social shape is getting more nuanced" };
  if (turns >= 5 || signalCount >= 4) return { phase: "patterns", line: "patterns are becoming clearer" };
  if (turns >= 2 || signalCount >= 2) return { phase: "rhythm", line: "candor is beginning to understand your rhythm" };
  return { phase: "spark", line: "the first signal is forming" };
}

function buildCoreIdentity(input: {
  username: string;
  handle: string;
  values: string[];
  needs: string[];
  interests: string[];
  socialPreferences: string[];
  lifestylePreferences: string[];
  turns: number;
}) {
  const fragments = dedupe([
    fragmentFromSocial(input.socialPreferences[0]),
    fragmentFromLifestyle(input.lifestylePreferences[0]),
    fragmentFromInterest(input.interests[0]),
    fragmentFromNeed(input.needs[0]),
    fragmentFromValue(input.values[0]),
  ]).slice(0, 3);

  return {
    lines: [input.handle, input.username],
    fragments: fragments.length ? fragments : ["still unfolding in conversation"],
    note:
      input.turns >= 3
        ? "the rest gets learned sideways, in actual conversation."
        : "candor keeps this light at first. the rest gets learned in conversation.",
  };
}

function buildRelationalSections(input: {
  memory: CandorMemory | null;
  interests: string[];
  socialPreferences: string[];
  lifestylePreferences: string[];
  needs: string[];
  values: string[];
  resonanceIndicators: string[];
}) {
  const { memory, interests, socialPreferences, lifestylePreferences, needs, values, resonanceIndicators } = input;
  const firstInterest = interests[0] ? themeLabel(interests[0]) : "topics with a little emotional charge";
  const need = needs[0] ?? "gentle directness";
  const preference = socialPreferences[0] ?? "texting rhythm probably matters";

  return [
    { title: "conversational atmosphere", items: [resonanceIndicators[0] ?? "conversation may feel unusually natural", `opens better around ${softPhrase(need)}`] },
    { title: "social energy", items: [preference, memory?.interactionProfile.engagementSignals.at(-1)?.replace(/_/g, " ") ?? "still learning their social pace"] },
    { title: "what they light up about", items: [firstInterest, interests[1] ? themeLabel(interests[1]) : "small details other people miss"] },
    { title: "relational style", items: [values[0] ? `moves toward ${values[0]}` : "moves toward something honest", memory?.relationalPatterns[0] ? soften(memory.relationalPatterns[0]) : "opens slowly before becoming clearer"] },
    { title: "reassurance style", items: [`does better with ${softPhrase(need)}`, "prefers warmth that does not feel performative"] },
    { title: "conflict rhythm", items: [memory?.softSpots[0] ? `may go quiet around ${memory.softSpots[0]}` : "needs time when the mood changes", "clear repair matters more than perfect wording"] },
    { title: "ideal first conversation", items: [`start with ${firstInterest}`, "leave enough room for a sideways turn"] },
    { title: "communication comfort", items: [preference, lifestylePreferences[0] ?? "routine is still becoming legible"] },
    { title: "conversation starters", items: [`what opinion do you have about ${firstInterest}?`, "what topic makes you accidentally talk too much?"] },
    { title: "emotional environment", items: [resonanceIndicators[1] ?? "notices shifts before naming them", "does better when the room feels unforced"] },
  ];
}

function buildNotices(memory: CandorMemory | null, values: string[], needs: string[], interests: string[]) {
  const pool = dedupe([
    `notice emotional shifts faster than they let on`,
    `care more about ${values[0]} than surface smoothness`,
    `open more easily with ${softPhrase(needs[0])}`,
    interests[0] ? `wake up a bit when ${themeLabel(interests[0])} enters the conversation` : "",
    memory?.socialPreferences[0] ? soften(memory.socialPreferences[0]) : "",
    memory?.softSpots[0] ? `still go quiet around ${memory.softSpots[0]}` : "",
  ]).filter(Boolean);

  return pool.slice(0, 4);
}

function buildResonance(memory: CandorMemory | null, socialPreferences: string[], interests: string[]) {
  const pool = dedupe([
    `conversation may feel unusually natural`,
    interests[0] ? `seems to stay longer when the topic turns to ${themeLabel(interests[0])}` : "",
    socialPreferences[0] ? soften(socialPreferences[0]) : "",
    memory?.lifestylePreferences[0] ? soften(memory.lifestylePreferences[0]) : "",
  ]).filter(Boolean);

  return pool.slice(0, 4);
}

function buildAlignmentStyle(value?: string, need?: string, social?: string, interest?: string) {
  const parts = [value ? `more into ${value}` : "", need ? `opens best with ${softPhrase(need)}` : "", social ? soften(social) : "", interest ? `conversation leans toward ${themeLabel(interest)}` : ""].filter(Boolean);
  return parts.slice(0, 2).join(". ").replace(/\.$/, "") || "still becoming clearer";
}

function buildShareCards(input: {
  username: string;
  values: string[];
  interests: string[];
  socialPreferences: string[];
  needs: string[];
  resonanceIndicators: string[];
}) {
  const { username, values, interests, socialPreferences, needs, resonanceIndicators } = input;
  return [
    {
      kind: "story" as const,
      title: "candor notices",
      lines: [
        username,
        `more likely to notice tone shifts`,
        `than pretend nothing changed`,
      ],
    },
    {
      kind: "post" as const,
      title: "energy",
      lines: [
        interests[0] ? `probably disappears into ${themeLabel(interests[0])}` : `probably disappears into rabbit holes`,
        values[0] ? `and still cares about ${values[0]}` : `and still wants something real`,
      ],
    },
    {
      kind: "x" as const,
      title: "social read",
      lines: [
        socialPreferences[0] ?? `texting rhythm means more than it should`,
        needs[0] ? `opens better with ${softPhrase(needs[0])}` : `opens better when things feel clear`,
      ],
    },
    {
      kind: "banner" as const,
      title: "alignment",
      lines: [resonanceIndicators[0] ?? "conversation may feel unusually natural"],
    },
  ];
}

function derivedSocialPreferences(memory: CandorMemory | null) {
  const pool = dedupe([
    memory?.communicationNeeds[0] ? `does better with ${softPhrase(memory.communicationNeeds[0])}` : "",
    memory?.relationalPatterns[0] ? soften(memory.relationalPatterns[0]) : "",
    `texting rhythm probably matters`,
  ]).filter(Boolean);

  return pool.length ? pool : ["texting rhythm probably matters"];
}

function derivedLifestylePreferences(memory: CandorMemory | null, interests: string[]) {
  const pool = dedupe([
    memory?.lifeThemes[0] ? soften(memory.lifeThemes[0]) : "",
    interests[0] === "movies" ? "could lose an evening to films that stay with them" : "",
    interests[0] === "music" ? "lets music set the mood more than they admit" : "",
    interests[0] === "games" ? "likes worlds they can disappear into for hours" : "",
  ]).filter(Boolean);

  return pool.length ? pool : ["routine is still becoming legible"];
}

function themeLabel(value: string) {
  const labels: Record<string, string> = {
    movies: "films that linger",
    games: "games where choices matter",
    music: "music that stays in the body",
    politics: "geopolitics spirals",
    psychology: "psychology spirals",
    philosophy: "philosophy after dark",
    history: "history rabbit holes",
    "internet culture": "internet culture analysis",
    startups: "startup ideas",
    design: "design details people miss",
    relationships: "relationship dynamics",
  };

  return labels[value] ?? value;
}

function softPhrase(value: string) {
  return value.replace(/^a /, "").replace(/^an /, "");
}

function soften(value: string) {
  return value.replace(/\bneeds\b/g, "seems to need").replace(/\bhas\b/g, "seems to have");
}

function fragmentFromSocial(value?: string) {
  if (!value) return "";
  const text = value.toLowerCase();
  if (text.includes("texting rhythm")) return "texts with timing";
  if (text.includes("direct")) return "likes clear energy";
  if (text.includes("slow")) return "opens slowly";
  if (text.includes("warm")) return "warms up sideways";
  return soften(value).replace(/^seems to /, "");
}

function fragmentFromLifestyle(value?: string) {
  if (!value) return "";
  const text = value.toLowerCase();
  if (text.includes("films")) return "film rabbit holes";
  if (text.includes("music")) return "lets music set the mood";
  if (text.includes("worlds")) return "disappears into worlds";
  if (text.includes("routine")) return "rhythm still forming";
  return value;
}

function fragmentFromInterest(value?: string) {
  if (!value) return "";
  const labels: Record<string, string> = {
    movies: "movie spiral person",
    games: "choice-heavy game brain",
    music: "music-first moods",
    psychology: "psychology spirals",
    philosophy: "late-night philosophy",
    relationships: "reads people closely",
    design: "notices design details",
  };

  return labels[value] ?? "";
}

function fragmentFromNeed(value?: string) {
  if (!value) return "";
  const text = value.toLowerCase();
  if (text.includes("gentle")) return "needs gentler pacing";
  if (text.includes("direct")) return "prefers direct honesty";
  if (text.includes("space")) return "needs some room";
  return "";
}

function fragmentFromValue(value?: string) {
  if (!value) return "";
  const text = value.toLowerCase();
  if (text.includes("honest")) return "low tolerance for fake vibes";
  if (text.includes("safe")) return "protective of their peace";
  return "";
}

function bannerFrom(seed: string) {
  if (seed.includes("honest")) {
    return "linear-gradient(135deg, hsl(var(--accent) / 0.38), hsl(var(--background) / 0.2)), radial-gradient(circle at 20% 30%, hsl(var(--foreground) / 0.16), transparent 34%)";
  }
  if (seed.includes("safe")) {
    return "linear-gradient(135deg, hsl(var(--glow) / 0.28), hsl(var(--surface-secondary))), radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.28), transparent 32%)";
  }
  return "linear-gradient(135deg, hsl(var(--surface-secondary)), hsl(var(--accent) / 0.28)), radial-gradient(circle at 70% 30%, hsl(var(--foreground) / 0.12), transparent 36%)";
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/\.+/g, ".").replace(/^\.|\.$/g, "").slice(0, 32) || "someone";
}

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C";
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(" ") || "Someone";
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function fallback(items: string[] | undefined | null, backup: string[]) {
  return items?.length ? items : backup;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function emptyMemoryStub(): CandorMemory {
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
    alignmentReady: false,
    notes: [],
    presenceState: { clarity: "low", curiosity: "medium", resonance: "low" },
    responseHistory: [],
    recentStructures: [],
    suppressedPhrases: [],
    interactionProfile: {
      choicePatterns: [],
      acceptedInsightTypes: [],
      rejectedInsightTypes: [],
      engagementSignals: [],
      interestSignals: {},
    },
  };
}
