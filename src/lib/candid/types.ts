import type { CandidHistoryMessage } from "@/lib/candid-api";

export type CandidMode =
  | "listen"
  | "deepen"
  | "comfort"
  | "appreciate"
  | "challenge"
  | "spark"
  | "pause"
  | "scenario";

export type CandidTone = "soft" | "neutral" | "direct";

export type CandidStructure = "fragment" | "observation" | "contrast" | "question" | "silence" | "playful";

export type CandidSocialMove =
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

export type CandidConversationAtmosphere =
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

export type CandidInteractionProfile = {
  choicePatterns: string[];
  acceptedInsightTypes: string[];
  rejectedInsightTypes: string[];
  engagementSignals: string[];
  interestSignals: Record<string, number>;
};

export type CandidMemory = {
  turnCount: number;
  lastModes: CandidMode[];
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
  profileV4: CandidProfileV4;
  alignmentReady: boolean;
  notes: string[];
  presenceState: PresenceState;
  responseHistory: string[];
  recentStructures: CandidStructure[];
  suppressedPhrases: string[];
  interactionProfile: CandidInteractionProfile;
};

export type CandidSocialState = {
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
  currentAtmosphere: CandidConversationAtmosphere;
  recentEnergy: "flat" | "steady" | "bright" | "heavy" | "chaotic" | "late-night";
  avoid: string[];
  recentMoves: CandidSocialMove[];
};

export type CandidRetrievedMemory = {
  id: string;
  kind: "episodic" | "semantic" | "emotional" | "social" | "practical" | "interaction";
  content: string;
  score: number;
};

export type CandidIntuitionState = {
  emotionalSignal: PresenceLevel;
  userOpenness: PresenceLevel;
  trustLevel: PresenceLevel;
  lastTurnType: CandidMode | "none";
  repetitionRisk: PresenceLevel;
  presenceState: PresenceState;
};

export type CandidDecision = {
  mode: CandidMode;
  tone: CandidTone;
  structure: CandidStructure;
};

export type CandidLearningBias = {
  favoredInsightTypes: string[];
  favoredChoicePatterns: string[];
  favoredStructures: CandidStructure[];
  favoredTopics: string[];
};

export type CandidTurnInput = {
  userId: string;
  message: string;
  history: CandidHistoryMessage[];
  memory: CandidMemory;
  accessTier?: "echo" | "continuity" | "resonance";
  socialState?: CandidSocialState;
  retrievedMemories?: CandidRetrievedMemory[];
  isImproveMode?: boolean;
  currentScreen?: string;
};

export type CandidTurnResult = {
  reply: string;
  memory: CandidMemory;
  socialState: CandidSocialState;
  mode: CandidMode;
  decision: CandidDecision;
  socialMove: CandidSocialMove;
};

export type CandidEntryChoice = {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  patternA: string;
  patternB: string;
};

export type CandidEntryInsight = {
  id: string;
  line: string;
  insightType: string;
};

export type CandidEntrySpotlight = {
  id: string;
  prompt: string;
  options: string[];
  interestTags: string[];
};

export type CandidInitiativeMessage = {
  line: string;
  status: string;
};

export type CandidEntryPayload = {
  choices: CandidEntryChoice[];
  spotlight: CandidEntrySpotlight;
  insights: CandidEntryInsight[];
  initiative: CandidInitiativeMessage;
};

export type CandidLearningEvent = {
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

export type CandidBadge = {
  label: string;
  confidence: number;
  source: "confirmed" | "inferred";
};

export type CandidProfileV4 = {
  currently: CurrentlyV4;
  tonight: string[];
  shelf: Array<{ key: string; value: string }>;
  openLoops: OpenLoopsV4;
  smallThings: string[];
  socialLinks: Record<string, string>;
  photos: string[];
  badges: CandidBadge[];
};
