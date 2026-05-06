import { sendCandorJson, sendCandorMessage } from "@/lib/candor-api";
import {
  buildTraitCluster,
  createEmptyMemory,
  extractLightMemory,
  mergeMemory,
  updateTurnMemory,
} from "@/lib/candor/memory";
import { getLearningBias, logLearningEvent } from "@/lib/candor/learning";
import { buildAnalysisPrompt, buildCandorPrompt } from "@/lib/candor/prompts";
import { selectScenario } from "@/lib/candor/scenarios";
import type {
  CandorDecision,
  CandorIntuitionState,
  CandorLearningEvent,
  CandorMemory,
  CandorMode,
  CandorStructure,
  CandorTurnInput,
  CandorTurnResult,
  PresenceLevel,
  PresenceState,
} from "@/lib/candor/types";
import { shapeCandorResponse } from "@/lib/candor-response";

export async function runCandorTurn(input: CandorTurnInput): Promise<CandorTurnResult> {
  const lightMemory = mergeMemory(input.memory, extractLightMemory(input.message));
  const intuition = buildIntuitionState(input.message, lightMemory);
  const learningBias = await getLearningBias(lightMemory);
  const decision = decideResponse(intuition, lightMemory, learningBias);
  const scenario = decision.mode === "scenario" ? selectScenario(lightMemory) : undefined;
  const suppressedPhrases = buildSuppressedPhrases(lightMemory);

  const prompt = buildCandorPrompt({
    memory: lightMemory,
    decision,
    presenceState: intuition.presenceState,
    suppressedPhrases,
    learningBias,
    scenario: scenario?.text,
  });

  const firstReply = shapeCandorResponse(
    await sendCandorMessage({
      message: input.message,
      history: input.history,
      user_id: input.userId,
      system_prompt: prompt,
      temperature: temperatureFor(decision),
      max_tokens: maxTokensFor(intuition.presenceState),
    }),
  );

  const reply = await maybeRetryForRepetition({
    reply: firstReply,
    input,
    memory: lightMemory,
    intuition,
    decision,
    learningBias,
    scenario: scenario?.text,
    suppressedPhrases,
  });

  let memory = updateTurnMemory(
    mergeMemory(lightMemory, scenario ? { seenScenarios: [scenario.id] } : {}),
    {
      mode: decision.mode,
      structure: decision.structure,
      reply,
      presenceState: intuition.presenceState,
    },
  );

  if (shouldAnalyzeDeeply(memory)) {
    const deepMemory = await analyzeMemory(input.message, input.history, memory);
    memory = mergeMemory(memory, deepMemory);
  }

  void logLearningEvent(input.userId, memory, {
    traitCluster: buildTraitCluster(memory),
    choicePattern: null,
    insightType: decision.structure,
    accepted: null,
    engagementSignal: engagementFromTurn(input.message, intuition),
  });

  return { reply, memory, mode: decision.mode, decision };
}

function buildIntuitionState(message: string, memory: CandorMemory): CandorIntuitionState {
  const text = message.toLowerCase();
  const words = message.trim().split(/\s+/).filter(Boolean).length;
  const emotionalSignal = scoreLevel(scoreEmotion(text));
  const userOpenness = scoreLevel(scoreOpenness(text, words));
  const trustLevel = scoreLevel(Math.min(3, Math.floor(memory.turnCount / 3) + (memory.values.length > 1 ? 1 : 0)));
  const repetitionRisk = scoreLevel(scoreRepetitionRisk(memory));
  const presenceState = derivePresenceState({ emotionalSignal, userOpenness, trustLevel, memory });

  return {
    emotionalSignal,
    userOpenness,
    trustLevel,
    lastTurnType: memory.lastModes.at(-1) ?? "none",
    repetitionRisk,
    presenceState,
  };
}

function decideResponse(
  intuition: CandorIntuitionState,
  memory: CandorMemory,
  learningBias: { favoredStructures: CandorStructure[] },
): CandorDecision {
  const preferredStructure = pickStructure(memory, learningBias.favoredStructures);

  if (intuition.repetitionRisk === "high") {
    return {
      mode: intuition.trustLevel === "high" ? "pause" : "listen",
      tone: "soft",
      structure: preferredStructure === "observation" ? "fragment" : preferredStructure,
    };
  }

  if (intuition.emotionalSignal === "high" && intuition.userOpenness !== "low") {
    return {
      mode: intuition.trustLevel === "low" ? "comfort" : "deepen",
      tone: "soft",
      structure: intuition.trustLevel === "high" ? "observation" : "fragment",
    };
  }

  if (intuition.userOpenness === "low") {
    return {
      mode: memory.turnCount < 2 ? "scenario" : "pause",
      tone: "neutral",
      structure: memory.turnCount < 2 ? "question" : "silence",
    };
  }

  if (intuition.lastTurnType === "listen" && intuition.trustLevel !== "low") {
    return {
      mode: "deepen",
      tone: intuition.presenceState.clarity === "low" ? "soft" : "direct",
      structure: preferredStructure,
    };
  }

  if (memory.turnCount > 2 && intuition.presenceState.clarity === "high" && intuition.userOpenness === "high") {
    return {
      mode: "challenge",
      tone: "direct",
      structure: preferredStructure === "fragment" ? "contrast" : preferredStructure,
    };
  }

  if (/\b(i tried|i stayed|i kept showing up|i cared|i did)\b/.test(memory.notes.join(" "))) {
    return {
      mode: "appreciate",
      tone: "soft",
      structure: "observation",
    };
  }

  return {
    mode: memory.turnCount < 2 ? "listen" : "deepen",
    tone: intuition.presenceState.curiosity === "high" ? "neutral" : "soft",
    structure: preferredStructure,
  };
}

function derivePresenceState(input: {
  emotionalSignal: PresenceLevel;
  userOpenness: PresenceLevel;
  trustLevel: PresenceLevel;
  memory: CandorMemory;
}): PresenceState {
  const clarityScore =
    levelToScore(input.trustLevel) + Math.min(1, Math.floor(input.memory.lifeThemes.length / 2));
  const curiosityScore =
    2 + (input.userOpenness === "low" ? 1 : 0) - (input.trustLevel === "high" ? 1 : 0);
  const resonanceScore =
    levelToScore(input.emotionalSignal) + (input.memory.softSpots.length > 0 ? 1 : 0);

  return {
    clarity: scoreLevel(clarityScore),
    curiosity: scoreLevel(curiosityScore),
    resonance: scoreLevel(resonanceScore),
  };
}

function pickStructure(memory: CandorMemory, favored: CandorStructure[]) {
  const recent = new Set(memory.recentStructures.slice(-3));
  const pool: CandorStructure[] = ["observation", "fragment", "contrast", "question", "silence"];
  const ordered = [...favored, ...pool];
  return ordered.find((structure) => !recent.has(structure)) ?? "observation";
}

function buildSuppressedPhrases(memory: CandorMemory) {
  return memory.suppressedPhrases.length
    ? memory.suppressedPhrases
    : memory.responseHistory
        .slice(-4)
        .map((reply) => reply.split(/\s+/).slice(0, 3).join(" "))
        .filter(Boolean);
}

async function maybeRetryForRepetition(input: {
  reply: string;
  input: CandorTurnInput;
  memory: CandorMemory;
  intuition: CandorIntuitionState;
  decision: CandorDecision;
  learningBias: Awaited<ReturnType<typeof getLearningBias>>;
  scenario?: string;
  suppressedPhrases: string[];
}) {
  if (!isTooSimilar(input.reply, input.memory.responseHistory)) {
    return input.reply;
  }

  const fallbackDecision = {
    ...input.decision,
    structure: nextStructure(input.decision.structure),
    mode: input.decision.mode === "pause" ? "listen" : input.decision.mode,
  } as CandorDecision;

  const retryPrompt = buildCandorPrompt({
    memory: input.memory,
    decision: fallbackDecision,
    presenceState: input.intuition.presenceState,
    suppressedPhrases: [...input.suppressedPhrases, input.reply.split(/\s+/).slice(0, 4).join(" ")].slice(-8),
    learningBias: input.learningBias,
    scenario: input.scenario,
    retryReason: "the previous draft sounded too close to something already said. change the rhythm and angle.",
  });

  return shapeCandorResponse(
    await sendCandorMessage({
      message: input.input.message,
      history: input.input.history,
      user_id: input.input.userId,
      system_prompt: retryPrompt,
      temperature: Math.min(temperatureFor(fallbackDecision) + 0.06, 0.94),
      max_tokens: maxTokensFor(input.intuition.presenceState),
    }),
  );
}

function nextStructure(current: CandorStructure): CandorStructure {
  const rotation: Record<CandorStructure, CandorStructure> = {
    fragment: "observation",
    observation: "contrast",
    contrast: "question",
    question: "silence",
    silence: "fragment",
  };

  return rotation[current];
}

function shouldAnalyzeDeeply(memory: CandorMemory) {
  return memory.turnCount > 0 && memory.turnCount % 5 === 0;
}

async function analyzeMemory(message: string, history: CandorTurnInput["history"], memory: CandorMemory) {
  try {
    return await sendCandorJson<Partial<CandorMemory>>({
      systemPrompt: buildAnalysisPrompt(),
      message:
        "current memory:\n" +
        JSON.stringify(memory) +
        "\n\nconversation:\n" +
        [...history, { role: "user" as const, content: message }]
          .slice(-18)
          .map((item) => `${item.role}: ${item.content}`)
          .join("\n"),
      temperature: 0.25,
      maxTokens: 450,
    });
  } catch (error) {
    console.error("Candor memory analysis failed:", error);
    return createEmptyMemory();
  }
}

function temperatureFor(decision: CandorDecision) {
  if (decision.mode === "challenge") return 0.76;
  if (decision.mode === "pause") return 0.68;
  return 0.84;
}

function maxTokensFor(presenceState: PresenceState) {
  if (presenceState.resonance === "high") return 120;
  if (presenceState.clarity === "low") return 90;
  return 105;
}

function isTooSimilar(reply: string, history: string[]) {
  const normalized = normalize(reply);
  if (!normalized) return true;

  return history.slice(-4).some((older) => similarity(normalized, normalize(older)) >= 0.72);
}

function similarity(a: string, b: string) {
  if (!a || !b) return 0;
  const aWords = new Set(a.split(/\s+/));
  const bWords = new Set(b.split(/\s+/));
  const overlap = [...aWords].filter((word) => bWords.has(word)).length;
  const union = new Set([...aWords, ...bWords]).size;
  return union ? overlap / union : 0;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^\w\s?.']/g, "").replace(/\s+/g, " ").trim();
}

function scoreEmotion(text: string) {
  let score = 0;
  if (/\b(hurt|heavy|alone|scared|miss|broken|anxious|ashamed|stuck)\b/.test(text)) score += 2;
  if (/\b(feel|felt|feeling|wish|care|love|hate)\b/.test(text)) score += 1;
  return score;
}

function scoreOpenness(text: string, words: number) {
  let score = words >= 14 ? 2 : words >= 8 ? 1 : 0;
  if (/\b(i|me|my|mine)\b/.test(text)) score += 1;
  if (/\b(maybe|i guess|kind of|sort of)\b/.test(text)) score += 1;
  return Math.min(score, 3);
}

function scoreRepetitionRisk(memory: CandorMemory) {
  const repeatedStructures = new Set(memory.recentStructures.slice(-3)).size <= 1 ? 2 : 0;
  const repeatedOpenings =
    new Set(memory.responseHistory.slice(-3).map((item) => item.split(/\s+/).slice(0, 2).join(" "))).size <= 1 ? 1 : 0;
  return repeatedStructures + repeatedOpenings;
}

function scoreLevel(score: number): PresenceLevel {
  if (score >= 3) return "high";
  if (score >= 1) return "medium";
  return "low";
}

function levelToScore(level: PresenceLevel) {
  if (level === "high") return 2;
  if (level === "medium") return 1;
  return 0;
}

function engagementFromTurn(message: string, intuition: CandorIntuitionState) {
  if (message.trim().split(/\s+/).length >= 18) return "deep_continuation";
  if (intuition.userOpenness === "low") return "brief_turn";
  if (intuition.presenceState.resonance === "high") return "emotionally_open";
  return "continued";
}
