import type { CandorRetrievedMemory } from "@/lib/candor/types";
import { logCandorInternal } from "@/lib/candor/logger";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type FactCandidate = {
  kind: "objective" | "relational" | "preference" | "boundary";
  key: string;
  value: Record<string, string>;
  confidence: number;
  sensitivity?: "low" | "normal" | "sensitive";
};

export function inferMemoryFacts(message: string): FactCandidate[] {
  const text = message.toLowerCase();
  const facts: FactCandidate[] = [];

  if (/\b(finance|banking|trading|portfolio|accounting)\b/.test(text)) {
    facts.push({ kind: "objective", key: "profession_signal", value: { signal: "finance-adjacent" }, confidence: 0.42 });
  }
  if (/\b(founder|startup|building a product|saas|investor)\b/.test(text)) {
    facts.push({ kind: "objective", key: "profession_signal", value: { signal: "founder or product-builder energy" }, confidence: 0.48 });
  }
  if (/\b(gym|lifting|run|running|training|fitness)\b/.test(text)) {
    facts.push({ kind: "objective", key: "fitness_habits", value: { signal: "movement matters" }, confidence: 0.45 });
  }
  if (/\b(smoke|smoking|vape|vaping)\b/.test(text)) {
    facts.push({ kind: "objective", key: "smoking_signal", value: { signal: "smoking came up" }, confidence: 0.55, sensitivity: "sensitive" });
  }
  if (/\b(drink|drinking|sober|alcohol|party|clubbing)\b/.test(text)) {
    facts.push({ kind: "objective", key: "nightlife_signal", value: { signal: "nightlife or alcohol came up" }, confidence: 0.5, sensitivity: "sensitive" });
  }
  if (/\b(text back|left on seen|double text|reply fast|slow replies)\b/.test(text)) {
    facts.push({ kind: "relational", key: "texting_style", value: { signal: "texting rhythm carries emotional meaning" }, confidence: 0.65 });
  }
  if (/\b(i hate being pushed|don't pressure me|too many questions)\b/.test(text)) {
    facts.push({ kind: "boundary", key: "pressure_boundary", value: { signal: "avoid pushing for vulnerability" }, confidence: 0.72 });
  }
  if (/\b(lol|lmao|chaos|unhinged|wild)\b/.test(text)) {
    facts.push({ kind: "preference", key: "humor_style", value: { signal: "responds to playful chaotic energy" }, confidence: 0.5 });
  }

  return facts;
}

export async function upsertMemoryFacts(input: {
  userId: string;
  message: string;
  sourceEventIds?: string[];
}) {
  const facts = inferMemoryFacts(input.message);
  if (!facts.length) return;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from("candor_memory_facts").upsert(
      facts.map((fact) => ({
        user_id: input.userId,
        kind: fact.kind,
        key: fact.key,
        value: fact.value,
        confidence: fact.confidence,
        sensitivity: fact.sensitivity ?? "normal",
        source_event_ids: input.sourceEventIds ?? [],
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "user_id,kind,key" },
    );
  } catch (error) {
    logCandorInternal({ event: "memory_fact_upsert_skipped", level: "warn", error });
  }
}

export async function factsAsRetrievedMemory(userId: string, limit = 5): Promise<CandorRetrievedMemory[]> {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("candor_memory_facts")
      .select("id, kind, key, value, confidence, updated_at")
      .eq("user_id", userId)
      .order("confidence", { ascending: false })
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((fact) => ({
      id: fact.id as string,
      kind: fact.kind === "objective" ? "practical" : fact.kind === "relational" ? "social" : "semantic",
      content: `${fact.key}: ${formatValue(fact.value)}`,
      score: Number(fact.confidence ?? 0.4),
    }));
  } catch (error) {
    logCandorInternal({ event: "memory_fact_retrieval_skipped", level: "warn", error });
    return [];
  }
}

function formatValue(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).join(", ");
  return "unknown";
}
