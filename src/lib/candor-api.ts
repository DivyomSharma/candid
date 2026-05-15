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
const openRouterModel = process.env.OPENROUTER_MODEL ?? "anthropic/claude-3.5-haiku";

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

function toGroqRole(role: CandorRole) {
  return role === "ai" ? "assistant" : "user";
}

export async function sendCandorMessage(payload: ChatPayload) {
  if (backendUrl) {
    return sendViaBackend(payload, backendUrl);
  }

  try {
    return await sendViaGroq(payload);
  } catch (error) {
    if (!process.env.OPENROUTER_API_KEY) throw error;
    return sendViaOpenRouter(payload);
  }
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
  return data.response ?? data.reply ?? data.content ?? data.message ?? "wait yeah... stay with that a little.";
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
      temperature: payload.temperature ?? 0.8,
      max_tokens: payload.max_tokens ?? 105,
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

  return data.choices?.[0]?.message?.content ?? "wait yeah... stay with that a little.";
}

async function sendViaOpenRouter(payload: ChatPayload) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("missing_openrouter_api_key");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Candor",
    },
    body: JSON.stringify({
      model: openRouterModel,
      temperature: payload.temperature ?? 0.82,
      max_tokens: payload.max_tokens ?? 105,
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
    throw new Error("openrouter_chat_failed");
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return data.choices?.[0]?.message?.content ?? "wait yeah... stay with that a little.";
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
        temperature: payload.temperature ?? 0.8,
        max_tokens: payload.max_tokens ?? 105,
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
