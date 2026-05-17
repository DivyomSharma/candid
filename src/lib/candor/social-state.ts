import type {
  CandorConversationAtmosphere,
  CandorMemory,
  CandorSocialMove,
  CandorSocialState,
  CandorStructure,
} from "@/lib/candor/types";

export function createDefaultSocialState(): CandorSocialState {
  return {
    archetypeSignals: [],
    humorTolerance: 0.5,
    directnessTolerance: 0.45,
    emotionalExpressiveness: 0.35,
    chaosTolerance: 0.45,
    teasingComfort: 0.34,
    flirtTolerance: 0.22,
    confessionalComfort: 0.26,
    socialBoldness: 0.38,
    vulnerabilityPacing: "guarded",
    preferredPace: "balanced",
    depthAppetite: "medium",
    socialBattery: "unknown",
    trustStage: "spark",
    currentAtmosphere: "curious",
    recentEnergy: "steady",
    avoid: ["therapy tone", "too many questions"],
    recentMoves: [],
  };
}

export function normalizeSocialState(value: unknown): CandorSocialState {
  const input = value as Partial<CandorSocialState> | undefined;
  const empty = createDefaultSocialState();

  if (!input || typeof input !== "object") return empty;

  return {
    archetypeSignals: cleanList(input.archetypeSignals, 10),
    humorTolerance: clamp(input.humorTolerance, empty.humorTolerance),
    directnessTolerance: clamp(input.directnessTolerance, empty.directnessTolerance),
    emotionalExpressiveness: clamp(input.emotionalExpressiveness, empty.emotionalExpressiveness),
    chaosTolerance: clamp(input.chaosTolerance, empty.chaosTolerance),
    teasingComfort: clamp(input.teasingComfort, empty.teasingComfort),
    flirtTolerance: clamp(input.flirtTolerance, empty.flirtTolerance),
    confessionalComfort: clamp(input.confessionalComfort, empty.confessionalComfort),
    socialBoldness: clamp(input.socialBoldness, empty.socialBoldness),
    vulnerabilityPacing: oneOf(input.vulnerabilityPacing, ["guarded", "gradual", "open"], empty.vulnerabilityPacing),
    preferredPace: oneOf(input.preferredPace, ["slow", "balanced", "quick"], empty.preferredPace),
    depthAppetite: oneOf(input.depthAppetite, ["low", "medium", "high"], empty.depthAppetite),
    socialBattery: oneOf(input.socialBattery, ["low", "medium", "high", "unknown"], empty.socialBattery),
    trustStage: normalizeTrustStage(input.trustStage),
    currentAtmosphere: oneOf(
      input.currentAtmosphere,
      [
        "curious",
        "playful",
        "teasing",
        "chaotic",
        "emotionally_honest",
        "tension_heavy",
        "confessional",
        "intimate",
        "soft",
        "socially_dangerous",
        "flirt_adjacent",
        "late_night_vulnerable",
        "absurd",
        "debate_energy",
        "emotionally_avoidant",
        "warm",
        "sarcastic",
        "emotionally_charged",
      ],
      empty.currentAtmosphere,
    ),
    recentEnergy: oneOf(
      input.recentEnergy,
      ["flat", "steady", "bright", "heavy", "chaotic", "late-night"],
      empty.recentEnergy,
    ),
    avoid: cleanList(input.avoid, 10).length ? cleanList(input.avoid, 10) : empty.avoid,
    recentMoves: cleanMoves(input.recentMoves),
  };
}

export function updateSocialState(input: {
  current?: CandorSocialState;
  message: string;
  memory: CandorMemory;
  move: CandorSocialMove;
  structure: CandorStructure;
}): CandorSocialState {
  const state = normalizeSocialState(input.current);
  const text = input.message.toLowerCase();
  const words = input.message.trim().split(/\s+/).filter(Boolean).length;
  const archetypes = new Set(state.archetypeSignals);
  const avoid = new Set(state.avoid);

  if (/\b(startup|founder|product|investor|pitch|ship|build|saas)\b/.test(text)) archetypes.add("founder-energy");
  if (/\b(finance|market|trading|portfolio|stocks|banking|accounting)\b/.test(text)) archetypes.add("analytical");
  if (/\b(policy|politics|campaign|parliament|government|election)\b/.test(text)) archetypes.add("public-life-aware");
  if (/\b(gym|training|match|sport|athlete|competition)\b/.test(text)) archetypes.add("competitive");
  if (/\b(lol|lmao|chaos|unhinged|wild|insane)\b/.test(text)) archetypes.add("chaotic-social");
  if (/\b(idk|not sure|maybe|i guess|private|reserved)\b/.test(text)) archetypes.add("reserved");
  if (/\b(explain|logic|reason|data|evidence|framework)\b/.test(text)) archetypes.add("analytical");
  if (/\b(tease|banter|flirt|rizz|chemistry)\b/.test(text)) archetypes.add("chemistry-aware");
  if (/\b(midnight|2am|late night|can't sleep|insomnia)\b/.test(text)) archetypes.add("after-hours");

  const humorDelta = /\b(lol|lmao|funny|joke|wild|chaos|meme)\b/.test(text) ? 0.1 : 0;
  const directDelta = /\b(be honest|honestly|realistically|truth|direct)\b/.test(text) ? 0.08 : 0;
  const emotionDelta = /\b(feel|hurt|miss|love|hate|anxious|sad|scared|vulnerable)\b/.test(text) ? 0.12 : words < 6 ? -0.03 : 0;
  const chaosDelta = /\b(chaos|unhinged|random|insane|wild|dangerous)\b/.test(text) ? 0.12 : 0;
  const teasingDelta = /\b(tease|banter|playful|mess with|bully me a little)\b/.test(text) ? 0.1 : 0;
  const flirtDelta = /\b(chemistry|attraction|flirt|magnetic|crush|obsessed)\b/.test(text) ? 0.08 : 0;
  const confessionalDelta = /\b(be honest|admit|confession|truth is|secretly)\b/.test(text) ? 0.12 : 0;
  const boldnessDelta = /\b(chaos|say it|be direct|dangerous|risk|unfiltered)\b/.test(text) ? 0.08 : 0;

  if (words < 5) avoid.add("long replies");
  if (state.recentMoves.slice(-3).filter((move) => move === "deepen" || move === "confessional_nudge").length >= 2) {
    avoid.add("over-reflection");
  }

  const emotionalExpressiveness = clamp(state.emotionalExpressiveness + emotionDelta);
  const confessionalComfort = clamp(state.confessionalComfort + confessionalDelta + (emotionalExpressiveness > 0.58 ? 0.03 : 0));
  const vulnerabilityPacing =
    confessionalComfort > 0.65 || emotionalExpressiveness > 0.68
      ? "open"
      : confessionalComfort > 0.38 || input.memory.turnCount >= 6
        ? "gradual"
        : "guarded";

  return {
    ...state,
    archetypeSignals: [...archetypes].slice(-10),
    humorTolerance: clamp(state.humorTolerance + humorDelta),
    directnessTolerance: clamp(state.directnessTolerance + directDelta),
    emotionalExpressiveness,
    chaosTolerance: clamp(state.chaosTolerance + chaosDelta),
    teasingComfort: clamp(state.teasingComfort + teasingDelta + (humorDelta ? 0.02 : 0)),
    flirtTolerance: clamp(state.flirtTolerance + flirtDelta),
    confessionalComfort,
    socialBoldness: clamp(state.socialBoldness + boldnessDelta + (state.chaosTolerance > 0.6 ? 0.02 : 0)),
    vulnerabilityPacing,
    preferredPace: words <= 5 ? "quick" : words >= 28 ? "slow" : state.preferredPace,
    depthAppetite: depthAppetiteFor(emotionalExpressiveness, confessionalComfort),
    socialBattery: /\b(crowd|drained|introvert|overwhelmed)\b/.test(text)
      ? "low"
      : /\b(party|people|everyone|group|extrovert)\b/.test(text)
        ? "high"
        : state.socialBattery,
    trustStage: deriveTrustStage(input.memory),
    currentAtmosphere: deriveAtmosphere(text, words, state, input.memory.turnCount),
    recentEnergy: deriveEnergy(text, words),
    avoid: [...avoid].slice(-10),
    recentMoves: [...state.recentMoves, input.move].slice(-8),
  };
}

export function understandingLine(state: CandorSocialState) {
  switch (state.trustStage) {
    case "spark":
      return "candor is beginning to understand your rhythm";
    case "rhythm":
      return "your pace is starting to feel familiar";
    case "patterns":
      return "patterns are becoming clearer lately";
    case "nuance":
      return "candor notices your energy more naturally now";
    case "continuity":
      return "your continuity feels stronger";
    case "resonance":
      return "candor is starting to read the chemistry more deeply";
  }
}

function normalizeTrustStage(value: unknown): CandorSocialState["trustStage"] {
  switch (value) {
    case "glimpse":
    case "warming":
    case "spark":
      return "spark";
    case "rhythm":
      return "rhythm";
    case "patterns":
    case "context":
      return "patterns";
    case "nuance":
      return "nuance";
    case "continuity":
      return "continuity";
    case "alignment-ready":
    case "resonance":
      return "resonance";
    default:
      return "spark";
  }
}

function deriveTrustStage(memory: CandorMemory): CandorSocialState["trustStage"] {
  if (memory.alignmentReady || memory.turnCount >= 18) return "resonance";
  if (memory.turnCount >= 12) return "continuity";
  if (memory.turnCount >= 8) return "nuance";
  if (memory.turnCount >= 4) return "patterns";
  if (memory.turnCount >= 2) return "rhythm";
  return "spark";
}

function deriveEnergy(text: string, words: number): CandorSocialState["recentEnergy"] {
  if (/\b(hurt|heavy|alone|scared|miss|broken|anxious|ashamed|stuck)\b/.test(text)) return "heavy";
  if (/\b(midnight|2am|late night|can't sleep|insomnia)\b/.test(text) || isLateNightNow()) return "late-night";
  if (/\b(lol|lmao|wild|chaos|insane|obsessed)\b/.test(text)) return "chaotic";
  if (words <= 3) return "flat";
  if (words >= 22 || /!/.test(text)) return "bright";
  return "steady";
}

function deriveAtmosphere(
  text: string,
  words: number,
  state: CandorSocialState,
  turnCount: number,
): CandorConversationAtmosphere {
  if (/\b(midnight|2am|late night|can't sleep|insomnia)\b/.test(text) || (isLateNightNow() && turnCount >= 3)) {
    return state.confessionalComfort > 0.32 ? "late_night_vulnerable" : "soft";
  }
  if (/\b(be honest|admit|truth is|secretly)\b/.test(text)) return "confessional";
  if (/\b(flirt|chemistry|attraction|magnetic)\b/.test(text)) return "flirt_adjacent";
  if (/\b(hot take|debate|argue|fight me)\b/.test(text)) return "debate_energy";
  if (/\b(tease|banter|mess with me)\b/.test(text)) return "teasing";
  if (/\b(chaos|unhinged|wild|absurd)\b/.test(text)) return "chaotic";
  if (/\b(hurt|miss|love|scared|vulnerable)\b/.test(text)) return "emotionally_honest";
  if (/\b(sarcasm|sarcastic)\b/.test(text)) return "sarcastic";
  if (words <= 4 && state.humorTolerance > 0.56) return "playful";
  if (state.confessionalComfort > 0.62 && turnCount >= 6) return "intimate";
  if (state.socialBoldness > 0.62 && state.teasingComfort > 0.48) return "socially_dangerous";
  if (state.emotionalExpressiveness > 0.55) return "warm";
  return "curious";
}

function isLateNightNow() {
  const hour = new Date().getHours();
  return hour >= 23 || hour <= 4;
}

function depthAppetiteFor(
  emotionalExpressiveness: number,
  confessionalComfort: number,
): CandorSocialState["depthAppetite"] {
  if (emotionalExpressiveness > 0.62 || confessionalComfort > 0.58) return "high";
  if (emotionalExpressiveness < 0.22 && confessionalComfort < 0.24) return "low";
  return "medium";
}

function cleanList(value: unknown, max: number) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, max);
}

function cleanMoves(value: unknown): CandorSocialMove[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<CandorSocialMove>([
    "react",
    "tease",
    "challenge",
    "ask_side_pick",
    "rapid_fire",
    "callback",
    "shift_topic",
    "deepen",
    "lighten",
    "pause",
    "initiative",
    "repair",
    "curiosity_hook",
    "playful_assumption",
    "energy_flip",
    "dangerous_honesty",
    "confessional_nudge",
  ]);
  return value.filter((item): item is CandorSocialMove => allowed.has(item)).slice(-8);
}

function clamp(value: unknown, fallback = 0.5) {
  return typeof value === "number" ? Math.max(0, Math.min(1, value)) : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
