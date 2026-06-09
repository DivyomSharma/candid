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
  // Initiatives (random thoughts) are currently disabled based on feedback.
  return;
}

export async function fetchDueInitiative(userId: string) {
  // Initiatives are disabled
  return null;
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
