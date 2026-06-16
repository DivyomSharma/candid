import type { CandidSocialMove } from "@/lib/candid/types";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function logInteractionPattern(input: {
  userId: string;
  socialMove: CandidSocialMove;
  topic?: string | null;
  outcome?: "unknown" | "continued" | "energized" | "flat";
  weight?: number;
}) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    await supabaseAdmin.from("candid_interaction_patterns").insert({
      user_id: input.userId,
      pattern_key: `${input.socialMove}:${input.topic ?? "general"}`,
      social_move: input.socialMove,
      topic: input.topic,
      outcome: input.outcome ?? "unknown",
      weight: input.weight ?? 0.5,
    });
  } catch (error) {
    console.error("Candid interaction pattern log skipped:", error);
  }
}

export async function getRecentInteractionMoves(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("candid_interaction_patterns")
      .select("social_move, topic, outcome")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) return [];
    return data;
  } catch {
    return [];
  }
}
