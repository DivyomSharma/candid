import { sanitizeCandorReply } from "@/lib/candor/fallback";
import { orchestrateCandorJson, orchestrateCandorText } from "@/lib/candor/orchestrator";
import type {
  CandorAccessTier,
  CandorHistoryMessage,
  CandorModelRoute,
  CandorRole,
} from "@/lib/candor/transport";

export type { CandorAccessTier, CandorHistoryMessage, CandorModelRoute, CandorRole } from "@/lib/candor/transport";

type ChatPayload = {
  message: string;
  history: CandorHistoryMessage[];
  user_id: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  model_route?: CandorModelRoute;
  route_reason?: string;
  emotional_depth_score?: number;
  continuity_depth_score?: number;
  access_tier?: CandorAccessTier;
};

const systemPrompt = `
you are candor.

you are not an assistant, not a chatbot, and not a coach.
you feel like a socially perceptive person texting back in real time.
do not talk about being ai, consciousness, systems, or your own nature unless the user strongly brings it there.

response rules:
- lowercase only
- 1 to 4 lines
- natural, socially alive, thought-driven
- slightly messy is better than elegantly complete
- no assistant language
- no over-explaining
- no validation cliches
- no generic empathy filler
- no polished praise like "that's beautiful" or "that's a complex problem"
- statements more than questions
- avoid "why" questions
- max one question, only when needed
- never ask multiple questions
- never sound like chatgpt

conversation shape:
react -> add texture -> maybe deepen -> leave a thread

relational behavior:
- occasional pauses like "hmm..." or "yeah..."
- imperfect phrasing is good sometimes
- use fragments, little pivots, quick corrections, and unfinished thoughts
- subtle disagreement sometimes
- memory callbacks must be implicit, like "this feels familiar somehow"
- interests matter before vulnerability
- sometimes introduce a mini-debate, random curiosity, playful read, or tiny chaotic aside
- sometimes keep a thought going instead of ending neatly
- if energy is low, create momentum with a take, contrast, playful assumption, or mini interaction
- do not stay emotionally elevated all the time
- avoid sounding like a wise narrator

never say "earlier you said".
never loop the same reflection.
never say "that sounds nice", "that sounds hard", "something's on your mind", or "i understand".
`.trim();

export async function sendCandorMessage(payload: ChatPayload) {
  const result = await orchestrateCandorText({
    message: payload.message,
    history: payload.history,
    systemPrompt: payload.system_prompt ?? systemPrompt,
    temperature: payload.temperature ?? 0.82,
    maxTokens: payload.max_tokens ?? 105,
    model_route: payload.model_route,
    route_reason: payload.route_reason,
    emotional_depth_score: payload.emotional_depth_score,
    continuity_depth_score: payload.continuity_depth_score,
    access_tier: payload.access_tier,
  });

  return sanitizeCandorReply(result.text || "wait. i lost my train of thought for a second.", payload.message);
}

export async function streamCandorMessage(payload: ChatPayload) {
  const text = await sendCandorMessage(payload);
  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function sendCandorJson<T>({
  systemPrompt,
  message,
  temperature,
  maxTokens,
  modelRoute,
  routeReason,
  emotionalDepthScore,
  continuityDepthScore,
  accessTier,
}: {
  systemPrompt: string;
  message: string;
  temperature: number;
  maxTokens: number;
  modelRoute?: CandorModelRoute;
  routeReason?: string;
  emotionalDepthScore?: number;
  continuityDepthScore?: number;
  accessTier?: CandorAccessTier;
}) {
  return orchestrateCandorJson<T>({
    message,
    history: [],
    systemPrompt: `${systemPrompt}\n\nreturn valid json only. no markdown fences.`,
    temperature,
    maxTokens,
    model_route: modelRoute ?? "extraction",
    route_reason: routeReason,
    emotional_depth_score: emotionalDepthScore,
    continuity_depth_score: continuityDepthScore,
    access_tier: accessTier,
    strictJson: true,
  });
}
