import { logCandorInternal } from "@/lib/candor/logger";
import { resolveCandorRoutePlan } from "@/lib/candor/model-registry";
import { candorProviders } from "@/lib/candor/providers";
import type { CandorProviderResult } from "@/lib/candor/providers";
import type { CandorHistoryMessage, CandorRouteMetadata } from "@/lib/candor/transport";

type OrchestratorPayload = CandorRouteMetadata & {
  message: string;
  history?: CandorHistoryMessage[];
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  jsonMode?: boolean;
};

export type CandorOrchestrationResult = CandorProviderResult & {
  fallbackTriggered: boolean;
  degradedMode: boolean;
  routeReason: string;
  emotionalDepthScore: number;
  continuityDepthScore: number;
};

export async function orchestrateCandorText(payload: OrchestratorPayload): Promise<CandorOrchestrationResult> {
  const plan = resolveCandorRoutePlan({
    route: payload.model_route ?? "default",
    accessTier: payload.access_tier,
    routeReason: payload.route_reason,
    emotionalDepthScore: payload.emotional_depth_score,
    continuityDepthScore: payload.continuity_depth_score,
    includeBackendFallback: true,
  });
  const history = (payload.history ?? []).slice(-plan.historyWindow);
  const errors: string[] = [];

  for (let index = 0; index < plan.attempts.length; index += 1) {
    const attempt = plan.attempts[index];
    const adapter = candorProviders[attempt.provider];

    if (!adapter.isConfigured()) {
      errors.push(`${attempt.provider}:unconfigured`);
      continue;
    }

    const startedAt = Date.now();

    try {
      const result = await adapter.generate(
        {
          systemPrompt: payload.systemPrompt,
          message: payload.message,
          history,
          temperature: payload.temperature,
          maxTokens: payload.maxTokens,
          jsonMode: payload.jsonMode,
        },
        attempt.model,
      );

      const finalResult: CandorOrchestrationResult = {
        ...result,
        fallbackTriggered: index > 0,
        degradedMode: Boolean(attempt.degraded),
        routeReason: plan.reason,
        emotionalDepthScore: plan.emotionalDepthScore,
        continuityDepthScore: plan.continuityDepthScore,
      };

      logCandorInternal({
        event: "model_route_completed",
        context: {
          provider_used: finalResult.provider,
          model_used: finalResult.model,
          model_route: plan.route,
          route_reason: plan.reason,
          token_usage: finalResult.usage?.totalTokens ?? null,
          latency_ms: Date.now() - startedAt,
          degraded_mode: finalResult.degradedMode,
          fallback_triggered: finalResult.fallbackTriggered,
          emotional_depth_score: finalResult.emotionalDepthScore,
          continuity_depth_score: finalResult.continuityDepthScore,
        },
      });

      return finalResult;
    } catch (error) {
      const summary = summarizeError(error);
      errors.push(`${attempt.provider}:${summary}`);
      logCandorInternal({
        event: "model_attempt_failed",
        level: "warn",
        context: {
          provider_used: attempt.provider,
          model_used: attempt.model,
          model_route: plan.route,
          route_reason: plan.reason,
          emotional_depth_score: plan.emotionalDepthScore,
          continuity_depth_score: plan.continuityDepthScore,
          fallback_index: index,
          error_message: summary,
        },
      });
    }
  }

  throw new Error(`candor_orchestration_failed:${errors.join(",")}`);
}

export async function orchestrateCandorJson<T>(
  payload: OrchestratorPayload & {
    strictJson?: boolean;
  },
) {
  try {
    const result = await orchestrateCandorText({
      ...payload,
      jsonMode: payload.strictJson ?? true,
    });
    return parseJsonPayload<T>(result.text);
  } catch (error) {
    logCandorInternal({
      event: "json_orchestration_retrying_loose",
      level: "warn",
      context: {
        model_route: payload.model_route ?? "extraction",
        route_reason: payload.route_reason ?? "structured response",
        error_message: summarizeError(error),
      },
    });
  }

  const loosened = await orchestrateCandorText({
    ...payload,
    jsonMode: false,
  });

  return parseJsonPayload<T>(loosened.text);
}

function parseJsonPayload<T>(content: string | null | undefined) {
  const raw = String(content ?? "").trim();
  if (!raw) throw new Error("empty_json_response");

  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    void error;
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  if (fenced) {
    return JSON.parse(fenced) as T;
  }

  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(raw.slice(firstBrace, lastBrace + 1)) as T;
  }

  throw new Error("invalid_json_response");
}

function summarizeError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}
