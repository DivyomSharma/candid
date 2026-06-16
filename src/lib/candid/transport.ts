export type CandidRole = "user" | "ai";

export type CandidHistoryMessage = {
  role: CandidRole;
  content: string;
};

export type CandidAccessTier = "echo" | "continuity" | "resonance";

export type CandidModelRoute =
  | "default"
  | "banter"
  | "reflective"
  | "nuance"
  | "extraction"
  | "initiative"
  | "alignment"
  | "profile"
  | "memory";

export type CandidRouteMetadata = {
  model_route?: CandidModelRoute;
  route_reason?: string;
  emotional_depth_score?: number;
  continuity_depth_score?: number;
  access_tier?: CandidAccessTier;
};
