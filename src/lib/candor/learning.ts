import { buildTraitCluster, recordInteractionSignals, topInterestTopics } from "@/lib/candor/memory";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type {
  CandorLearningBias,
  CandorLearningEvent,
  CandorMemory,
  CandorStructure,
} from "@/lib/candor/types";

export async function getLearningBias(memory: CandorMemory): Promise<CandorLearningBias> {
  const localBias = biasFromMemory(memory);

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const traitCluster = buildTraitCluster(memory);
    const { data, error } = await supabaseAdmin
      .from("candor_learning_events")
      .select("choice_pattern, insight_type, accepted, engagement_signal")
      .eq("trait_cluster", traitCluster)
      .order("created_at", { ascending: false })
      .limit(160);

    if (error || !data?.length) {
      return localBias;
    }

    return {
      favoredInsightTypes: pickAccepted(
        data
          .filter((row) => row.accepted === true && typeof row.insight_type === "string")
          .map((row) => row.insight_type as string),
        localBias.favoredInsightTypes,
      ),
      favoredChoicePatterns: pickAccepted(
        data
          .filter((row) => typeof row.choice_pattern === "string")
          .map((row) => row.choice_pattern as string),
        localBias.favoredChoicePatterns,
      ),
      favoredStructures: localBias.favoredStructures,
      favoredTopics: localBias.favoredTopics,
    };
  } catch {
    return localBias;
  }
}

export async function logLearningEvent(userId: string, memory: CandorMemory, event: CandorLearningEvent) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: user } = await supabaseAdmin
      .from("candor_users")
      .select("id")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (!user) return;

    await supabaseAdmin.from("candor_learning_events").insert({
      user_id: user.id,
      trait_cluster: event.traitCluster,
      choice_pattern: event.choicePattern,
      insight_type: event.insightType,
      accepted: event.accepted,
      engagement_signal: event.engagementSignal,
    });
  } catch (error) {
    console.error("Candor learning log skipped:", error);
  }
}

export function applyLearningEvent(memory: CandorMemory, event: CandorLearningEvent) {
  return recordInteractionSignals(memory, {
    choicePattern: event.choicePattern,
    insightType: event.insightType,
    accepted: event.accepted,
    engagementSignal: event.engagementSignal,
  });
}

function biasFromMemory(memory: CandorMemory): CandorLearningBias {
  const accepted = memory.interactionProfile.acceptedInsightTypes.slice(-4);
  const choices = memory.interactionProfile.choicePatterns.slice(-4);
  const structure = structureBiasFromMemory(memory);

  return {
    favoredInsightTypes: accepted,
    favoredChoicePatterns: choices,
    favoredStructures: structure,
    favoredTopics: topInterestTopics(memory),
  };
}

function structureBiasFromMemory(memory: CandorMemory): CandorStructure[] {
  const profile = memory.interactionProfile;
  const favorsChallenge = profile.acceptedInsightTypes.some((item) => item.includes("contrast"));
  const favorsQuiet = profile.engagementSignals.some((item) => item.includes("pause"));

  if (favorsChallenge) return ["contrast", "observation"];
  if (favorsQuiet) return ["fragment", "silence"];
  return ["playful", "observation", "fragment"];
}

function pickAccepted(items: string[], fallback: string[]) {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(item, (counts.get(item) ?? 0) + 1);
  }

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([item]) => item)
    .slice(0, 4);

  return ranked.length ? ranked : fallback;
}
