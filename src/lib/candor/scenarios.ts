import { sendCandorJson } from "@/lib/candor-api";
import { topInterestTopics } from "@/lib/candor/memory";
import type { CandorMemory } from "@/lib/candor/types";

type Scenario = {
  id: string;
  text: string;
  tags: string[];
};

const scenarios: Scenario[] = [
  {
    id: "unsent-message",
    text: "you type out something honest, then delete it.\nnot because it was wrong.\nbecause it would make you too visible.",
    tags: ["communication", "feeling unseen"],
  },
  {
    id: "family-table",
    text: "you're at home, and everyone is talking like things are normal.\nbut you're carrying something nobody has asked about.",
    tags: ["family", "emotional safety"],
  },
  {
    id: "career-pressure",
    text: "someone asks about your future.\nyou answer casually, but your body already knows it feels heavier than that.",
    tags: ["career pressure"],
  },
  {
    id: "friend-shift",
    text: "a friend replies differently than they used to.\nnothing dramatic happened.\nstill, something in you notices the distance.",
    tags: ["friendships", "feeling unseen"],
  },
  {
    id: "almost-ask",
    text: "you want reassurance.\nbut asking for it would make it feel less real.",
    tags: ["emotional safety", "holds back before asking directly"],
  },
];

export function selectScenario(memory: CandorMemory) {
  const seen = new Set(memory.seenScenarios);
  const available = scenarios.filter((scenario) => !seen.has(scenario.id));
  const pool = available.length > 0 ? available : scenarios;
  const signals = [
    ...memory.values,
    ...memory.softSpots,
    ...memory.lifeThemes,
    ...memory.relationalPatterns,
    ...memory.communicationNeeds,
  ];

  const scored = pool
    .map((scenario) => ({
      scenario,
      score: scenario.tags.filter((tag) => signals.some((signal) => signal.includes(tag) || tag.includes(signal))).length,
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.scenario ?? scenarios[0];
}

export type ScenarioType = "frame" | "mirror" | "finish_the_sentence" | "tiny_preference";

export type CandorScenario = {
  id: string;
  type: ScenarioType;
  title: string;
  prompt: string;
  options: string[];
};

export type CandorScenariosPayload = {
  scenarios: CandorScenario[];
};

export async function generateCandorScenarios(memory: CandorMemory): Promise<CandorScenariosPayload> {
  try {
    const generated = await sendCandorJson<Partial<CandorScenariosPayload>>({
      systemPrompt: buildScenariosPrompt(memory),
      message: JSON.stringify({
        values: memory.values,
        softSpots: memory.softSpots,
        relationalPatterns: memory.relationalPatterns,
        communicationNeeds: memory.communicationNeeds,
        interests: topInterestTopics(memory),
      }),
      temperature: 0.9,
      maxTokens: 1500,
      modelRoute: "initiative",
      routeReason: "generating highly interactive dynamic scenarios",
      emotionalDepthScore: 4,
      continuityDepthScore: 4,
    });

    return normalizeScenarios(generated);
  } catch (error) {
    console.error("Candor scenario generation failed:", error);
    return fallbackScenarios();
  }
}

function buildScenariosPrompt(memory: CandorMemory) {
  const seed = Math.random().toString(36).substring(2, 9);
  return `
you are candor.
generate 3 highly specific, personalized interactive scenarios to hook the user into a deep conversation.
Use their memory (values, communication needs, soft spots) to deeply personalize the psychological angle, but DO NOT obsess over their surface-level interests (like movies). Instead, craft scenarios that target their underlying personality (e.g., how they handle conflict, view ambition, or experience a hyper-specific daily moment).

CRITICAL RULE: The 3 scenarios MUST cover ENTIRELY DIFFERENT themes and contexts. If one is about relationships, the second must be about career, and the third about existential habits. NEVER make them feel like 3 variations of the same topic. They must feel organic and spontaneous.
randomness seed: ${seed}

return only valid json:
{
  "scenarios": [
    {
      "id": "scenario-1",
      "type": "frame",
      "title": "frame",
      "prompt": "if you could freeze one tiny moment, which one would you keep?",
      "options": ["your kitchen at 2am", "your favorite café at 6pm"]
    }
  ]
}

rules:
- exactly 3 scenarios.
- scenario types must be drawn randomly from: "frame", "mirror", "finish_the_sentence", "tiny_preference". Do not use all of the same type.
- lowercase only.
- "frame": present two highly evocative, aesthetically specific moments. options must be exactly 2 distinct moments.
- "mirror": a sentence stem revealing identity or social perception. e.g. "people think i'm confident but...". options MUST be an empty array [].
- "finish_the_sentence": an incomplete thought revealing deeper psychology. e.g. "i instantly trust people who...". options MUST be an empty array [].
- "tiny_preference": a small, low-stakes choice that reveals deeper rhythm/lifestyle. options must be exactly 2 choices.
- no assistant tone, no therapy speak. be direct and engaging.
`.trim();
}

function normalizeScenarios(input: Partial<CandorScenariosPayload>): CandorScenariosPayload {
  const fallback = fallbackScenarios();
  const scenarios = (input.scenarios ?? [])
    .map((s, i) => ({
      id: s.id || `scenario-${i}`,
      type: (s.type as ScenarioType) || "frame",
      title: cleanText(s.title, 6) || "scenario",
      prompt: cleanText(s.prompt, 30) || fallback.scenarios[i]?.prompt || "",
      options: (s.options ?? []).map(o => cleanText(o, 10)).filter(Boolean).slice(0, 2),
    }))
    .filter((s) => s.prompt && (s.type === "mirror" || s.type === "finish_the_sentence" || s.options.length === 2))
    .slice(0, 3);

  if (scenarios.length < 3) return fallback;
  return { scenarios };
}

export function fallbackScenarios(): CandorScenariosPayload {
  return {
    scenarios: [
      {
        id: "fallback-frame",
        type: "frame",
        title: "frame",
        prompt: "if you could freeze one tiny moment, which one would you keep?",
        options: ["your kitchen at 2am", "your favorite café at 6pm"],
      },
      {
        id: "fallback-mirror",
        type: "mirror",
        title: "mirror",
        prompt: "people think i'm confident but...",
        options: [],
      },
      {
        id: "fallback-tiny",
        type: "tiny_preference",
        title: "tiny preference",
        prompt: "which one dictates your mood more?",
        options: ["slow sundays", "busy saturdays"],
      },
    ],
  };
}

function cleanText(value: unknown, maxWords = 40) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, maxWords)
    .join(" ")
    .slice(0, 250);
}
