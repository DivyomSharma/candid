import type { CandidMemory } from "@/lib/candid/types";

export type AlignmentPreview = {
  ready: boolean;
  language: string;
};

export function getAlignmentPreview(memory: CandidMemory): AlignmentPreview {
  if (!memory.alignmentReady) {
    return {
      ready: false,
      language: "i will help you find aligns, but first i need to understand you more.",
    };
  }

  const value = memory.values[0] ?? "something real";
  const need = memory.communicationNeeds[0] ?? "the way you open up";

  return {
    ready: true,
    language: `i'd look for someone who respects ${need}, and also cares about ${value}.`,
  };
}
