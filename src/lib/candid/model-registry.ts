import type { CandidAccessTier, CandidModelRoute } from "@/lib/candid/transport";
import type { CandidProviderName } from "@/lib/candid/providers";

type RouteCandidate = {
  provider: CandidProviderName;
  model: string;
  degraded?: boolean;
};

export type CandidRoutePlan = {
  route: CandidModelRoute;
  reason: string;
  emotionalDepthScore: number;
  continuityDepthScore: number;
  historyWindow: number;
  attempts: RouteCandidate[];
};

export const MODEL_REGISTRY = {
  router: process.env.ROUTER_MODEL ?? "llama-3.1-8b-instant",
  chat: process.env.CHAT_MODEL ?? "qwen/qwen-32b",
  deep: process.env.DEEP_MODEL ?? "openai/gpt-oss-120b",
  resonance: process.env.RESONANCE_MODEL ?? "llama-3.3-70b-versatile",
  async: process.env.ASYNC_MODEL ?? "groq/compound",
};

function baseContinuityForTier(tier: CandidAccessTier | undefined) {
  if (tier === "resonance") return 5;
  if (tier === "continuity") return 4;
  return 2;
}

function baseHistoryWindow(route: CandidModelRoute, tier: CandidAccessTier | undefined) {
  const tierBonus = tier === "resonance" ? 8 : tier === "continuity" ? 5 : 2;

  switch (route) {
    case "banter":
      return 6 + Math.min(2, tierBonus);
    case "extraction":
      return 4;
    case "initiative":
      return 16 + tierBonus;
    case "alignment":
    case "profile":
    case "memory":
    case "reflective":
    case "nuance":
      return 18 + tierBonus;
    default:
      return 14 + tierBonus;
  }
}

function dedupeAttempts(attempts: RouteCandidate[]) {
  const seen = new Set<string>();
  return attempts.filter((attempt) => {
    const key = `${attempt.provider}:${attempt.model}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function resolveCandidRoutePlan(input: {
  route: CandidModelRoute;
  accessTier?: CandidAccessTier;
  routeReason?: string;
  emotionalDepthScore?: number;
  continuityDepthScore?: number;
  includeBackendFallback?: boolean;
}) {
  const continuityBase = baseContinuityForTier(input.accessTier);
  const historyWindow = baseHistoryWindow(input.route, input.accessTier);

  let reason = input.routeReason ?? "general relational conversation";
  let emotionalDepthScore = input.emotionalDepthScore ?? 4;
  let continuityDepthScore = input.continuityDepthScore ?? continuityBase;
  let attempts: RouteCandidate[] = [];

  switch (input.route) {
    case "banter":
    case "extraction":
      reason = input.routeReason ?? "rapid-fire social momentum";
      emotionalDepthScore = input.emotionalDepthScore ?? 3;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(2, continuityBase - 1);
      attempts = [
        { provider: "openrouter", model: MODEL_REGISTRY.chat },
        { provider: "groq", model: MODEL_REGISTRY.router },
      ];
      break;
    case "initiative":
    case "nuance":
    case "profile":
    case "memory":
      reason = input.routeReason ?? "deeper conversational routing";
      emotionalDepthScore = input.emotionalDepthScore ?? 6;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(4, continuityBase);
      attempts = [
        { provider: "openrouter", model: MODEL_REGISTRY.deep },
        { provider: "openrouter", model: MODEL_REGISTRY.chat, degraded: true },
      ];
      break;
    case "alignment":
    case "reflective":
      reason = input.routeReason ?? "compatibility and chemistry synthesis";
      emotionalDepthScore = input.emotionalDepthScore ?? 7;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(5, continuityBase);
      attempts = [
        { provider: "groq", model: MODEL_REGISTRY.resonance },
        { provider: "openrouter", model: MODEL_REGISTRY.deep },
      ];
      break;
    default:
      reason = input.routeReason ?? "ongoing relational continuity";
      emotionalDepthScore = input.emotionalDepthScore ?? 5;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(3, continuityBase);
      attempts = [
        { provider: "openrouter", model: MODEL_REGISTRY.chat },
        { provider: "groq", model: MODEL_REGISTRY.router, degraded: true },
      ];
      break;
  }

  if (input.includeBackendFallback) {
    attempts.push({ provider: "backend", model: input.route, degraded: true });
  }

  return {
    route: input.route,
    reason,
    emotionalDepthScore,
    continuityDepthScore,
    historyWindow,
    attempts: dedupeAttempts(attempts),
  } satisfies CandidRoutePlan;
}
