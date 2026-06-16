const DEFAULT_OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_JINA_EMBEDDING_MODEL = "jina-embeddings-v3";
const EXPECTED_DIMENSIONS = 1536;

export type CandidEmbeddingResult = {
  embedding: number[];
  provider: "openai" | "jina";
  model: string;
};

export async function embedCandidText(text: string): Promise<CandidEmbeddingResult | null> {
  const content = text.trim();
  if (!content) return null;

  if (process.env.OPENAI_API_KEY) {
    return embedWithOpenAI(content);
  }

  if (process.env.JINA_API_KEY) {
    return embedWithJina(content);
  }

  return null;
}

async function embedWithOpenAI(text: string): Promise<CandidEmbeddingResult | null> {
  const model = process.env.CANDID_EMBEDDING_MODEL ?? DEFAULT_OPENAI_EMBEDDING_MODEL;
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: text,
      dimensions: EXPECTED_DIMENSIONS,
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };
  const embedding = data.data?.[0]?.embedding;
  if (!isExpectedEmbedding(embedding)) return null;

  return { embedding, provider: "openai", model };
}

async function embedWithJina(text: string): Promise<CandidEmbeddingResult | null> {
  const model = process.env.CANDID_EMBEDDING_MODEL ?? DEFAULT_JINA_EMBEDDING_MODEL;
  const response = await fetch("https://api.jina.ai/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.JINA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      task: "text-matching",
      dimensions: EXPECTED_DIMENSIONS,
      input: [text],
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    data?: Array<{ embedding?: number[] }>;
  };
  const embedding = data.data?.[0]?.embedding;
  if (!isExpectedEmbedding(embedding)) return null;

  return { embedding, provider: "jina", model };
}

function isExpectedEmbedding(value: unknown): value is number[] {
  return Array.isArray(value) && value.length === EXPECTED_DIMENSIONS && value.every((item) => typeof item === "number");
}
