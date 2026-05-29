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

export type ScenarioType = "would_you_rather" | "have_you_ever" | "creative_argument";

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
      maxTokens: 500,
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
  return `
you are candor.
generate 3 personalized interactive scenarios to hook the user into a conversation based on their memory.

return only valid json:
{
  "scenarios": [
    {
      "id": "scenario-1",
      "type": "would_you_rather",
      "title": "would you rather",
      "prompt": "give up music or movies?",
      "options": ["music", "movies"]
    }
  ]
}

rules:
- exactly 3 scenarios.
- scenario types must be: one "would_you_rather", one "have_you_ever", and one "creative_argument".
- lowercase only.
- "would_you_rather": a tough, personalized choice based on their interests or habits. provide exactly 2 options.
- "have_you_ever": a very specific, slightly exposing question (e.g. "have you ever lied to get out of a social event?"). provide exactly 2 options like ["yes, absolutely", "no, i'd feel guilty"].
- "creative_argument": set up a playful debate on a work, relationship, or family topic (e.g. "let's argue about whether remote work is ruining social skills."). provide exactly 2 options representing stances.
- no assistant tone, no therapy speak. be direct and engaging.
`.trim();
}

function normalizeScenarios(input: Partial<CandorScenariosPayload>): CandorScenariosPayload {
  const fallback = fallbackScenarios();
  const scenarios = (input.scenarios ?? [])
    .map((s, i) => ({
      id: s.id || `scenario-${i}`,
      type: (s.type as ScenarioType) || "would_you_rather",
      title: cleanText(s.title, 6) || "scenario",
      prompt: cleanText(s.prompt, 30) || fallback.scenarios[i]?.prompt || "",
      options: (s.options ?? []).map(o => cleanText(o, 10)).filter(Boolean).slice(0, 2),
    }))
    .filter((s) => s.prompt && s.options.length === 2)
    .slice(0, 3);

  if (scenarios.length < 3) return fallback;
  return { scenarios };
}

function fallbackScenarios(): CandorScenariosPayload {
  return {
    scenarios: [
      {
        id: "fallback-wyr",
        type: "would_you_rather",
        title: "would you rather",
        prompt: "know all the answers but never speak, or speak but know nothing?",
        options: ["know all", "speak always"],
      },
      {
        id: "fallback-hye",
        type: "have_you_ever",
        title: "have you ever",
        prompt: "ghosted someone because you were overwhelmed, not because you didn't care?",
        options: ["yes, unfortunately", "no, i communicate"],
      },
      {
        id: "fallback-ca",
        type: "creative_argument",
        title: "playful argument",
        prompt: "let's argue about whether brutal honesty is actually just a lack of empathy.",
        options: ["it is a lack of empathy", "no, honesty is respect"],
      },
    ],
  };
}

function cleanText(value: unknown, maxWords = 10) {
  if (typeof value !== "string") return "";
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .slice(0, maxWords)
    .join(" ")
    .slice(0, 150);
}
