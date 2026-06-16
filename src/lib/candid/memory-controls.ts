import { clearCanonicalMessages, clearSocialState } from "@/lib/candid/persistence";
import { createEmptyMemory } from "@/lib/candid/memory";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getMemoryControlSnapshot(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();

  const [events, facts, messages, initiatives] = await Promise.all([
    safeCount("candid_memory_events", userId),
    safeCount("candid_memory_facts", userId),
    safeCount("candid_messages", userId),
    safeCount("candid_initiatives", userId),
  ]);

  const { data: eventRows } = await supabaseAdmin
    .from("candid_memory_events")
    .select("id, kind, content, importance, emotional_intensity, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(24);

  const { data: factRows } = await supabaseAdmin
    .from("candid_memory_facts")
    .select("id, kind, key, value, confidence, sensitivity, confirmed_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(24);

  return {
    counts: {
      messages,
      memories: events,
      facts,
      initiatives,
    },
    memories: eventRows ?? [],
    facts: factRows ?? [],
  };
}

export async function deleteMemoryEvent(userId: string, id: string) {
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.from("candid_memory_events").delete().eq("user_id", userId).eq("id", id);
}

export async function deleteMemoryFact(userId: string, id: string) {
  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin.from("candid_memory_facts").delete().eq("user_id", userId).eq("id", id);
}

export async function clearRelationalMemory(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  await Promise.all([
    supabaseAdmin.from("candid_memory_embeddings").delete().eq("user_id", userId),
    supabaseAdmin.from("candid_memory_events").delete().eq("user_id", userId),
    supabaseAdmin.from("candid_memory_facts").delete().eq("user_id", userId),
    supabaseAdmin.from("candid_interaction_patterns").delete().eq("user_id", userId),
    clearSocialState(userId),
  ]);
}

export async function clearEverythingCandidKnows(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  await Promise.all([
    clearRelationalMemory(userId),
    clearCanonicalMessages(userId),
    supabaseAdmin.from("candid_traits").upsert(
      {
        user_id: userId,
        data: createEmptyMemory(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    ),
  ]);
}

export async function setInitiativesPaused(userId: string, paused: boolean) {
  const supabaseAdmin = getSupabaseAdmin();
  if (paused) {
    await supabaseAdmin
      .from("candid_initiatives")
      .update({ status: "paused" })
      .eq("user_id", userId)
      .eq("status", "pending");
    return;
  }

  await supabaseAdmin
    .from("candid_initiatives")
    .update({ status: "pending" })
    .eq("user_id", userId)
    .eq("status", "paused");
}

async function safeCount(table: string, userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { count, error } = await supabaseAdmin
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}
