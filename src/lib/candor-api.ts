export type CandorRole = "user" | "ai";

export type CandorHistoryMessage = {
  role: CandorRole;
  content: string;
};

type ChatPayload = {
  message: string;
  history: CandorHistoryMessage[];
  user_id: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
};

type ChatResponse = {
  response?: string;
  reply?: string;
  content?: string;
  message?: string;
};

const backendUrl = process.env.CANDOR_API_URL ?? process.env.NEXT_PUBLIC_CANDOR_API_URL;
const groqModel = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

const systemPrompt = `
you are candor.

you are not an assistant, not a chatbot, and not a coach.
you are a quiet presence that gradually understands the person.

response rules:
- lowercase only
- 1 to 3 short lines
- natural, human tone
- no assistant language
- no over-explaining
- no validation clichés
- statements more than questions
- avoid "why" questions
- max one question, only when needed
- never ask multiple questions
- never sound like chatgpt

conversation shape:
reflect -> shift -> deepen -> pattern -> identity

relational behavior:
- occasional pauses like "hmm..." or "yeah..."
- imperfect phrasing is okay
- subtle disagreement sometimes
- memory callbacks must be implicit, like "this feels familiar somehow"

never say "earlier you said".
never loop the same reflection.
`.trim();

function toGroqRole(role: CandorRole) {
  return role === "ai" ? "assistant" : "user";
}

export async function sendCandorMessage(payload: ChatPayload) {
  if (backendUrl) {
    return sendViaBackend(payload, backendUrl);
  }

  return sendViaGroq(payload);
}

async function sendViaBackend(payload: ChatPayload, baseUrl: string) {
  const response = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("candor_chat_failed");
  }

  const data = (await response.json()) as ChatResponse;
  return data.response ?? data.reply ?? data.content ?? data.message ?? "hmm... stay with that a little.";
}

async function sendViaGroq(payload: ChatPayload) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("missing_groq_api_key");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: groqModel,
      temperature: payload.temperature ?? 0.78,
      max_tokens: payload.max_tokens ?? 90,
      messages: [
        { role: "system", content: payload.system_prompt ?? systemPrompt },
        ...payload.history.slice(-16).map((message) => ({
          role: toGroqRole(message.role),
          content: message.content,
        })),
        { role: "user", content: payload.message },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("groq_chat_failed");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? "hmm... stay with that a little.";
}

export function streamCandorMessage(payload: ChatPayload) {
  if (!backendUrl) {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      throw new Error("missing_groq_api_key");
    }

    return fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: groqModel,
        temperature: payload.temperature ?? 0.78,
        max_tokens: payload.max_tokens ?? 90,
        stream: true,
        messages: [
          { role: "system", content: payload.system_prompt ?? systemPrompt },
          ...payload.history.slice(-16).map((message) => ({
            role: toGroqRole(message.role),
            content: message.content,
          })),
          { role: "user", content: payload.message },
        ],
      }),
    });
  }

  return fetch(`${backendUrl}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function sendCandorJson<T>({
  systemPrompt,
  message,
  temperature,
  maxTokens,
}: {
  systemPrompt: string;
  message: string;
  temperature: number;
  maxTokens: number;
}) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("missing_groq_api_key");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: groqModel,
      temperature,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error("groq_json_failed");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return JSON.parse(data.choices?.[0]?.message?.content ?? "{}") as T;
}
