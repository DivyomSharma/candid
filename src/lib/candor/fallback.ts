const FALLBACK_REPLIES = [
  "wait i lost the thread for a second.\nsay that again but simpler?",
  "my brain lagged there for a second.\ntry me again.",
  "hold on, i processed that weirdly.\nrun it past me one more time.",
  "okay, i caught that badly.\ngive me the simpler version.",
];

const INTERNAL_LINE_PATTERNS = [
  /\[debug\]/i,
  /\bdebug\b/i,
  /\bgroq\b/i,
  /\bopenrouter\b/i,
  /\bprovider\b/i,
  /\bmodel(?:s)?\b.*\b(fail|error|route|fallback)\b/i,
  /\b(api|http|json|rpc)\b.*\b(fail|error|exception|timeout)\b/i,
  /\b(orchestration|routing|stack trace|traceback)\b/i,
  /\b(missing_[a-z0-9_]+|[a-z0-9_]+_failed)\b/i,
];

export function safeCandorFallback(seed = "") {
  const index = stableIndex(seed, FALLBACK_REPLIES.length);
  return FALLBACK_REPLIES[index];
}

export function sanitizeCandorReply(content: string | null | undefined, seed = "") {
  const lines = String(content ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !INTERNAL_LINE_PATTERNS.some((pattern) => pattern.test(line)));

  const sanitized = lines.join("\n").trim();
  return sanitized || safeCandorFallback(seed);
}

function stableIndex(seed: string, length: number) {
  if (length <= 1) return 0;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return hash % length;
}
