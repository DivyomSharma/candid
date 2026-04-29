import type { CandorHistoryMessage } from "@/lib/candor-api";

export type CandorMode = "listen" | "deepen" | "comfort" | "appreciate" | "challenge" | "scenario";

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
};
