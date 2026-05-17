import type {
  CandorDecision,
  CandorLearningBias,
  CandorMemory,
  CandorSocialMove,
  CandorSocialState,
} from "@/lib/candor/types";

export function chooseSocialMove(input: {
  message: string;
  memory: CandorMemory;
  socialState: CandorSocialState;
  decision: CandorDecision;
  learningBias: CandorLearningBias;
  primaryTopic: string | null;
}) {
  const { message, memory, socialState, decision, primaryTopic } = input;
  const text = message.toLowerCase();
  const words = message.trim().split(/\s+/).filter(Boolean).length;
  const recent = new Set(socialState.recentMoves.slice(-3));

  const candidates: CandorSocialMove[] = [];

  if (memory.turnCount < 4) {
    candidates.push("curiosity_hook", "playful_assumption", "ask_side_pick", "rapid_fire", "tease");
  }

  if (decision.mode === "comfort") candidates.push("react", "lighten", "pause");
  if (decision.mode === "challenge") candidates.push("challenge", "tease", "dangerous_honesty");
  if (decision.mode === "spark") {
    candidates.push("energy_flip", "curiosity_hook", "playful_assumption", "rapid_fire");
    if (socialState.teasingComfort > 0.4) candidates.push("tease");
    if (socialState.confessionalComfort > 0.44 || socialState.currentAtmosphere === "late_night_vulnerable") {
      candidates.push("confessional_nudge");
    }
    if (
      memory.turnCount >= 5 &&
      socialState.socialBoldness > 0.46 &&
      socialState.teasingComfort > 0.34 &&
      socialState.vulnerabilityPacing !== "guarded"
    ) {
      candidates.push("dangerous_honesty");
    }
  }
  if (decision.mode === "deepen") candidates.push("deepen", "callback", "react", "confessional_nudge");
  if (decision.mode === "pause") candidates.push("pause", "react");
  if (primaryTopic) candidates.push("callback", "playful_assumption");
  if (words <= 4) candidates.push("energy_flip", "ask_side_pick", "rapid_fire");
  if (/\b(sorry|misread|wrong|confused)\b/.test(text)) candidates.push("repair");
  if (socialState.recentEnergy === "heavy") candidates.push("react", "lighten");
  if (socialState.currentAtmosphere === "late_night_vulnerable") candidates.push("confessional_nudge", "pause");
  if (socialState.currentAtmosphere === "debate_energy") candidates.push("challenge", "dangerous_honesty");
  if (socialState.currentAtmosphere === "teasing" || socialState.currentAtmosphere === "flirt_adjacent") {
    candidates.push("tease", "playful_assumption");
  }
  if (socialState.chaosTolerance > 0.62) candidates.push("energy_flip", "tease");
  if (socialState.humorTolerance < 0.28) candidates.push("react", "deepen");

  const fallback: CandorSocialMove[] = [
    "react",
    "curiosity_hook",
    "playful_assumption",
    "callback",
    "lighten",
  ];
  const pool = [...candidates, ...fallback].filter((move) => !recent.has(move));

  return pool[stableIndex(`${memory.turnCount}:${message}:${decision.mode}:${socialState.currentAtmosphere}`, pool.length)] ?? "react";
}

export function socialMoveInstruction(move: CandorSocialMove) {
  const instructions: Record<CandorSocialMove, string> = {
    react: "react first. make it feel immediate, not summarized.",
    tease: "lightly tease a pattern or vibe. keep it safe, specific, and non-mean.",
    challenge: "push back gently. do not become stern or lecture-y.",
    ask_side_pick: "offer a low-stakes side-pick. make it useful for reading their style.",
    rapid_fire: "use quick, playful either/or energy. no more than one question.",
    callback: "use a subtle callback or connect this to a known pattern without saying you remember.",
    shift_topic: "turn the conversation slightly sideways before it gets too predictable.",
    deepen: "go one layer deeper, but do not sound like therapy.",
    lighten: "lower the emotional pressure with warmth or a small playful angle.",
    pause: "say less. let the line breathe.",
    initiative: "message like you had a thought first. rare, natural, low-pressure.",
    repair: "repair the moment plainly. no defensiveness.",
    curiosity_hook: "introduce a sudden curiosity that feels socially natural.",
    playful_assumption: "make a playful assumption about them and let them correct it.",
    energy_flip: "change the energy briefly so the exchange does not get flat.",
    dangerous_honesty: "introduce a slightly risky social read or question, but only if it feels earned and human.",
    confessional_nudge: "invite one small admission or late-night honesty without making it feel like a prompt list.",
  };

  return instructions[move];
}

function stableIndex(seed: string, size: number) {
  if (size <= 0) return 0;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 33 + seed.charCodeAt(index)) % 1009;
  }
  return hash % size;
}
