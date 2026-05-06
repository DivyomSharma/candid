import { sendCandorJson } from "@/lib/candor-api";
import { getLearningBias } from "@/lib/candor/learning";
import type { CandorEntryPayload, CandorLearningBias, CandorMemory } from "@/lib/candor/types";

const DEFAULT_ENTRY: CandorEntryPayload = {
  choices: [
    {
      id: "quiet-weight",
      prompt: "imagine this...\nsomething sits wrong with you for hours, and no one can tell.",
      optionA: "you stay with it quietly",
      optionB: "you look for one person to tell",
      patternA: "internal processing",
      patternB: "selective reaching",
    },
    {
      id: "room-shift",
      prompt: "imagine this...\na room changes slightly, and you notice before anyone says anything.",
      optionA: "you trust the feeling first",
      optionB: "you wait for proof",
      patternA: "signal-trusting",
      patternB: "evidence-checking",
    },
    {
      id: "care-shape",
      prompt: "imagine this...\nsomeone cares, but the way they show it is uneven.",
      optionA: "you feel the gap quickly",
      optionB: "you give it more time",
      patternA: "consistency-seeking",
      patternB: "patience-first",
    },
  ],
  insights: [
    { id: "offness", line: "you notice when something feels slightly off", insightType: "observation" },
    { id: "expectation", line: "you do not always say what you expect, but you still feel it", insightType: "contrast" },
    { id: "care", line: "you pay attention to the shape of effort, not just the words", insightType: "pattern" },
  ],
};

export async function generateCandorEntry(memory: CandorMemory): Promise<CandorEntryPayload> {
  try {
    const learningBias = await getLearningBias(memory);
    const generated = await sendCandorJson<Partial<CandorEntryPayload>>({
      systemPrompt: buildEntryPrompt(learningBias),
      message: JSON.stringify({
        values: memory.values,
        softSpots: memory.softSpots,
        lifeThemes: memory.lifeThemes,
        relationalPatterns: memory.relationalPatterns,
        communicationNeeds: memory.communicationNeeds,
        appreciatesInPeople: memory.appreciatesInPeople,
        notes: memory.notes,
      }),
      temperature: 0.88,
      maxTokens: 500,
    });

    return normalizeEntry(generated);
  } catch (error) {
    console.error("Candor entry generation failed:", error);
    return DEFAULT_ENTRY;
  }
}

function buildEntryPrompt(learningBias: CandorLearningBias) {
  return `
you are candor.
generate a short intuitive entry sequence.

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
  "insights": [
    {
      "id": "",
      "line": "",
      "insightType": ""
    }
  ]
}

rules:
- lowercase only
- exactly 3 choice cards
- exactly 3 insight cards
- prompts should feel like short situations, not tests
- options should be natural and slightly generalized
- insight lines should be emotionally light and reflective
- no labels, scores, analysis words, or assistant tone
- no raw personal specifics
- favored insight tendencies: ${learningBias.favoredInsightTypes.join(", ") || "observation, contrast"}
- favored choice tendencies: ${learningBias.favoredChoicePatterns.join(", ") || "signal-trusting, selective-reaching"}
`.trim();
}

function normalizeEntry(input: Partial<CandorEntryPayload>): CandorEntryPayload {
  const choices = (input.choices ?? [])
    .map((choice, index) => ({
      id: cleanText(choice?.id) || `choice-${index + 1}`,
      prompt: cleanText(choice?.prompt, 180),
      optionA: cleanText(choice?.optionA, 60),
      optionB: cleanText(choice?.optionB, 60),
      patternA: cleanText(choice?.patternA, 40),
      patternB: cleanText(choice?.patternB, 40),
    }))
    .filter((choice) => choice.prompt && choice.optionA && choice.optionB)
    .slice(0, 3);

  const insights = (input.insights ?? [])
    .map((insight, index) => ({
      id: cleanText(insight?.id) || `insight-${index + 1}`,
      line: cleanText(insight?.line, 120),
      insightType: cleanText(insight?.insightType, 32) || "observation",
    }))
    .filter((insight) => insight.line)
    .slice(0, 3);

  return {
    choices: choices.length === 3 ? choices : DEFAULT_ENTRY.choices,
    insights: insights.length === 3 ? insights : DEFAULT_ENTRY.insights,
  };
}

function cleanText(value: unknown, max = 80) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().replace(/\s+/g, " ").slice(0, max);
}
