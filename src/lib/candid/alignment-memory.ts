import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function getAlignmentSignals(userIds: string[]) {
  if (!userIds.length) return new Map<string, string[]>();

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("candid_memory_events")
      .select("user_id, content")
      .in("user_id", userIds)
      .in("kind", ["social", "semantic", "interaction", "emotional"])
      .order("importance", { ascending: false })
      .limit(userIds.length * 8);

    if (error || !data) return new Map();

    const signals = new Map<string, string[]>();
    for (const item of data) {
      const userId = item.user_id as string;
      signals.set(userId, [...(signals.get(userId) ?? []), item.content as string].slice(0, 8));
    }
    return signals;
  } catch {
    return new Map();
  }
}
