export type CandorRole = "user" | "ai";

export type CandorHistoryMessage = {
  role: CandorRole;
  content: string;
};

export type CandorAccessTier = "echo" | "continuity" | "resonance";

export type CandorModelRoute =
  | "default"
  | "banter"
  | "reflective"
  | "nuance"
  | "extraction"
  | "initiative"
  | "alignment"
  | "profile"
  | "memory";

export type CandorRouteMetadata = {
  model_route?: CandorModelRoute;
  route_reason?: string;
  emotional_depth_score?: number;
  continuity_depth_score?: number;
  access_tier?: CandorAccessTier;
};
