import type { CandorHistoryMessage } from "@/lib/candor/transport";

type JsonRecord = Record<string, unknown>;

export type CandorProviderName = "gemini" | "groq" | "openrouter" | "backend";

export type CandorProviderPayload = {
  systemPrompt: string;
  message: string;
  history: CandorHistoryMessage[];
  temperature: number;
  maxTokens: number;
  jsonMode?: boolean;
};

export type CandorProviderUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type CandorProviderResult = {
  provider: CandorProviderName;
  model: string;
  text: string;
  usage?: CandorProviderUsage;
};

export type CandorProviderAdapter = {
  isConfigured(): boolean;
  generate(payload: CandorProviderPayload, model: string): Promise<CandorProviderResult>;
};

const backendUrl = process.env.CANDOR_API_URL ?? process.env.NEXT_PUBLIC_CANDOR_API_URL;

function toOpenAiMessages(payload: CandorProviderPayload) {
  return [
    { role: "system", content: payload.systemPrompt },
    ...payload.history.map((message) => ({
      role: message.role === "ai" ? "assistant" : "user",
      content: message.content,
    })),
    { role: "user", content: payload.message },
  ];
}

function toGeminiContents(payload: CandorProviderPayload) {
  return [
    ...payload.history.map((message) => ({
      role: message.role === "ai" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
    { role: "user", parts: [{ text: payload.message }] },
  ];
}

async function readErrorResponse(response: Response, fallback: string) {
  const text = await response.text().catch(() => "");
  return `${fallback}:${response.status}${text ? `:${text.slice(0, 240)}` : ""}`;
}

function geminiTextFromResponse(data: JsonRecord) {
  const candidates = Array.isArray(data.candidates) ? (data.candidates as JsonRecord[]) : [];
  const firstCandidate = candidates[0] as JsonRecord | undefined;
  const content = (firstCandidate?.content as JsonRecord | undefined) ?? undefined;
  const parts = Array.isArray(content?.parts) ? (content.parts as JsonRecord[]) : [];
  if (!Array.isArray(parts)) return "";
  return parts
    .map((part) => (typeof part.text === "string" ? part.text : ""))
    .filter(Boolean)
    .join("\n")
    .trim();
}

export const candorProviders: Record<CandorProviderName, CandorProviderAdapter> = {
  gemini: {
    isConfigured() {
      return Boolean(
        process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      );
    },
    async generate(payload, model) {
      const apiKey =
        process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (!apiKey) throw new Error("missing_gemini_api_key");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: payload.systemPrompt }],
            },
            contents: toGeminiContents(payload),
            generationConfig: {
              temperature: payload.temperature,
              maxOutputTokens: payload.maxTokens,
              responseMimeType: payload.jsonMode ? "application/json" : "text/plain",
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(await readErrorResponse(response, "gemini_generation_failed"));
      }

      const data = (await response.json()) as JsonRecord;
      const usageMetadata = (data.usageMetadata as JsonRecord | undefined) ?? undefined;
      return {
        provider: "gemini",
        model,
        text: geminiTextFromResponse(data),
        usage: {
          inputTokens: typeof usageMetadata?.promptTokenCount === "number" ? usageMetadata.promptTokenCount : undefined,
          outputTokens:
            typeof usageMetadata?.candidatesTokenCount === "number" ? usageMetadata.candidatesTokenCount : undefined,
          totalTokens: typeof usageMetadata?.totalTokenCount === "number" ? usageMetadata.totalTokenCount : undefined,
        },
      };
    },
  },
  groq: {
    isConfigured() {
      return Boolean(process.env.GROQ_API_KEY);
    },
    async generate(payload, model) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("missing_groq_api_key");

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: payload.temperature,
          max_tokens: payload.maxTokens,
          ...(payload.jsonMode ? { response_format: { type: "json_object" } } : {}),
          messages: toOpenAiMessages(payload),
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorResponse(response, "groq_generation_failed"));
      }

      const data = (await response.json()) as JsonRecord;
      const choices = Array.isArray(data.choices) ? (data.choices as JsonRecord[]) : [];
      const firstChoice = choices[0] as JsonRecord | undefined;
      const message = (firstChoice?.message as JsonRecord | undefined) ?? undefined;
      const usage = (data.usage as JsonRecord | undefined) ?? undefined;
      const text = typeof message?.content === "string" ? message.content.trim() : "";
      if (!text) throw new Error("empty_response_generated");

      return {
        provider: "groq",
        model,
        text,
        usage: {
          inputTokens: typeof usage?.prompt_tokens === "number" ? usage.prompt_tokens : undefined,
          outputTokens: typeof usage?.completion_tokens === "number" ? usage.completion_tokens : undefined,
          totalTokens: typeof usage?.total_tokens === "number" ? usage.total_tokens : undefined,
        },
      };
    },
  },
  openrouter: {
    isConfigured() {
      return Boolean(process.env.OPENROUTER_API_KEY);
    },
    async generate(payload, model) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("missing_openrouter_api_key");

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
          "X-Title": "Candor",
        },
        body: JSON.stringify({
          model,
          temperature: payload.temperature,
          max_tokens: payload.maxTokens,
          messages: toOpenAiMessages(payload),
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorResponse(response, "openrouter_generation_failed"));
      }

      const data = (await response.json()) as JsonRecord;
      const choices = Array.isArray(data.choices) ? (data.choices as JsonRecord[]) : [];
      const firstChoice = choices[0] as JsonRecord | undefined;
      const message = (firstChoice?.message as JsonRecord | undefined) ?? undefined;
      const usage = (data.usage as JsonRecord | undefined) ?? undefined;
      const text = typeof message?.content === "string" ? message.content.trim() : "";
      if (!text) throw new Error("empty_response_generated");

      return {
        provider: "openrouter",
        model,
        text,
        usage: {
          inputTokens: typeof usage?.prompt_tokens === "number" ? usage.prompt_tokens : undefined,
          outputTokens: typeof usage?.completion_tokens === "number" ? usage.completion_tokens : undefined,
          totalTokens: typeof usage?.total_tokens === "number" ? usage.total_tokens : undefined,
        },
      };
    },
  },
  backend: {
    isConfigured() {
      return Boolean(backendUrl);
    },
    async generate(payload, model) {
      if (!backendUrl) throw new Error("missing_backend_url");

      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: payload.message,
          history: payload.history,
          user_id: "candor-orchestrator",
          system_prompt: payload.systemPrompt,
          temperature: payload.temperature,
          max_tokens: payload.maxTokens,
          model_route: model,
        }),
      });

      if (!response.ok) {
        throw new Error(await readErrorResponse(response, "backend_generation_failed"));
      }

      const data = (await response.json()) as JsonRecord;
      return {
        provider: "backend",
        model,
        text: String(data.response ?? data.reply ?? data.content ?? data.message ?? "").trim(),
      };
    },
  },
};
