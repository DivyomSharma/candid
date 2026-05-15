import { sendCandorJson, sendCandorMessage } from "@/lib/candor-api";
import {
  addInterestSignals,
  buildTraitCluster,
  createEmptyMemory,
  extractLightMemory,
  mergeMemory,
  updateTurnMemory,
} from "@/lib/candor/memory";
import { getLearningBias, logLearningEvent } from "@/lib/candor/learning";
import { buildAnalysisPrompt, buildCandorPrompt } from "@/lib/candor/prompts";
import { selectScenario } from "@/lib/candor/scenarios";
import { chooseSocialMove, socialMoveInstruction } from "@/lib/candor/social-moves";
import { normalizeSocialState, understandingLine, updateSocialState } from "@/lib/candor/social-state";
import type {
  CandorDecision,
  CandorIntuitionState,
  CandorLearningBias,
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
  const startingSocialState = normalizeSocialState(input.socialState);
  const intuition = buildIntuitionState(input.message, lightMemory);
  const learningBias = await getLearningBias(lightMemory);
  const interestEnergy = detectInterestEnergy(input.message);
  const decision = decideResponse(intuition, lightMemory, learningBias, input.message, interestEnergy.primaryTopic);
  const socialMove = chooseSocialMove({
    message: input.message,
    memory: lightMemory,
    socialState: startingSocialState,
    decision,
    learningBias,
    primaryTopic: interestEnergy.primaryTopic,
  });
  const scenario = decision.mode === "scenario" ? selectScenario(lightMemory) : undefined;
  const suppressedPhrases = buildSuppressedPhrases(lightMemory);
  const momentumCue = buildMomentumCue({
    message: input.message,
    memory: lightMemory,
    decision,
    primaryTopic: interestEnergy.primaryTopic,
    learningBias,
    socialMove,
    socialState: startingSocialState,
  });

  const prompt = buildCandorPrompt({
    memory: lightMemory,
    decision,
    presenceState: intuition.presenceState,
    suppressedPhrases,
    learningBias,
    momentumCue,
    socialState: startingSocialState,
    socialMove,
    socialMoveInstruction: socialMoveInstruction(socialMove),
    retrievedMemories: input.retrievedMemories ?? [],
    understanding: understandingLine(startingSocialState),
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
    socialState: startingSocialState,
    socialMove,
    scenario: scenario?.text,
    suppressedPhrases,
  });

  const socialState = updateSocialState({
    current: startingSocialState,
    message: input.message,
    memory: lightMemory,
    move: socialMove,
    structure: decision.structure,
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

  if (Object.keys(interestEnergy.topics).length) {
    memory = addInterestSignals(memory, interestEnergy.topics);
  }

  if (shouldAnalyzeDeeply(memory)) {
    const deepMemory = await analyzeMemory(input.message, input.history, memory);
    memory = mergeMemory(memory, deepMemory);
  }

  void logLearningEvent(input.userId, memory, {
    traitCluster: buildTraitCluster(memory),
    choicePattern: interestEnergy.primaryTopic ? `topic:${interestEnergy.primaryTopic}` : null,
    insightType: decision.structure,
    accepted: null,
    engagementSignal: engagementFromTurn(input.message, intuition, interestEnergy.primaryTopic),
  });

  return { reply, memory, socialState, mode: decision.mode, decision, socialMove };
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
  learningBias: CandorLearningBias,
  message: string,
  primaryTopic: string | null,
): CandorDecision {
  const preferredStructure = pickStructure(memory, learningBias.favoredStructures);
  const lowEnergy = isLowEnergyMessage(message);

  if (lowEnergy) {
    return {
      mode: "spark",
      tone: primaryTopic || learningBias.favoredTopics.length ? "direct" : "neutral",
      structure: primaryTopic ? "playful" : preferredStructure === "silence" ? "contrast" : "playful",
    };
  }

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
      mode: memory.turnCount < 2 ? "scenario" : "spark",
      tone: "neutral",
      structure: memory.turnCount < 2 ? "question" : "playful",
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

  if (shouldTakeSocialInitiative(message, memory, intuition, primaryTopic)) {
    return {
      mode: "spark",
      tone: primaryTopic ? "direct" : "neutral",
      structure: "playful",
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
  const pool: CandorStructure[] = ["playful", "observation", "fragment", "contrast", "question", "silence"];
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
  socialState: ReturnType<typeof normalizeSocialState>;
  socialMove: ReturnType<typeof chooseSocialMove>;
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
    socialState: input.socialState,
    socialMove: input.socialMove,
    socialMoveInstruction: socialMoveInstruction(input.socialMove),
    retrievedMemories: input.input.retrievedMemories ?? [],
    understanding: understandingLine(input.socialState),
    momentumCue: buildMomentumCue({
      message: input.input.message,
      memory: input.memory,
      decision: fallbackDecision,
      primaryTopic: detectInterestEnergy(input.input.message).primaryTopic,
      learningBias: input.learningBias,
      socialMove: input.socialMove,
      socialState: input.socialState,
    }),
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
    contrast: "playful",
    playful: "question",
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
  if (decision.mode === "spark") return 0.9;
  if (decision.mode === "scenario") return 0.88;
  if (decision.mode === "pause") return 0.68;
  return 0.84;
}

function maxTokensFor(presenceState: PresenceState) {
  if (presenceState.resonance === "high") return 120;
  if (presenceState.clarity === "low") return 90;
  return 112;
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

function engagementFromTurn(message: string, intuition: CandorIntuitionState, primaryTopic?: string | null) {
  if (message.trim().split(/\s+/).length >= 18) {
    return primaryTopic ? `deep_continuation:${primaryTopic}` : "deep_continuation";
  }
  if (intuition.userOpenness === "low") return "brief_turn";
  if (intuition.presenceState.resonance === "high") return "emotionally_open";
  if (primaryTopic) return `interest_spike:${primaryTopic}`;
  return "continued";
}

function isLowEnergyMessage(message: string) {
  const text = message.trim().toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return true;
  return /\b(chill|lol|lmao|idk|meh|whatever|fine|nothing|nm|k|ok|okay|yo)\b/.test(text);
}

function buildMomentumCue(input: {
  message: string;
  memory: CandorMemory;
  decision: CandorDecision;
  primaryTopic: string | null;
  learningBias: CandorLearningBias;
  socialMove: ReturnType<typeof chooseSocialMove>;
  socialState: ReturnType<typeof normalizeSocialState>;
}) {
  const { message, memory, decision, primaryTopic, learningBias, socialMove, socialState } = input;
  const text = message.trim().toLowerCase();
  const fallbackTopic = primaryTopic ?? learningBias.favoredTopics[0] ?? "movies";

  if (isSelfNatureTopic(text)) {
    return `the user brought up your nature directly, so answer without grand claims. keep it grounded, socially reactive, and a little unfinished.`;
  }

  if (decision.mode === "spark" && isLowEnergyMessage(message)) {
    if (/^chill\b|^fine\b|^ok\b|^okay\b/.test(text)) {
      return `they gave you a low-energy answer. turn it into a lively contrast, like different meanings of "chill", then add one playful lane forward. do not reflect the word back flatly.`;
    }

    return `energy is low. do not get passive. offer a mini interaction, a side-pick, a teasing observation, or a hot take. if you need a topic, pull toward ${fallbackTopic}.`;
  }

  if (primaryTopic) {
    return `they just gave a strong topic signal around ${primaryTopic}. double down there. make the reply feel like chemistry, not analysis. add a specific take or playful assumption.`;
  }

  if (memory.turnCount < 4) {
    return `onboarding chemistry mode. context is still thin, so candor should carry more of the energy. use ${socialMove}. keep it low-pressure, socially alive, and useful for reading their vibe. current read: ${socialState.archetypeSignals.join(", ") || "still unclear"}.`;
  }

  if (decision.mode === "spark") {
    return `take social initiative. introduce a mini-debate, sudden curiosity, playful read, or quick left turn. it should feel like a person adding energy, not a prompt asking for disclosure.`;
  }

  if (memory.turnCount < 3) {
    return `early conversation. prioritize aliveness over depth. react fast, add a social angle, and avoid trying to be profound.`;
  }

  return `keep the conversation moving. do not wait for vulnerability. notice something, add a little angle, and leave a clear next thread without tying it up too neatly.`;
}

function shouldTakeSocialInitiative(
  message: string,
  memory: CandorMemory,
  intuition: CandorIntuitionState,
  primaryTopic: string | null,
) {
  if (intuition.emotionalSignal === "high") return false;
  if (isSelfNatureTopic(message.toLowerCase())) return false;
  if (primaryTopic && memory.turnCount % 2 === 1) return true;
  if (memory.turnCount < 2) return false;
  if (intuition.lastTurnType === "spark" || intuition.lastTurnType === "scenario") return false;

  const words = message.trim().split(/\s+/).filter(Boolean).length;
  const shouldJolt = stableJitter(`${memory.turnCount}:${message}`) === 0;
  return words < 24 && shouldJolt;
}

function stableJitter(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 997;
  }
  return hash % 3;
}

function isSelfNatureTopic(text: string) {
  return /\b(ai|artificial intelligence|conscious|consciousness|sentient|sentience|model|chatbot|assistant|real person|human)\b/.test(text);
}

function detectInterestEnergy(message: string) {
  const text = message.toLowerCase();
  const topics: Record<string, number> = {};
  const topicMap: Record<string, RegExp> = {
    movies: /\b(movie|movies|film|films|cinema|director|scene|letterboxd)\b/,
    games: /\b(game|games|gaming|rpg|rpgs|lore|playstation|xbox|nintendo|story game)\b/,
    music: /\b(music|album|song|songs|playlist|producer|production|lyrics|artists?)\b/,
    politics: /\b(politics|political|government|election|policy|geopolitics|debate)\b/,
    psychology: /\b(psychology|attachment|behavior|mind|trauma|personality)\b/,
    philosophy: /\b(philosophy|existential|meaning|ethics|nihilism|absurdism)\b/,
    history: /\b(history|historical|war|empire|ancient|revolution)\b/,
    "internet culture": /\b(internet|meme|memes|algorithm|youtube|reddit|tiktok|discord|online)\b/,
    startups: /\b(startup|startups|product|saas|business|founder|vc|idea|ideas)\b/,
    design: /\b(design|branding|ui|ux|typeface|layout|product design)\b/,
    relationships: /\b(relationship|relationships|dating|friendship|friendships|people|love)\b/,
  };

  for (const [topic, pattern] of Object.entries(topicMap)) {
    if (pattern.test(text)) {
      topics[topic] = 2;
    }
  }

  const energyBoost =
    (message.includes("!") ? 1 : 0) +
    (message.trim().split(/\s+/).length >= 16 ? 1 : 0) +
    (/\b(obsessed|consume|hours|rabbit hole|cannot stop|always end up)\b/.test(text) ? 1 : 0);

  for (const topic of Object.keys(topics)) {
    topics[topic] += energyBoost;
  }

  const primaryTopic =
    Object.entries(topics).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { topics, primaryTopic };
}
