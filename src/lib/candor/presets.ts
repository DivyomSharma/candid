import { sendCandorJson } from "@/lib/candor-api";
import type { CandorMemory } from "@/lib/candor/types";

export type CandorPresets = {
  chips: string[];
  scenario: {
    title: string;
    lines: string[];
  };
};

const GENERIC_PRESETS: CandorPresets = {
  chips: ["something i keep replaying", "a person i miss", "a small win", "i feel off", "no idea yet"],
  scenario: {
    title: "tonight feels like",
    lines: ["a thought half-formed", "a little too much noise", "wanting to be known without performing"],
  },
};

export async function generateCandorPresets(memory: CandorMemory): Promise<CandorPresets> {
  try {
    const generated = await sendCandorJson<Partial<CandorPresets>>({
      systemPrompt: buildPresetPrompt(),
      message: JSON.stringify({
        values: memory.values,
        softSpots: memory.softSpots,
        lifeThemes: memory.lifeThemes,
        relationalPatterns: memory.relationalPatterns,
        communicationNeeds: memory.communicationNeeds,
        appreciatesInPeople: memory.appreciatesInPeople,
        notes: memory.notes,
      }),
      temperature: 0.82,
      maxTokens: 320,
    });

    return normalizePresets(generated, memory);
  } catch (error) {
    console.error("Candor preset generation failed:", error);
    return fallbackPresets(memory);
  }
}

function buildPresetPrompt() {
  return `
you are candor.
generate fresh conversation starts for this person from the private understanding provided.

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
- chips: exactly 5 strings, 2 to 7 words each
- scenario.title: 2 to 5 words
- scenario.lines: exactly 3 strings, 3 to 9 words each
- intimate, quiet, human
- no therapy words
- no mention of traits, memory, profile, matching, analysis, or ai
- do not include names or sensitive specifics
`.trim();
}

function normalizePresets(input: Partial<CandorPresets>, memory: CandorMemory): CandorPresets {
  const fallback = fallbackPresets(memory);
  const chips = cleanList(input.chips, 5);
  const lines = cleanList(input.scenario?.lines, 3);
  const title = cleanText(input.scenario?.title);

  return {
    chips: chips.length === 5 ? chips : fallback.chips,
    scenario: {
      title: title || fallback.scenario.title,
      lines: lines.length === 3 ? lines : fallback.scenario.lines,
    },
  };
}

function fallbackPresets(memory: CandorMemory): CandorPresets {
  const themes = [
    ...memory.lifeThemes,
    ...memory.softSpots,
    ...memory.values,
    ...memory.communicationNeeds,
  ];

  if (!themes.length) return GENERIC_PRESETS;

  const first = themes[0];
  const second = themes[1] ?? "something unsaid";

  return {
    chips: [
      `something about ${first}`,
      `the part i keep quiet`,
      `what ${second} brings up`,
      "a tiny honest thing",
      "i don't know yet",
    ].slice(0, 5),
    scenario: {
      title: "what keeps returning",
      lines: [
        `something around ${first}`,
        "the feeling under the story",
        "what i almost say",
      ],
    },
  };
}

function cleanList(value: unknown, max: number) {
  if (!Array.isArray(value)) return [];
  return value.map(cleanText).filter(Boolean).slice(0, max);
}

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return dedupeWords(value.trim().toLowerCase().replace(/\s+/g, " "))
    .split(" ")
    .slice(0, 9)
    .join(" ")
    .slice(0, 80);
}

function dedupeWords(value: string) {
  const words = value.split(" ").filter(Boolean);
  return words
    .filter((word, index) => index === 0 || word !== words[index - 1])
    .join(" ");
}
