import { accessProfileFor, type CandorTier } from "@/lib/candor/access";
import type { CandorMemory, CandorSocialState } from "@/lib/candor/types";
import { topInterestTopics } from "@/lib/candor/memory";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function maybeQueueInitiative(input: {
  userId: string;
  memory: CandorMemory;
  socialState: CandorSocialState;
  lastUserMessage: string;
  accessTier?: CandorTier;
}) {
  const accessProfile = accessProfileFor(input.accessTier ?? "echo");
  const minimumTurns = input.accessTier === "resonance" ? 2 : input.accessTier === "continuity" ? 3 : 5;
  if (input.memory.turnCount < minimumTurns) return;
  if (input.socialState.recentEnergy === "heavy") return;

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { count } = await supabaseAdmin
      .from("candor_initiatives")
      .select("id", { count: "exact", head: true })
      .eq("user_id", input.userId)
      .in("status", ["pending", "paused"]);

    if ((count ?? 0) >= accessProfile.initiativeQueueCap) return;

    const content = initiativeLine(input.memory, input.socialState);
    const scheduledFor = new Date(Date.now() + 1000 * 60 * 60 * accessProfile.initiativeBufferHours).toISOString();

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
  if (socialState.currentAtmosphere === "late_night_vulnerable" || socialState.confessionalComfort > 0.56) {
    return "be honest for later... what kind of attention works on you faster than it should";
  }
  if (socialState.teasingComfort > 0.52 && socialState.socialBoldness > 0.48) {
    return "dangerously honest question for later: emotionally impossible to read or a little too obsessed with you";
  }
  if (topic) return `random thought: your ${topic} opinions probably reveal more than you intend.`;
  if (socialState.chaosTolerance > 0.6) return "okay tiny question for later: what is your most irrational strong opinion?";
  if (socialState.archetypeSignals.includes("analytical")) return "small curiosity: are you more annoyed by bad logic or bad timing?";
  return "tiny thought for later: you seem like someone who notices the shift before anyone says it out loud.";
}
