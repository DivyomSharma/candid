import type { CandorSocialMove, CandorSocialState } from "@/lib/candor/types";

const POLISHED_PATTERNS: Array<[RegExp, string]> = [
  [/\bthat's a beautiful goal\b/g, "honestly if you pull that off properly people are gonna get attached fast"],
  [/\bthat is a beautiful goal\b/g, "honestly if you pull that off properly people are gonna get attached fast"],
  [/\bthat's beautiful\b/g, "wait yeah, that hits"],
  [/\bthat is beautiful\b/g, "wait yeah, that hits"],
  [/\bthat's a complex (problem|challenge)\b/g, "that actually sounds insanely hard to get right"],
  [/\bthat is a complex (problem|challenge)\b/g, "that actually sounds insanely hard to get right"],
  [/\bi understand\b/g, "wait no, i get that"],
  [/\bthat sounds difficult\b/g, "yeah... okay that would annoy me too honestly"],
  [/\bthat sounds hard\b/g, "yeah... okay that would get heavy fast"],
  [/\bthat can be emotionally overwhelming\b/g, "that would genuinely fry my brain after a while"],
  [/\bit sounds like\b/g, "feels like"],
  [/\bthank you for sharing\b/g, "yeah... that is a real thing to say"],
  [/\bi'm here to\b/g, "we can"],
];

export function humanizeCandorText(input: {
  content: string;
  socialMove?: CandorSocialMove;
  socialState?: CandorSocialState;
  previousReplies?: string[];
}) {
  const lines = input.content
    .replace(/\b(as an ai|as a chatbot|as an assistant|assistant|chatgpt|language model|ai system)\b/gi, "")
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
    .map(depolishLine)
    .map((line) => trimOvercomplete(line, input.socialMove))
    .filter(Boolean);

  const unique = lines.filter((line, index) => lines.findIndex((item) => normalize(item) === normalize(line)) === index);
  const varied = avoidRepeatedOpening(unique, input.previousReplies ?? []);
  const maxLines = input.socialState?.preferredPace === "quick" ? 3 : 4;

  if (!varied.length) return "wait yeah... stay with that a little.";
  return varied.slice(0, maxLines).join("\n");
}

function depolishLine(value: string) {
  return POLISHED_PATTERNS.reduce((line, [pattern, replacement]) => line.replace(pattern, replacement), value)
    .replace(/\s+/g, " ")
    .replace(/\bdeeply\b/g, "")
    .replace(/\bprofound\b/g, "real")
    .trim();
}

function trimOvercomplete(value: string, move?: CandorSocialMove) {
  // Let the LLM handle its own response length and pauses based on the prompt.
  // Artificial truncation causes broken sentences and missing punctuation.
  return value;
}

function avoidRepeatedOpening(lines: string[], previousReplies: string[]) {
  const recentOpenings = new Set(previousReplies.slice(-4).map((reply) => normalize(reply).split(/\s+/).slice(0, 2).join(" ")));
  return lines.map((line, index) => {
    const opening = normalize(line).split(/\s+/).slice(0, 2).join(" ");
    if (index === 0 && recentOpenings.has(opening)) {
      return line.replace(/^(yeah|hmm|wait|okay|honestly)[,.\s]*/i, "");
    }
    return line;
  }).filter(Boolean);
}

function normalize(value: string) {
  return value.replace(/[^\w\s?.']/g, "").replace(/\s+/g, " ").trim();
}
