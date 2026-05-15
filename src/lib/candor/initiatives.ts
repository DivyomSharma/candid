import type { CandorMemory, CandorSocialState } from "@/lib/candor/types";
import { topInterestTopics } from "@/lib/candor/memory";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function maybeQueueInitiative(input: {
  userId: string;
  memory: CandorMemory;
  socialState: CandorSocialState;
  lastUserMessage: string;
}) {
  if (input.memory.turnCount < 3) return;
  if (input.socialState.recentEnergy === "heavy") return;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { count } = await supabaseAdmin
      .from("candor_initiatives")
      .select("id", { count: "exact", head: true })
      .eq("user_id", input.userId)
      .in("status", ["pending", "paused"]);

    if ((count ?? 0) >= 3) return;

    const content = initiativeLine(input.memory, input.socialState);
    const scheduledFor = new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString();

    await supabaseAdmin.from("candor_initiatives").insert({
      user_id: input.userId,
      kind: "curiosity",
      content,
      scheduled_for: scheduledFor,
    });
  } catch (error) {
    console.error("Candor initiative queue skipped:", error);
  }
}

export async function fetchDueInitiative(userId: string) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("candor_initiatives")
      .select("id, content")
      .eq("user_id", userId)
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .order("scheduled_for", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    await supabaseAdmin
      .from("candor_initiatives")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", data.id);
    return data.content as string;
  } catch {
    return null;
  }
}

function initiativeLine(memory: CandorMemory, socialState: CandorSocialState) {
  const topic = topInterestTopics(memory, 1)[0];
  if (topic) return `random thought: your ${topic} opinions probably reveal more than you intend.`;
  if (socialState.chaosTolerance > 0.6) return "okay tiny question for later: what is your most irrational strong opinion?";
  if (socialState.archetypeSignals.includes("analytical")) return "small curiosity: are you more annoyed by bad logic or bad timing?";
  return "tiny thought for later: you seem like someone who notices the shift before anyone says it out loud.";
}
