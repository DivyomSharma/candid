import type { CandorMemory } from "@/lib/candor/types";
import { createEmptyMemory } from "@/lib/candor/memory";

export type SignalType =
  | "hear_me_out"
  | "hot_take"
  | "red_flag"
  | "green_flag"
  | "instant_ick"
  | "delusion_check"
  | "vibe_check"
  | "too_real"
  | "creative_argument"
  | "would_you_rather"
  | "have_you_ever";

export type SignalCategory =
  | "funny"
  | "flirty"
  | "relatable"
  | "culture"
  | "opinion"
  | "emotional"
  | "deep";

export type SignalOutcomeType =
  | "quick_answer"
  | "community_reveal"
  | "candor_learns"
  | "conversation_worthy";

export type CandorSignal = {
  id: string;
  type: SignalType;
  category: SignalCategory;
  title: string; // e.g. "hear me out", "hot take", etc.
  prompt: string;
  options: string[];
  outcomeType: SignalOutcomeType;
  communitySplit?: number[]; // Split e.g. [64, 36] or [45, 30, 25]
};

// Alias for backward compatibility
export type CandorScenario = CandorSignal;

export const STATIC_SIGNALS: Omit<CandorSignal, "outcomeType">[] = [
  // 1. Funny (20%)
  {
    id: "ick-alpha-male",
    type: "instant_ick",
    category: "funny",
    title: "instant ick",
    prompt: "they say: 'alpha male' in a conversation.",
    options: ["run", "harmless", "lowkey cute"]
  },
  {
    id: "ick-emoji-laugh",
    type: "instant_ick",
    category: "funny",
    title: "instant ick",
    prompt: "they use 😂 in literally every single message.",
    options: ["run", "harmless", "lowkey cute"]
  },
  {
    id: "red-flag-plane",
    type: "red_flag",
    category: "funny",
    title: "red flag",
    prompt: "they clap when planes land.",
    options: ["red flag", "green flag", "depends"]
  },
  {
    id: "ick-selfies",
    type: "instant_ick",
    category: "funny",
    title: "instant ick",
    prompt: "their camera roll is 99% selfies.",
    options: ["run", "harmless", "lowkey cute"]
  },
  {
    id: "delusion-hahaha",
    type: "delusion_check",
    category: "funny",
    title: "delusion check",
    prompt: "you sent a long story and they replied: 'hahaha'.",
    options: ["interested", "bored", "stop overthinking"]
  },
  
  // 2. Flirty (20%)
  {
    id: "hear-laugh-hotter",
    type: "hear_me_out",
    category: "flirty",
    title: "hear me out",
    prompt: "people become instantly hotter after making you laugh.",
    options: ["agree", "disagree", "depends"]
  },
  {
    id: "hear-playlist-kiss",
    type: "hear_me_out",
    category: "flirty",
    title: "hear me out",
    prompt: "sharing your main playlist is more intimate than kissing.",
    options: ["agree", "disagree", "depends"]
  },
  {
    id: "hear-texting-chemistry",
    type: "hear_me_out",
    category: "flirty",
    title: "hear me out",
    prompt: "texting chemistry matters way more than physical chemistry early on.",
    options: ["agree", "disagree", "depends"]
  },
  {
    id: "vibe-headphones",
    type: "vibe_check",
    category: "flirty",
    title: "vibe check",
    prompt: "what is the ultimate form of physical intimacy?",
    options: ["sharing headphones", "sharing fries", "sharing silence", "holding hands"]
  },
  {
    id: "delusion-story-like",
    type: "delusion_check",
    category: "flirty",
    title: "delusion check",
    prompt: "they liked your instagram story after six months of silence.",
    options: ["interested", "bored", "stop overthinking"]
  },
  {
    id: "delusion-hang-soon",
    type: "delusion_check",
    category: "flirty",
    title: "delusion check",
    prompt: "they texted: 'we should hang soon' but didn't give a day.",
    options: ["interested", "bored", "stop overthinking"]
  },

  // 3. Relatable (20%)
  {
    id: "red-flag-reply",
    type: "red_flag",
    category: "relatable",
    title: "red flag",
    prompt: "they reply instantly, every single time, day or night.",
    options: ["red flag", "green flag", "depends"]
  },
  {
    id: "green-flag-apologize",
    type: "green_flag",
    category: "relatable",
    title: "green flag",
    prompt: "they apologize first after a stupid argument.",
    options: ["green flag", "depends", "not enough"]
  },
  {
    id: "have-up-4am",
    type: "have_you_ever",
    category: "relatable",
    title: "have you ever",
    prompt: "stayed up till 4am waiting for a reply you knew wasn't coming?",
    options: ["yes", "no", "depends"]
  },
  {
    id: "have-reread-conv",
    type: "have_you_ever",
    category: "relatable",
    title: "have you ever",
    prompt: "re-read a single chat thread more than twenty times?",
    options: ["yes", "no", "depends"]
  },
  {
    id: "have-fake-sleep",
    type: "have_you_ever",
    category: "relatable",
    title: "have you ever",
    prompt: "pretended to go to sleep just to stop replying to someone?",
    options: ["yes", "no", "depends"]
  },

  // 4. Culture (15%)
  {
    id: "take-coffee-date",
    type: "hot_take",
    category: "culture",
    title: "hot take",
    prompt: "coffee dates are completely overrated.",
    options: ["agree", "fight me", "depends"]
  },
  {
    id: "vibe-first-date",
    type: "vibe_check",
    category: "culture",
    title: "vibe check",
    prompt: "what's the best setting for a first date?",
    options: ["museum", "bookstore", "chai spot", "arcade"]
  },
  {
    id: "have-book-cover",
    type: "have_you_ever",
    category: "culture",
    title: "have you ever",
    prompt: "bought a book just because the cover looked perfect on your shelf?",
    options: ["yes", "no", "depends"]
  },
  {
    id: "take-mysterious",
    type: "hot_take",
    category: "culture",
    title: "hot take",
    prompt: "being mysterious is overrated. just tell me your hyperfixations.",
    options: ["agree", "fight me", "depends"]
  },

  // 5. Opinion (15%)
  {
    id: "take-timing-compat",
    type: "hot_take",
    category: "opinion",
    title: "hot take",
    prompt: "timing matters much more than actual compatibility.",
    options: ["agree", "fight me", "depends"]
  },
  {
    id: "red-flag-ex",
    type: "red_flag",
    category: "opinion",
    title: "red flag",
    prompt: "they still text their ex on their birthday.",
    options: ["red flag", "green flag", "depends"]
  },
  {
    id: "argue-cereal-soup",
    type: "creative_argument",
    category: "opinion",
    title: "creative argument",
    prompt: "is cereal technically a cold soup?",
    options: ["yes", "no", "depends"]
  },
  {
    id: "rather-mind-history",
    type: "would_you_rather",
    category: "opinion",
    title: "would you rather",
    prompt: "they could read your mind or read your entire search history?",
    options: ["read my mind", "read my history"]
  },
  {
    id: "rather-call-text",
    type: "would_you_rather",
    category: "opinion",
    title: "would you rather",
    prompt: "never text anyone again or never talk on the phone again?",
    options: ["never text", "never call"]
  },

  // 6. Emotional (15%)
  {
    id: "real-deleted-para",
    type: "too_real",
    category: "emotional",
    title: "too real",
    prompt: "you typed a huge paragraph, then deleted it. why?",
    options: ["too visible", "didn't matter", "regretted it", "overthinking"]
  },
  {
    id: "real-deserve-better",
    type: "too_real",
    category: "emotional",
    title: "too real",
    prompt: "someone says: 'you deserve better.' your first thought?",
    options: ["prove them wrong", "find better", "laugh", "panic"]
  },
  {
    id: "green-flag-details",
    type: "green_flag",
    category: "emotional",
    title: "green flag",
    prompt: "they remember a tiny, throwaway detail you mentioned weeks ago.",
    options: ["green flag", "depends", "not enough"]
  },
  {
    id: "green-flag-books",
    type: "green_flag",
    category: "emotional",
    title: "green flag",
    prompt: "they recommend a book that made them think of you.",
    options: ["green flag", "depends", "not enough"]
  },

  // 7. Deep (10%)
  {
    id: "real-hard-truth",
    type: "too_real",
    category: "deep",
    title: "too real",
    prompt: "what is the hardest truth you have had to accept about yourself lately?",
    options: ["i avoid conflict", "i seek validation", "i fear intimacy", "i hold onto the past"]
  },
  {
    id: "rather-lie-truth",
    type: "would_you_rather",
    category: "deep",
    title: "would you rather",
    prompt: "live a highly comfortable lie or face a painful truth?",
    options: ["comfortable lie", "painful truth"]
  }
];

export function getDeterministicSplit(signalId: string, optionsCount: number): number[] {
  // Simple stable hash based on ID to generate realistic looking percentages adding up to 100
  let hash = 0;
  for (let i = 0; i < signalId.length; i++) {
    hash = signalId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  if (optionsCount === 2) {
    const split = 45 + (hash % 35); // 45 to 80
    return [split, 100 - split];
  } else if (optionsCount === 3) {
    const first = 40 + (hash % 30); // 40 to 70
    const second = Math.floor((100 - first) * (0.3 + ((hash >> 2) % 4) * 0.15));
    const third = 100 - first - second;
    return [first, second, third];
  } else {
    const base = Math.floor(100 / optionsCount);
    const split: number[] = [];
    let remaining = 100;
    for (let i = 0; i < optionsCount - 1; i++) {
      const share = Math.floor(remaining * (0.2 + ((hash >> i) % 4) * 0.1));
      split.push(share);
      remaining -= share;
    }
    split.push(remaining);
    return split;
  }
}

export function selectSignals(memory: CandorMemory, limit = 15): CandorSignal[] {
  const seen = new Set([
    ...(memory.seenScenarios ?? []),
    ...Object.keys(memory.answeredSignals ?? {})
  ]);

  // Filter out already answered/seen signals
  let available = STATIC_SIGNALS.filter((s) => !seen.has(s.id));
  if (available.length < 5) {
    // Reset pool if they answered almost everything
    available = STATIC_SIGNALS;
  }

  // Shuffle available signals
  const shuffled = [...available].sort(() => Math.random() - 0.5);

  // Group by category to enforce target diversity
  const groups: Record<SignalCategory, Omit<CandorSignal, "outcomeType">[]> = {
    funny: [],
    flirty: [],
    relatable: [],
    culture: [],
    opinion: [],
    emotional: [],
    deep: []
  };

  for (const s of shuffled) {
    groups[s.category].push(s);
  }

  // Target Proportions (limit = 15 as baseline)
  // funny: 20% (3 cards)
  // flirty: 20% (3 cards)
  // relatable: 20% (3 cards)
  // culture: 15% (2 cards)
  // opinion: 15% (2 cards)
  // emotional: 15% (2 cards)
  // deep: 10% (1-2 cards)
  const targets: { category: SignalCategory; count: number }[] = [
    { category: "funny", count: Math.max(1, Math.round(limit * 0.20)) },
    { category: "flirty", count: Math.max(1, Math.round(limit * 0.20)) },
    { category: "relatable", count: Math.max(1, Math.round(limit * 0.20)) },
    { category: "culture", count: Math.max(1, Math.round(limit * 0.15)) },
    { category: "opinion", count: Math.max(1, Math.round(limit * 0.15)) },
    { category: "emotional", count: Math.max(1, Math.round(limit * 0.15)) },
    { category: "deep", count: Math.max(1, Math.round(limit * 0.10)) }
  ];

  const selected: Omit<CandorSignal, "outcomeType">[] = [];
  
  // Select from groups based on targets
  for (const target of targets) {
    const pool = groups[target.category];
    const taken = pool.slice(0, target.count);
    selected.push(...taken);
  }

  // If we couldn't meet the limit (not enough cards in some categories), fill up from shuffled remainder
  if (selected.length < limit) {
    const selectedIds = new Set(selected.map((s) => s.id));
    const remainder = shuffled.filter((s) => !selectedIds.has(s.id));
    selected.push(...remainder.slice(0, limit - selected.length));
  }

  // Final shuffle of selection
  const finalSelection = selected.slice(0, limit).sort(() => Math.random() - 0.5);

  // Assign outcome types:
  // 15-20% conversation_worthy (TYPE D) -> e.g. 2-3 out of 15
  // The rest are TYPE A (quick_answer), TYPE B (community_reveal), TYPE C (candor_learns)
  const outcomeTypes: SignalOutcomeType[] = [
    "quick_answer",
    "community_reveal",
    "candor_learns",
    "conversation_worthy"
  ];

  return finalSelection.map((s, idx) => {
    let outcomeType: SignalOutcomeType = "quick_answer";
    // 18% conversation worthy (roughly 1 in 6)
    if (idx % 6 === 2) {
      outcomeType = "conversation_worthy";
    } else if (idx % 3 === 0) {
      outcomeType = "community_reveal";
    } else if (idx % 3 === 1) {
      outcomeType = "candor_learns";
    } else {
      outcomeType = "quick_answer";
    }

    const split = s.options.length > 0 ? getDeterministicSplit(s.id, s.options.length) : undefined;

    return {
      ...s,
      outcomeType,
      communitySplit: split
    } as CandorSignal;
  });
}

// Retro-compatibility functions
export function fallbackScenarios() {
  const dummyMemory = createEmptyMemory();
  
  return {
    scenarios: selectSignals(dummyMemory, 3)
  };
}

export async function generateCandorScenarios(memory: CandorMemory) {
  // Repurposed to serve 3 high-diversity modern signals for preview
  return {
    scenarios: selectSignals(memory, 3)
  };
}
