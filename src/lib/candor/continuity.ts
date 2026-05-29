import { sendCandorJson } from "@/lib/candor-api";
import { topInterestTopics } from "@/lib/candor/memory";
import { CHEMISTRY_GAMES, TONIGHTS_THREADS, WEEKLY_REFLECTIONS } from "@/lib/candor/relational-layer";
import type { CandorMemory } from "@/lib/candor/types";

export type CandorContinuity = {
  tonightsThread: string;
  chemistryGame: {
    title: string;
    a: string;
    b: string;
  };
  weeklyReflection: string;
};

export async function generateCandorContinuity(memory: CandorMemory): Promise<CandorContinuity> {
  // If memory is effectively empty (turnCount < 2), just use fallbacks
  if (memory.turnCount < 2) {
    return fallbackContinuity();
  }

  try {
    const generated = await sendCandorJson<Partial<CandorContinuity>>({
      systemPrompt: buildContinuityPrompt(memory),
      message: JSON.stringify({
        values: memory.values,
        softSpots: memory.softSpots,
        relationalPatterns: memory.relationalPatterns,
        communicationNeeds: memory.communicationNeeds,
        appreciatesInPeople: memory.appreciatesInPeople,
        socialPreferences: memory.socialPreferences,
        lifestylePreferences: memory.lifestylePreferences,
        notes: memory.notes,
        interests: topInterestTopics(memory),
      }),
      temperature: 0.88,
      maxTokens: 350,
      modelRoute: "initiative",
      routeReason: "relational continuity panel generation based on conversational memory",
      emotionalDepthScore: Math.min(5, 2 + Math.floor(memory.turnCount / 5)),
      continuityDepthScore: Math.min(5, 3 + Math.floor(memory.turnCount / 5)),
    });

    return normalizeContinuity(generated);
  } catch (error) {
    console.error("Candor continuity generation failed:", error);
    return fallbackContinuity();
  }
}

function buildContinuityPrompt(memory: CandorMemory) {
  return `
you are candor.
generate personalized relational games and threads based on the user's specific conversational memory.

return only valid json:
{
  "tonightsThread": "",
  "chemistryGame": {
    "title": "",
    "a": "",
    "b": ""
  },
  "weeklyReflection": ""
}

rules:
- lowercase only
- tonightsThread: a quiet, evocative question (max 15 words) that relates to how they think, feel, or interact, based on their data.
- chemistryGame.title: 2-4 words, an abstract theme of a choice they often face (e.g., "comfort vs chaos", "social battery").
- chemistryGame.a and chemistryGame.b: 3-8 words each, representing two contrasting options or habits relevant to them.
- weeklyReflection: a short observation (max 12 words) about their recent emotional pacing, energy shifts, or communication style.
- avoid aesthetic wallpaper, therapy tone, soft sadness, or poetic phrasing. be slightly messy and highly observant.
- no labels, scores, analysis words, or assistant tone.
- make it feel like it came directly from observing their unique rhythm.
`.trim();
}

function normalizeContinuity(input: Partial<CandorContinuity>): CandorContinuity {
  const fallback = fallbackContinuity();

  return {
    tonightsThread: cleanText(input.tonightsThread, 15) || fallback.tonightsThread,
    chemistryGame: {
      title: cleanText(input.chemistryGame?.title, 4) || fallback.chemistryGame.title,
      a: cleanText(input.chemistryGame?.a, 8) || fallback.chemistryGame.a,
      b: cleanText(input.chemistryGame?.b, 8) || fallback.chemistryGame.b,
    },
    weeklyReflection: cleanText(input.weeklyReflection, 12) || fallback.weeklyReflection,
  };
}

function fallbackContinuity(): CandorContinuity {
  const date = new Date();
  return {
    tonightsThread: TONIGHTS_THREADS[date.getDate() % TONIGHTS_THREADS.length] ?? TONIGHTS_THREADS[0],
    chemistryGame: CHEMISTRY_GAMES[date.getDay() % CHEMISTRY_GAMES.length] ?? CHEMISTRY_GAMES[0],
    weeklyReflection: WEEKLY_REFLECTIONS[date.getDay() % WEEKLY_REFLECTIONS.length] ?? WEEKLY_REFLECTIONS[0],
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
