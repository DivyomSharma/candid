import type {
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
    preferredPace: "balanced",
    depthAppetite: "medium",
    socialBattery: "unknown",
    trustStage: "glimpse",
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
    preferredPace: oneOf(input.preferredPace, ["slow", "balanced", "quick"], empty.preferredPace),
    depthAppetite: oneOf(input.depthAppetite, ["low", "medium", "high"], empty.depthAppetite),
    socialBattery: oneOf(input.socialBattery, ["low", "medium", "high", "unknown"], empty.socialBattery),
    trustStage: oneOf(
      input.trustStage,
      ["glimpse", "warming", "rhythm", "patterns", "context", "continuity", "alignment-ready"],
      empty.trustStage,
    ),
    recentEnergy: oneOf(input.recentEnergy, ["flat", "steady", "bright", "heavy", "chaotic"], empty.recentEnergy),
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
}) {
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

  const humorDelta = /\b(lol|lmao|funny|joke|wild|chaos)\b/.test(text) ? 0.1 : 0;
  const directDelta = /\b(be honest|honestly|realistically|truth|direct)\b/.test(text) ? 0.08 : 0;
  const emotionDelta = /\b(feel|hurt|miss|love|hate|anxious|sad|scared)\b/.test(text) ? 0.12 : words < 6 ? -0.03 : 0;
  const chaosDelta = /\b(chaos|unhinged|random|insane|wild)\b/.test(text) ? 0.12 : 0;

  if (words < 5) avoid.add("long replies");
  if (state.recentMoves.slice(-3).filter((move) => move === "deepen").length >= 2) avoid.add("over-reflection");

  return {
    ...state,
    archetypeSignals: [...archetypes].slice(-10),
    humorTolerance: clamp(state.humorTolerance + humorDelta),
    directnessTolerance: clamp(state.directnessTolerance + directDelta),
    emotionalExpressiveness: clamp(state.emotionalExpressiveness + emotionDelta),
    chaosTolerance: clamp(state.chaosTolerance + chaosDelta),
    preferredPace: words <= 5 ? "quick" : words >= 28 ? "slow" : state.preferredPace,
    depthAppetite: depthAppetiteFor(state.emotionalExpressiveness),
    socialBattery: /\b(crowd|drained|introvert|overwhelmed)\b/.test(text)
      ? "low"
      : /\b(party|people|everyone|group|extrovert)\b/.test(text)
        ? "high"
        : state.socialBattery,
    trustStage: deriveTrustStage(input.memory),
    recentEnergy: deriveEnergy(text, words),
    avoid: [...avoid].slice(-10),
    recentMoves: [...state.recentMoves, input.move].slice(-8),
  };
}

export function understandingLine(state: CandorSocialState) {
  switch (state.trustStage) {
    case "glimpse":
      return "still getting a first read";
    case "warming":
      return "starting to catch their rhythm";
    case "rhythm":
      return "has a feel for pacing and energy";
    case "patterns":
      return "noticing repeated social patterns";
    case "context":
      return "carrying useful context";
    case "continuity":
      return "holding a longer thread";
    case "alignment-ready":
      return "ready for better aligns";
  }
}

function deriveTrustStage(memory: CandorMemory): CandorSocialState["trustStage"] {
  if (memory.alignmentReady) return "alignment-ready";
  if (memory.turnCount >= 18) return "continuity";
  if (memory.turnCount >= 12) return "context";
  if (memory.turnCount >= 8) return "patterns";
  if (memory.turnCount >= 4) return "rhythm";
  if (memory.turnCount >= 1) return "warming";
  return "glimpse";
}

function deriveEnergy(text: string, words: number): CandorSocialState["recentEnergy"] {
  if (/\b(hurt|heavy|alone|scared|miss|broken|anxious|ashamed|stuck)\b/.test(text)) return "heavy";
  if (/\b(lol|lmao|wild|chaos|insane|obsessed)\b/.test(text)) return "chaotic";
  if (words <= 3) return "flat";
  if (words >= 22 || /!/.test(text)) return "bright";
  return "steady";
}

function depthAppetiteFor(value: number): CandorSocialState["depthAppetite"] {
  if (value > 0.62) return "high";
  if (value < 0.22) return "low";
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
  ]);
  return value.filter((item): item is CandorSocialMove => allowed.has(item)).slice(-8);
}

function clamp(value: unknown, fallback = 0.5) {
  return typeof value === "number" ? Math.max(0, Math.min(1, value)) : fallback;
}

function oneOf<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}
