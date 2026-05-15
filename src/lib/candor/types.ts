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
  seenScenarios: string[];
  alignmentReady: boolean;
  notes: string[];
  presenceState: PresenceState;
  responseHistory: string[];
  recentStructures: CandorStructure[];
  suppressedPhrases: string[];
  interactionProfile: CandorInteractionProfile;
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
};

export type CandorTurnResult = {
  reply: string;
  memory: CandorMemory;
  mode: CandorMode;
  decision: CandorDecision;
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
