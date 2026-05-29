import { sendCandorJson } from "@/lib/candor-api";
import { topInterestTopics } from "@/lib/candor/memory";
import type { CandorMemory } from "@/lib/candor/types";

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
