import { sendCandorJson } from "@/lib/candor-api";
import { topInterestTopics } from "@/lib/candor/memory";
import type { CandorMemory } from "@/lib/candor/types";

export type CandorPresets = {
  chips: string[];
  scenario: {
    title: string;
    lines: string[];
  };
};

const GENERIC_PRESETS: CandorPresets = {
  chips: [
    "emotionally devastating films",
    "games where choices matter",
    "video essays at 2am",
    "replaying conversations",
    "internet rabbit holes",
  ],
  scenario: {
    title: "okay, maybe this",
    lines: ["a story that quietly wrecked you", "something you keep overthinking", "a topic you could disappear into"],
  },
};

export async function generateCandorPresets(memory: CandorMemory): Promise<CandorPresets> {
  try {
    const generated = await sendCandorJson<Partial<CandorPresets>>({
      systemPrompt: buildPresetPrompt(memory),
      message: JSON.stringify({
        values: memory.values,
        softSpots: memory.softSpots,
        lifeThemes: memory.lifeThemes,
        relationalPatterns: memory.relationalPatterns,
        communicationNeeds: memory.communicationNeeds,
        appreciatesInPeople: memory.appreciatesInPeople,
        socialPreferences: memory.socialPreferences,
        lifestylePreferences: memory.lifestylePreferences,
        notes: memory.notes,
        interests: topInterestTopics(memory),
      }),
      temperature: 0.86,
      maxTokens: 360,
      modelRoute: "initiative",
      routeReason: "social spark home hooks and conversational openers",
      emotionalDepthScore: 4,
      continuityDepthScore: Math.min(4, 1 + Math.floor(memory.turnCount / 5)),
    });

    return normalizePresets(generated, memory);
  } catch (error) {
    console.error("Candor preset generation failed:", error);
    return fallbackPresets(memory);
  }
}

function buildPresetPrompt(memory: CandorMemory) {
  return `
you are candor.
generate home-screen conversation hooks that create energy, curiosity, and identity.

return only valid json:
{
  "chips": [],
  "scenario": {
    "title": "",
    "lines": []
  }
}

rules:
- lowercase only
- chips: exactly 5 strings, 2 to 6 words each
- scenario.title: 2 to 4 words
- scenario.lines: exactly 3 strings, 3 to 8 words each
- use interests, culturally relevant hooks, personality tells, and socially revealing preferences
- it is good if 1 or 2 hooks softly expose lifestyle or social habits
- make them feel like something a real person would tap immediately
- avoid aesthetic wallpaper, journaling language, therapy tone, soft sadness, polished empathy, or empty poetic phrases
- good lanes include media, internet culture, personality, obsessions, social habits, taste, hot takes, dumb debates, irrational beliefs
- the tone can be socially messy: "okay random question", "hot take or valid", "pick one", "be honest"
- no names or personal specifics
- current interest gravity: ${topInterestTopics(memory).join(", ") || "movies, games, music, internet culture, relationships"}
`.trim();
}

function normalizePresets(input: Partial<CandorPresets>, memory: CandorMemory): CandorPresets {
  const fallback = fallbackPresets(memory);
  const chips = cleanList(input.chips, 5, 6);
  const lines = cleanList(input.scenario?.lines, 3, 8);
  const title = cleanText(input.scenario?.title, 4);

  return {
    chips: chips.length === 5 ? chips : fallback.chips,
    scenario: {
      title: title || fallback.scenario.title,
      lines: lines.length === 3 ? lines : fallback.scenario.lines,
    },
  };
}

function fallbackPresets(memory: CandorMemory): CandorPresets {
  const interests = topInterestTopics(memory, 3);

  if (!interests.length) return GENERIC_PRESETS;

  const topicLines: Record<string, string> = {
    movies: "films that stay with you",
    games: "games where choices matter",
    music: "songs that ruin your mood",
    politics: "geopolitics spirals",
    psychology: "psychology obsessions",
    philosophy: "philosophy at night",
    history: "history rabbit holes",
    "internet culture": "internet culture analysis",
    startups: "startup ideas at midnight",
    design: "design details people miss",
    relationships: "replaying conversations",
  };

  const mapped = interests.map((topic) => topicLines[topic] ?? topic);

  return {
    chips: [
      mapped[0] ?? "emotionally devastating films",
      mapped[1] ?? "games where choices matter",
      mapped[2] ?? "video essays at 2am",
      "noticing small tone shifts",
      "pretending not to care",
    ].slice(0, 5),
    scenario: {
      title: "start here maybe",
      lines: [
        mapped[0] ?? "what actually has your attention",
        "something socially weird lately",
        "a topic you keep returning to",
      ],
    },
  };
}

function cleanList(value: unknown, max: number, maxWords: number) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, maxWords)).filter(Boolean).slice(0, max);
}

function cleanText(value: unknown, maxWords = 9) {
  if (typeof value !== "string") return "";
  return dedupeWords(value.trim().toLowerCase().replace(/\s+/g, " "))
    .split(" ")
    .slice(0, maxWords)
    .join(" ")
    .slice(0, 90);
}

function dedupeWords(value: string) {
  const words = value.split(" ").filter(Boolean);
  return words.filter((word, index) => index === 0 || word !== words[index - 1]).join(" ");
}
