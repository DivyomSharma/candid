import { sendCandidJson } from "@/lib/candid-api";
import { getLearningBias } from "@/lib/candid/learning";
import { topInterestTopics } from "@/lib/candid/memory";
import type { CandidEntryPayload, CandidLearningBias, CandidMemory } from "@/lib/candid/types";

const DEFAULT_ENTRY: CandidEntryPayload = {
  choices: [
    {
      id: "comfort-vs-chaos",
      prompt: "pick a side...\ncomfort movie or emotionally devastating masterpiece",
      optionA: "comfort movie every time",
      optionB: "wreck me a little",
      patternA: "comfort-seeking",
      patternB: "intensity-seeking",
    },
    {
      id: "stories-or-winning",
      prompt: "pick a side...\nstory games or competitive games",
      optionA: "give me choices that matter",
      optionB: "i want the rush",
      patternA: "story-gravity",
      patternB: "competitive-energy",
    },
    {
      id: "understood-or-loved",
      prompt: "hot take or valid...\npeople care more about being understood than being loved",
      optionA: "hot take",
      optionB: "honestly true",
      patternA: "pushback-first",
      patternB: "recognition-seeking",
    },
  ],
  spotlight: {
    id: "spotlight-obsession",
    prompt: "okay serious question\nwhat topic accidentally consumes your entire attention",
    options: ["movies", "games", "music", "psychology", "philosophy", "internet culture"],
    interestTags: ["movies", "games", "music", "psychology", "philosophy", "internet culture"],
  },
  insights: [
    { id: "replay", line: "you probably replay conversations later", insightType: "you-probably" },
    { id: "tone", line: "you notice small tone shifts before most people do", insightType: "social-signal" },
    { id: "care", line: "you act casual about things that actually stay with you", insightType: "contrast" },
  ],
  initiative: {
    line: "i have a feeling your algorithm knows too much about you already",
    status: "unread",
  },
};

export async function generateCandidEntry(memory: CandidMemory): Promise<CandidEntryPayload> {
  try {
    const learningBias = await getLearningBias(memory);
    const generated = await sendCandidJson<Partial<CandidEntryPayload>>({
      systemPrompt: buildEntryPrompt(memory, learningBias),
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
      temperature: 0.9,
      maxTokens: 650,
      modelRoute: "profile",
      routeReason: "home-screen profile evolution and social discovery generation",
      emotionalDepthScore: 5,
      continuityDepthScore: Math.min(5, 2 + Math.floor(memory.turnCount / 4)),
    });

    return normalizeEntry(generated, memory);
  } catch (error) {
    console.error("Candid entry generation failed:", error);
    return fallbackEntry(memory);
  }
}

function buildEntryPrompt(memory: CandidMemory, learningBias: CandidLearningBias) {
  return `
you are candid.
generate a playful home-screen discovery sequence.

return only valid json:
{
  "choices": [
    {
      "id": "",
      "prompt": "",
      "optionA": "",
      "optionB": "",
      "patternA": "",
      "patternB": ""
    }
  ],
  "spotlight": {
    "id": "",
    "prompt": "",
    "options": [],
    "interestTags": []
  },
  "insights": [
    {
      "id": "",
      "line": "",
      "insightType": ""
    }
  ],
  "initiative": {
    "line": "",
    "status": ""
  }
}

rules:
- lowercase only
- exactly 3 choice cards
- exactly 1 spotlight question with 4 to 6 options
- exactly 3 insight cards
- exactly 1 initiative line
- the choices should feel like pick-a-side, hot-take, or mildly chaotic social prompts, not therapy
- let at least one part of the sequence softly reveal lifestyle or social preferences like texting rhythm, social battery, nightlife, sleep, travel, or relationship pace
- the spotlight question should discover interests or conversational gravity
- the insights should feel like "you probably..." or "kind of / not really" style observations, not polished wisdom
- the initiative line should feel like candid messaged first with social instinct, a take, a playful read, or random curiosity
- no labels, scores, analysis words, or assistant tone
- avoid emotionally elevated or philosophical phrasing unless the user's data strongly points there
- avoid "beautiful", "complex", "journey", "connection", "understood on a deeper level"
- no raw personal specifics
- keep things interesting before going deep
- current interest gravity: ${topInterestTopics(memory).join(", ") || "movies, games, music, psychology, internet culture"}
- favored insight tendencies: ${learningBias.favoredInsightTypes.join(", ") || "contrast, social-signal"}
- favored choice tendencies: ${learningBias.favoredChoicePatterns.join(", ") || "story-gravity, recognition-seeking"}
- favored topics: ${learningBias.favoredTopics.join(", ") || "movies, games, music"}
`.trim();
}

function normalizeEntry(input: Partial<CandidEntryPayload>, memory: CandidMemory): CandidEntryPayload {
  const fallback = fallbackEntry(memory);

  const choices = (input.choices ?? [])
    .map((choice, index) => ({
      id: cleanText(choice?.id, 4) || `choice-${index + 1}`,
      prompt: cleanMultiline(choice?.prompt, 160),
      optionA: cleanText(choice?.optionA, 8),
      optionB: cleanText(choice?.optionB, 8),
      patternA: cleanText(choice?.patternA, 4),
      patternB: cleanText(choice?.patternB, 4),
    }))
    .filter((choice) => choice.prompt && choice.optionA && choice.optionB)
    .slice(0, 3);

  const spotlight = {
    id: cleanText(input.spotlight?.id, 4) || fallback.spotlight.id,
    prompt: cleanMultiline(input.spotlight?.prompt, 140) || fallback.spotlight.prompt,
    options: cleanList(input.spotlight?.options, 6, 3),
    interestTags: cleanList(input.spotlight?.interestTags, 6, 3),
  };

  const insights = (input.insights ?? [])
    .map((insight, index) => ({
      id: cleanText(insight?.id, 4) || `insight-${index + 1}`,
      line: cleanText(insight?.line, 14),
      insightType: cleanText(insight?.insightType, 3) || "observation",
    }))
    .filter((insight) => insight.line)
    .slice(0, 3);

  const initiative = {
    line: cleanText(input.initiative?.line, 18) || fallback.initiative.line,
    status: cleanText(input.initiative?.status, 2) || "unread",
  };

  return {
    choices: choices.length === 3 ? choices : fallback.choices,
    spotlight:
      spotlight.options.length >= 4 && spotlight.interestTags.length >= 4
        ? spotlight
        : fallback.spotlight,
    insights: insights.length === 3 ? insights : fallback.insights,
    initiative,
  };
}

function fallbackEntry(memory: CandidMemory): CandidEntryPayload {
  const interests = topInterestTopics(memory, 6);
  if (!interests.length) return DEFAULT_ENTRY;

  const mapped = interests.map((topic) => topicLabel(topic));

  return {
    ...DEFAULT_ENTRY,
    spotlight: {
      id: "spotlight-interest",
      prompt: "okay serious question\nwhat topic accidentally consumes your entire attention",
      options: dedupe([...mapped, "relationships", "design"]).slice(0, 6),
      interestTags: dedupe([...interests, "relationships", "design"]).slice(0, 6),
    },
    initiative: {
      line: initiativeFromTopic(interests[0]),
      status: "unread",
    },
  };
}

function initiativeFromTopic(topic?: string) {
  switch (topic) {
    case "movies":
      return "you seem like someone who gets attached to scenes and then pretends it was just a good film";
    case "games":
      return "i have a feeling you care more about game choices than winning";
    case "music":
      return "your playlist probably reveals more than your words do";
    case "psychology":
      return "you seem like the kind of person who notices patterns and then cannot unsee them";
    case "philosophy":
      return "you definitely have thoughts that get more dangerous after midnight";
    case "internet culture":
      return "your algorithm probably looks a little too specific to be accidental";
    default:
      return DEFAULT_ENTRY.initiative.line;
  }
}

function topicLabel(topic: string) {
  const labels: Record<string, string> = {
    movies: "movies",
    games: "games",
    music: "music",
    politics: "politics",
    psychology: "psychology",
    philosophy: "philosophy",
    history: "history",
    "internet culture": "internet culture",
    startups: "startups",
    design: "design",
    relationships: "relationships",
  };

  return labels[topic] ?? topic;
}

function cleanList(value: unknown, max: number, maxWords: number) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, maxWords)).filter(Boolean).slice(0, max);
}

function cleanText(value: unknown, maxWords = 10) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/\s+/g, " ").split(" ").slice(0, maxWords).join(" ").slice(0, 120);
}

function cleanMultiline(value: unknown, max = 180) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, max);
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}
