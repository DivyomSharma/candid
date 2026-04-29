import type { CandorMemory } from "@/lib/candor/types";

type Scenario = {
  id: string;
  text: string;
  tags: string[];
};

const scenarios: Scenario[] = [
  {
    id: "unsent-message",
    text: "you type out something honest, then delete it.\nnot because it was wrong.\nbecause it would make you too visible.",
    tags: ["communication", "feeling unseen"],
  },
  {
    id: "family-table",
    text: "you're at home, and everyone is talking like things are normal.\nbut you're carrying something nobody has asked about.",
    tags: ["family", "emotional safety"],
  },
  {
    id: "career-pressure",
    text: "someone asks about your future.\nyou answer casually, but your body already knows it feels heavier than that.",
    tags: ["career pressure"],
  },
  {
    id: "friend-shift",
    text: "a friend replies differently than they used to.\nnothing dramatic happened.\nstill, something in you notices the distance.",
    tags: ["friendships", "feeling unseen"],
  },
  {
    id: "almost-ask",
    text: "you want reassurance.\nbut asking for it would make it feel less real.",
    tags: ["emotional safety", "holds back before asking directly"],
  },
];

export function selectScenario(memory: CandorMemory) {
  const seen = new Set(memory.seenScenarios);
  const available = scenarios.filter((scenario) => !seen.has(scenario.id));
  const pool = available.length > 0 ? available : scenarios;
  const signals = [
    ...memory.values,
    ...memory.softSpots,
    ...memory.lifeThemes,
    ...memory.relationalPatterns,
    ...memory.communicationNeeds,
  ];

  const scored = pool
    .map((scenario) => ({
      scenario,
      score: scenario.tags.filter((tag) => signals.some((signal) => signal.includes(tag) || tag.includes(signal))).length,
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.scenario ?? scenarios[0];
}
