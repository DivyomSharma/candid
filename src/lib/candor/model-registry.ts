import type { CandorAccessTier, CandorModelRoute } from "@/lib/candor/transport";
import type { CandorProviderName } from "@/lib/candor/providers";

type RouteCandidate = {
  provider: CandorProviderName;
  model: string;
  degraded?: boolean;
};

export type CandorRoutePlan = {
  route: CandorModelRoute;
  reason: string;
  emotionalDepthScore: number;
  continuityDepthScore: number;
  historyWindow: number;
  attempts: RouteCandidate[];
};

const geminiRelationalModel = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const geminiDeepModel = process.env.GEMINI_DEEP_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-2.5-pro";
const geminiSpeedModel = process.env.GEMINI_SPEED_MODEL ?? process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const groqFastModel = process.env.GROQ_FAST_MODEL ?? "llama-3.1-8b-instant";
const groqGeneralModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const openRouterFastModel = process.env.OPENROUTER_FAST_MODEL ?? process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-haiku";
const openRouterDeepModel =
  process.env.OPENROUTER_DEEP_MODEL ??
  process.env.OPENROUTER_REFLECTIVE_MODEL ??
  process.env.OPENROUTER_MODEL ??
  "anthropic/claude-3.5-haiku";

function baseContinuityForTier(tier: CandorAccessTier | undefined) {
  if (tier === "resonance") return 5;
  if (tier === "continuity") return 4;
  return 2;
}

function baseHistoryWindow(route: CandorModelRoute, tier: CandorAccessTier | undefined) {
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

export function resolveCandorRoutePlan(input: {
  route: CandorModelRoute;
  accessTier?: CandorAccessTier;
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
      reason = input.routeReason ?? "rapid-fire social momentum";
      emotionalDepthScore = input.emotionalDepthScore ?? 3;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(2, continuityBase - 1);
      attempts = [
        { provider: "groq", model: groqFastModel },
        { provider: "gemini", model: geminiSpeedModel },
      ];
      break;
    case "extraction":
      reason = input.routeReason ?? "lightweight extraction and classification";
      emotionalDepthScore = input.emotionalDepthScore ?? 2;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(1, continuityBase - 1);
      attempts = [
        { provider: "groq", model: groqFastModel },
        { provider: "gemini", model: geminiSpeedModel },
      ];
      break;
    case "initiative":
      reason = input.routeReason ?? "initiative generation and social spark";
      emotionalDepthScore = input.emotionalDepthScore ?? 6;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(4, continuityBase);
      attempts = [
        { provider: "gemini", model: geminiDeepModel },
        { provider: "openrouter", model: openRouterDeepModel },
        { provider: "groq", model: groqGeneralModel, degraded: true },
      ];
      break;
    case "alignment":
      reason = input.routeReason ?? "compatibility and chemistry synthesis";
      emotionalDepthScore = input.emotionalDepthScore ?? 7;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(5, continuityBase);
      attempts = [
        { provider: "gemini", model: geminiDeepModel },
        { provider: "openrouter", model: openRouterDeepModel },
        { provider: "groq", model: groqGeneralModel, degraded: true },
      ];
      break;
    case "profile":
      reason = input.routeReason ?? "profile evolution and identity synthesis";
      emotionalDepthScore = input.emotionalDepthScore ?? 5;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(4, continuityBase);
      attempts = [
        { provider: "gemini", model: geminiRelationalModel },
        { provider: "openrouter", model: openRouterDeepModel },
        { provider: "groq", model: groqGeneralModel, degraded: true },
      ];
      break;
    case "memory":
      reason = input.routeReason ?? "memory synthesis and continuity retention";
      emotionalDepthScore = input.emotionalDepthScore ?? 5;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(4, continuityBase);
      attempts = [
        { provider: "gemini", model: geminiDeepModel },
        { provider: "groq", model: groqGeneralModel },
        { provider: "openrouter", model: openRouterDeepModel },
      ];
      break;
    case "reflective":
      reason = input.routeReason ?? "emotionally meaningful turn";
      emotionalDepthScore = input.emotionalDepthScore ?? 7;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(4, continuityBase);
      attempts = [
        { provider: "gemini", model: geminiDeepModel },
        { provider: "openrouter", model: openRouterDeepModel },
        { provider: "groq", model: groqGeneralModel, degraded: true },
      ];
      break;
    case "nuance":
      reason = input.routeReason ?? "social tension, contradiction, or subtle pushback";
      emotionalDepthScore = input.emotionalDepthScore ?? 6;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(4, continuityBase);
      attempts = [
        { provider: "gemini", model: geminiDeepModel },
        { provider: "openrouter", model: openRouterDeepModel },
        { provider: "groq", model: groqGeneralModel, degraded: true },
      ];
      break;
    default:
      reason = input.routeReason ?? "ongoing relational continuity";
      emotionalDepthScore = input.emotionalDepthScore ?? 5;
      continuityDepthScore = input.continuityDepthScore ?? Math.max(3, continuityBase);
      attempts = [
        { provider: "gemini", model: geminiRelationalModel },
        { provider: "groq", model: groqFastModel, degraded: true },
        { provider: "openrouter", model: openRouterDeepModel },
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
  } satisfies CandorRoutePlan;
}
