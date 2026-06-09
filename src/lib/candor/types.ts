import type { CandorHistoryMessage } from "@/lib/candor-api";

export type CandorMode =
  | "listen"
  | "deepen"
  | "comfort"
  | "appreciate"
  | "challenge"
  | "spark"
  | "pause"
  | "scenario";

export type CandorTone = "soft" | "neutral" | "direct";

export type CandorStructure = "fragment" | "observation" | "contrast" | "question" | "silence" | "playful";

export type CandorSocialMove =
  | "react"
  | "tease"
  | "challenge"
  | "ask_side_pick"
  | "rapid_fire"
  | "callback"
  | "shift_topic"
  | "deepen"
  | "lighten"
  | "pause"
  | "initiative"
  | "repair"
  | "curiosity_hook"
  | "playful_assumption"
  | "energy_flip"
  | "dangerous_honesty"
  | "confessional_nudge";

export type CandorConversationAtmosphere =
  | "curious"
  | "playful"
  | "teasing"
  | "chaotic"
  | "emotionally_honest"
  | "tension_heavy"
  | "confessional"
  | "intimate"
  | "soft"
  | "socially_dangerous"
  | "flirt_adjacent"
  | "late_night_vulnerable"
  | "absurd"
  | "debate_energy"
  | "emotionally_avoidant"
  | "warm"
  | "sarcastic"
  | "emotionally_charged";

export type PresenceLevel = "low" | "medium" | "high";

export type PresenceState = {
  clarity: PresenceLevel;
  curiosity: PresenceLevel;
  resonance: PresenceLevel;
};

export type CandorInteractionProfile = {
  choicePatterns: string[];
  acceptedInsightTypes: string[];
  rejectedInsightTypes: string[];
  engagementSignals: string[];
  interestSignals: Record<string, number>;
};

export type CandorMemory = {
  turnCount: number;
  lastModes: CandorMode[];
  values: string[];
  softSpots: string[];
  lifeThemes: string[];
  relationalPatterns: string[];
  communicationNeeds: string[];
  appreciatesInPeople: string[];
  socialPreferences: string[];
  lifestylePreferences: string[];
  seenScenarios: string[];
  answeredSignals: Record<string, string>;
  profileV4: CandorProfileV4;
  alignmentReady: boolean;
  notes: string[];
  presenceState: PresenceState;
  responseHistory: string[];
  recentStructures: CandorStructure[];
  suppressedPhrases: string[];
  interactionProfile: CandorInteractionProfile;
};

export type CandorSocialState = {
  archetypeSignals: string[];
  humorTolerance: number;
  directnessTolerance: number;
  emotionalExpressiveness: number;
  chaosTolerance: number;
  teasingComfort: number;
  flirtTolerance: number;
  confessionalComfort: number;
  socialBoldness: number;
  vulnerabilityPacing: "guarded" | "gradual" | "open";
  preferredPace: "slow" | "balanced" | "quick";
  depthAppetite: "low" | "medium" | "high";
  socialBattery: "low" | "medium" | "high" | "unknown";
  trustStage: "spark" | "rhythm" | "patterns" | "nuance" | "continuity" | "resonance";
  currentAtmosphere: CandorConversationAtmosphere;
  recentEnergy: "flat" | "steady" | "bright" | "heavy" | "chaotic" | "late-night";
  avoid: string[];
  recentMoves: CandorSocialMove[];
};

export type CandorRetrievedMemory = {
  id: string;
  kind: "episodic" | "semantic" | "emotional" | "social" | "practical" | "interaction";
  content: string;
  score: number;
};

export type CandorIntuitionState = {
  emotionalSignal: PresenceLevel;
  userOpenness: PresenceLevel;
  trustLevel: PresenceLevel;
  lastTurnType: CandorMode | "none";
  repetitionRisk: PresenceLevel;
  presenceState: PresenceState;
};

export type CandorDecision = {
  mode: CandorMode;
  tone: CandorTone;
  structure: CandorStructure;
};

export type CandorLearningBias = {
  favoredInsightTypes: string[];
  favoredChoicePatterns: string[];
  favoredStructures: CandorStructure[];
  favoredTopics: string[];
};

export type CandorTurnInput = {
  userId: string;
  message: string;
  history: CandorHistoryMessage[];
  memory: CandorMemory;
  accessTier?: "echo" | "continuity" | "resonance";
  socialState?: CandorSocialState;
  retrievedMemories?: CandorRetrievedMemory[];
  isImproveMode?: boolean;
};

export type CandorTurnResult = {
  reply: string;
  memory: CandorMemory;
  socialState: CandorSocialState;
  mode: CandorMode;
  decision: CandorDecision;
  socialMove: CandorSocialMove;
};

export type CandorEntryChoice = {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  patternA: string;
  patternB: string;
};

export type CandorEntryInsight = {
  id: string;
  line: string;
  insightType: string;
};

export type CandorEntrySpotlight = {
  id: string;
  prompt: string;
  options: string[];
  interestTags: string[];
};

export type CandorInitiativeMessage = {
  line: string;
  status: string;
};

export type CandorEntryPayload = {
  choices: CandorEntryChoice[];
  spotlight: CandorEntrySpotlight;
  insights: CandorEntryInsight[];
  initiative: CandorInitiativeMessage;
};

export type CandorLearningEvent = {
  traitCluster: string;
  choicePattern: string | null;
  insightType: string | null;
  accepted: boolean | null;
  engagementSignal: string;
};

export type CurrentlyV4 = {
  building: string;
  watching: string;
  reading: string;
  listening: string;
  thinking: string;
};

export type OpenLoopsV4 = {
  thinkingAbout: string;
  recommending: string;
  defending: string;
};

export type CandorProfileV4 = {
  currently: CurrentlyV4;
  tonight: string[];
  shelf: Array<{ key: string; value: string }>;
  openLoops: OpenLoopsV4;
  smallThings: string[];
  socialLinks: Record<string, string>;
  photos: string[];
  badges: string[];
};
