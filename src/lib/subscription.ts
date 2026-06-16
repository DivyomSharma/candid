/**
 * Candid Subscription & Relational Depth System
 *
 * Subscription tiers scale relational depth, continuity, and understanding —
 * NOT basic chat quantity.
 */

// ─── Subscription Tiers ───────────────────────────────────────────────
export type SubscriptionTier = "echo" | "continuity" | "resonance";

export interface SubscriptionTierMeta {
  tier: SubscriptionTier;
  label: string;
  meaning: string;
  tone: string;
  description: string;
  features: string[];
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, SubscriptionTierMeta> = {
  echo: {
    tier: "echo",
    label: "Echo",
    meaning: "the beginning of understanding",
    tone: "light, welcoming, curious, exploratory",
    description:
      "experience candid's emotional intelligence and conversational atmosphere. echo should still feel magical.",
    features: [
      "lightweight continuity",
      "exploratory aligns",
      "foundational chemistry detection",
      "early conversational understanding",
    ],
  },
  continuity: {
    tier: "continuity",
    label: "Continuity",
    meaning: "understanding that evolves over time",
    tone: "perceptive, emotionally intelligent, deeply aware",
    description:
      "deeper relational continuity and compatibility understanding. emotionally intelligent and noticeably more perceptive.",
    features: [
      "deeper memory horizon",
      "stronger relational modeling",
      "richer chemistry detection",
      "improved align precision",
      "stronger conversational personalization",
      "improved emotional continuity",
    ],
  },
  resonance: {
    tier: "resonance",
    label: "Resonance",
    meaning: "deep relational intelligence",
    tone: "rare, premium, emotionally mature, deeply perceptive",
    description:
      "candid truly understands relational patterns and chemistry deeply. the richest possible continuity.",
    features: [
      "longest relational continuity",
      "strongest compatibility modeling",
      "highest chemistry precision",
      "advanced social understanding",
      "deepest conversational adaptation",
      "strongest contextual memory",
      "advanced relational insights",
      "richest initiative intelligence",
    ],
  },
};

// ─── Understanding Depth (Hidden Evolving Model) ──────────────────────
export type UnderstandingState =
  | "spark"
  | "rhythm"
  | "patterns"
  | "nuance"
  | "continuity"
  | "resonance";

export const UNDERSTANDING_STATES: UnderstandingState[] = [
  "spark",
  "rhythm",
  "patterns",
  "nuance",
  "continuity",
  "resonance",
];

/** Soft language surfaced per understanding state. Never XP bars or percentages. */
export const UNDERSTANDING_LANGUAGE: Record<UnderstandingState, string[]> = {
  spark: [
    "candid is beginning to notice something",
    "the first signals are forming",
  ],
  rhythm: [
    "candid is beginning to understand your rhythm",
    "your conversational pace is becoming familiar",
  ],
  patterns: [
    "patterns are becoming clearer lately",
    "candid is starting to see how you think",
  ],
  nuance: [
    "candid notices your energy more naturally now",
    "the subtleties are starting to emerge",
  ],
  continuity: [
    "your continuity feels stronger",
    "the understanding between you and candid is deepening",
  ],
  resonance: [
    "candid understands your relational patterns deeply",
    "there's a real resonance in how candid reads you now",
  ],
};

// ─── Align Tiers ──────────────────────────────────────────────────────
export type AlignTier = "distant" | "familiar" | "natural_flow" | "magnetic" | "candid";

export const ALIGN_TIERS: AlignTier[] = [
  "distant",
  "familiar",
  "natural_flow",
  "magnetic",
  "candid",
];

export const ALIGN_TIER_LABELS: Record<AlignTier, string> = {
  distant: "distant",
  familiar: "familiar",
  natural_flow: "natural flow",
  magnetic: "magnetic",
  candid: "candid",
};

// ─── Openness States ──────────────────────────────────────────────────
export type OpennessState =
  | "open_the_door"
  | "naturally_unfolding"
  | "becoming_easy"
  | "emotionally_open"
  | "conversation_feels_candid";

export const OPENNESS_LABELS: Record<OpennessState, string> = {
  open_the_door: "open the door",
  naturally_unfolding: "naturally unfolding",
  becoming_easy: "becoming easy between you two",
  emotionally_open: "emotionally open",
  conversation_feels_candid: "conversation feels candid",
};

// ─── Trial System ─────────────────────────────────────────────────────
export const TRIAL_DURATION_DAYS = 7;

export interface UserSubscription {
  tier: SubscriptionTier;
  trialActive: boolean;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  subscribedAt: string | null;
}

/**
 * Determine if a user is currently in their trial period.
 */
export function isTrialActive(sub: UserSubscription): boolean {
  if (!sub.trialActive || !sub.trialEndsAt) return false;
  return new Date(sub.trialEndsAt) > new Date();
}

/**
 * Get days remaining in the trial.
 */
export function trialDaysRemaining(sub: UserSubscription): number {
  if (!sub.trialEndsAt) return 0;
  const diff = new Date(sub.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Determine the effective tier (trial gives Continuity access).
 */
export function effectiveTier(sub: UserSubscription): SubscriptionTier {
  if (isTrialActive(sub)) return "continuity";
  return sub.tier;
}
