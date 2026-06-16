import type { CandidRetrievedMemory } from "@/lib/candid/types";
import { embedCandidText } from "@/lib/candid/embeddings";
import { logCandidInternal } from "@/lib/candid/logger";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MEMORY_KEYWORDS = /\b(family|breakup|ex|work|friend|dating|relationship|music|movie|film|game|politics|startup|founder|finance|design|gym|sleep|travel|texting|ignored|honest|safe|party|drink|smoke|anxious|overwhelmed|argument|conflict)\b/gi;

export async function retrieveRelationalMemories(input: {
  userId: string;
  message: string;
  limit?: number;
}): Promise<CandidRetrievedMemory[]> {
  const keywords = extractKeywords(input.message);
  const embedded = await safeEmbedCandidText(input.message);

  if (embedded) {
    const vectorResults = await retrieveVectorMemories({
      userId: input.userId,
      message: input.message,
      embedding: embedded.embedding,
      limit: input.limit ?? 6,
    });

    if (vectorResults.length) {
      return vectorResults;
    }
  }

  if (!keywords.length) {
    return retrieveRecentHighSignalMemories(input.userId, input.limit ?? 4);
  }

  return retrieveKeywordMemories({
    userId: input.userId,
    message: input.message,
    keywords,
    limit: input.limit ?? 6,
  });
}

async function retrieveVectorMemories(input: {
  userId: string;
  message: string;
  embedding: number[];
  limit: number;
}): Promise<CandidRetrievedMemory[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin.rpc("match_candid_memories", {
      query_user_id: input.userId,
      query_embedding: input.embedding,
      query_text: input.message,
      match_count: Math.max(12, input.limit * 3),
    });

    if (error || !Array.isArray(data)) return [];

    return data
      .map((item) => ({
        id: String(item.id),
        kind: item.kind as CandidRetrievedMemory["kind"],
        content: String(item.content),
        score: Number(item.score ?? 0),
      }))
      .filter((item) => item.content)
      .slice(0, input.limit);
  } catch (error) {
    logCandidInternal({ event: "vector_memory_retrieval_skipped", level: "warn", error });
    return [];
  }
}

async function retrieveKeywordMemories(input: {
  userId: string;
  message: string;
  keywords: string[];
  limit: number;
}) {
  const { userId, keywords } = input;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const query = keywords.map((keyword) => `content.ilike.%${keyword}%`).join(",");
    const { data, error } = await supabaseAdmin
      .from("candid_memory_events")
      .select("id, kind, content, importance, emotional_intensity, created_at")
      .eq("user_id", input.userId)
      .or(query)
      .order("created_at", { ascending: false })
      .limit(24);

    if (error || !data) return [];

    return data
      .map((item) => ({
        id: item.id as string,
        kind: item.kind as CandidRetrievedMemory["kind"],
        content: item.content as string,
        score: memoryScore({
          content: item.content as string,
          keywords,
          importance: Number(item.importance ?? 0.5),
          emotionalIntensity: Number(item.emotional_intensity ?? 0.3),
          createdAt: item.created_at as string,
        }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, input.limit);
  } catch (error) {
    logCandidInternal({ event: "keyword_memory_retrieval_skipped", level: "warn", error });
    return [];
  }
}

async function retrieveRecentHighSignalMemories(userId: string, limit: number) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("candid_memory_events")
      .select("id, kind, content, importance, emotional_intensity, created_at")
      .eq("user_id", userId)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((item) => ({
      id: item.id as string,
      kind: item.kind as CandidRetrievedMemory["kind"],
      content: item.content as string,
      score: Number(item.importance ?? 0.4),
    }));
  } catch (error) {
    logCandidInternal({ event: "high_signal_memory_retrieval_skipped", level: "warn", error });
    return [];
  }
}

export async function writeRelationalMemoryEvent(input: {
  userId: string;
  kind: CandidRetrievedMemory["kind"];
  content: string;
  importance?: number;
  emotionalIntensity?: number;
}) {
  const content = input.content.trim().toLowerCase().slice(0, 240);
  if (!content) return;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("candid_memory_events")
      .insert({
        user_id: input.userId,
        kind: input.kind,
        content,
        importance: input.importance ?? 0.45,
        emotional_intensity: input.emotionalIntensity ?? 0.3,
        source: "turn_heuristic",
      })
      .select("id")
      .single();

    if (error || !data?.id) return;

    const embedded = await safeEmbedCandidText(content);
    if (!embedded) return;

    await supabaseAdmin.from("candid_memory_embeddings").insert({
      user_id: input.userId,
      memory_event_id: data.id,
      embedding_provider: embedded.provider,
      embedding_model: embedded.model,
      content,
      embedding: embedded.embedding,
    });
  } catch (error) {
    logCandidInternal({ event: "relational_memory_write_skipped", level: "warn", error });
  }
}

export function summarizeTurnForRelationalMemory(message: string) {
  const text = message.trim().toLowerCase();
  if (!text) return null;

  if (/\b(lol|lmao|chaos|wild|unhinged|joke)\b/.test(text)) {
    return { kind: "social" as const, content: "responds to playful or chaotic social energy", importance: 0.4 };
  }

  if (/\b(hurt|heavy|miss|alone|anxious|ashamed|ignored|ghosted)\b/.test(text)) {
    return { kind: "emotional" as const, content: "there is emotional charge around feeling ignored or unsettled", importance: 0.72 };
  }

  if (/\b(breakup|broke up|ex|ended things|split up)\b/.test(text)) {
    return { kind: "episodic" as const, content: "recent relationship rupture or breakup came up", importance: 0.78, emotionalIntensity: 0.82 };
  }

  if (/\b(argument|fight|conflict|misunderstanding)\b/.test(text)) {
    return { kind: "episodic" as const, content: "conflict or misunderstanding was part of the current context", importance: 0.66, emotionalIntensity: 0.62 };
  }

  if (/\b(texting|reply|seen|double text)\b/.test(text)) {
    return { kind: "social" as const, content: "texting rhythm seems socially meaningful", importance: 0.6 };
  }

  if (/\b(startup|founder|work|career|finance|market|school|college)\b/.test(text)) {
    return { kind: "practical" as const, content: "work and ambition signals may matter conversationally", importance: 0.52 };
  }

  if (/\b(overwhelmed|drained|social battery|crowds|introvert)\b/.test(text)) {
    return { kind: "social" as const, content: "social energy and recovery time seem important", importance: 0.58, emotionalIntensity: 0.45 };
  }

  const interests = extractKeywords(text).filter((keyword) =>
    ["music", "movie", "game", "politics", "startup", "design", "gym", "travel"].includes(keyword),
  );

  if (interests.length) {
    return {
      kind: "semantic" as const,
      content: `interest signal around ${interests.slice(0, 2).join(" and ")}`,
      importance: 0.45,
    };
  }

  return null;
}

function extractKeywords(message: string) {
  return Array.from(new Set(message.match(MEMORY_KEYWORDS)?.map((item) => item.toLowerCase()) ?? [])).slice(0, 8);
}

async function safeEmbedCandidText(text: string) {
  try {
    return await embedCandidText(text);
  } catch (error) {
    logCandidInternal({ event: "embedding_skipped", level: "warn", error });
    return null;
  }
}

function memoryScore(input: {
  content: string;
  keywords: string[];
  importance: number;
  emotionalIntensity: number;
  createdAt: string;
}) {
  const content = input.content.toLowerCase();
  const keywordHits = input.keywords.filter((keyword) => content.includes(keyword)).length / Math.max(1, input.keywords.length);
  const ageMs = Date.now() - new Date(input.createdAt).getTime();
  const recency = Math.max(0, 1 - ageMs / (1000 * 60 * 60 * 24 * 90));
  return keywordHits * 0.38 + input.importance * 0.26 + input.emotionalIntensity * 0.2 + recency * 0.16;
}
