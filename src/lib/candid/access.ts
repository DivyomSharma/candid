import { getSupabaseAdmin } from "@/lib/supabase-admin";

export type CandidTier = "echo" | "continuity" | "resonance";

export type CandidAccessState = {
  tier: CandidTier;
  baseTier: CandidTier;
  trialTier: CandidTier | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  inTrial: boolean;
  narrative: string;
};

export async function ensureCandidAccess(userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: existing } = await supabaseAdmin
    .from("candid_access")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing;

  const now = new Date();
  const ends = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const { data, error } = await supabaseAdmin
    .from("candid_access")
    .insert({
      user_id: userId,
      base_tier: "echo",
      trial_tier: "continuity",
      trial_started_at: now.toISOString(),
      trial_ends_at: ends.toISOString(),
    })
    .select("id")
    .single();

  if (error) throw error;
  return data;
}

export async function getCandidAccess(userId: string): Promise<CandidAccessState> {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("candid_access")
    .select("base_tier, trial_tier, trial_started_at, trial_ends_at")
    .eq("user_id", userId)
    .maybeSingle();

  return normalizeCandidAccess(data);
}

export function normalizeCandidAccess(value: unknown): CandidAccessState {
  const row = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const baseTier = isTier(row.base_tier) ? row.base_tier : "echo";
  const trialTier = isTier(row.trial_tier) ? row.trial_tier : null;
  const trialStartedAt = readDateTime(row.trial_started_at);
  const trialEndsAt = readDateTime(row.trial_ends_at);
  const now = Date.now();
  const inTrial = Boolean(trialTier && trialEndsAt && new Date(trialEndsAt).getTime() > now);
  const tier = inTrial && trialTier ? trialTier : baseTier;

  return {
    tier,
    baseTier,
    trialTier,
    trialStartedAt,
    trialEndsAt,
    inTrial,
    narrative: tierNarrative(tier, inTrial),
  };
}

export function accessProfileFor(tier: CandidTier) {
  if (tier === "resonance") {
    return {
      retrievedMemoryLimit: 10,
      alignCount: 6,
      minAlignScore: 5,
      initiativeBufferHours: 12,
      initiativeQueueCap: 5,
      deepAnalysisEvery: 3,
      factualMemoryLimit: 7,
    };
  }

  if (tier === "continuity") {
    return {
      retrievedMemoryLimit: 7,
      alignCount: 5,
      minAlignScore: 6,
      initiativeBufferHours: 18,
      initiativeQueueCap: 3,
      deepAnalysisEvery: 5,
      factualMemoryLimit: 5,
    };
  }

  return {
    retrievedMemoryLimit: 4,
    alignCount: 3,
    minAlignScore: 7,
    initiativeBufferHours: 26,
    initiativeQueueCap: 1,
    deepAnalysisEvery: 8,
    factualMemoryLimit: 3,
  };
}

function tierNarrative(tier: CandidTier, inTrial: boolean) {
  if (tier === "resonance") return "candid is holding the deepest continuity it can.";
  if (tier === "continuity") {
    return inTrial
      ? "you are in a full continuity experience while candid learns your rhythm."
      : "candid is carrying continuity across tone, pacing, and chemistry.";
  }
  return "candid is holding the first signal, lightly but attentively.";
}

function isTier(value: unknown): value is CandidTier {
  return value === "echo" || value === "continuity" || value === "resonance";
}

function readDateTime(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}
