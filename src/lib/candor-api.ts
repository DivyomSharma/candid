export type CandorRole = "user" | "ai";

export type CandorHistoryMessage = {
  role: CandorRole;
  content: string;
};

type ChatPayload = {
  message: string;
  history: CandorHistoryMessage[];
  user_id: string;
};

type ChatResponse = {
  response?: string;
  content?: string;
  message?: string;
};

const baseUrl = process.env.NEXT_PUBLIC_CANDOR_API_URL ?? "http://localhost:8000";

export async function sendCandorMessage(payload: ChatPayload) {
  const response = await fetch(`${baseUrl}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("candor_chat_failed");
  }

  const data = (await response.json()) as ChatResponse;
  return data.response ?? data.content ?? data.message ?? "hmm... stay with that a little.";
}

export function streamCandorMessage(payload: ChatPayload) {
  return fetch(`${baseUrl}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
