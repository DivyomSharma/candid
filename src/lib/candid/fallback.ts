const FALLBACK_REPLIES = [
  "the reply slipped on my side.\ntry me again in a second.",
  "something glitched before i could answer properly.\nrun that back once more.",
  "that one did not come through cleanly here.\ntry it again.",
  "my side dropped the reply for a second.\nsend that again.",
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

export function safeCandidFallback(seed = "") {
  const index = stableIndex(seed, FALLBACK_REPLIES.length);
  return FALLBACK_REPLIES[index];
}

export function candidFailureReply(error: unknown, seed = "") {
  const message = String(
    error && typeof error === "object" && "message" in error ? (error as { message?: unknown }).message ?? "" : error ?? "",
  ).toLowerCase();

  if (message.includes("missing_groq_api_key") || message.includes("missing_openrouter_api_key")) {
    return "the ai reply failed because no model key is connected.\nadd the key, then try again.";
  }

  if (
    message.includes("groq_chat_failed") ||
    message.includes("openrouter_chat_failed") ||
    message.includes("candid_chat_failed") ||
    message.includes("timeout")
  ) {
    return "the ai reply failed on my side.\ntry again in a second.";
  }

  return safeCandidFallback(seed);
}

export function sanitizeCandidReply(content: string | null | undefined, seed = "") {
  const lines = String(content ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !INTERNAL_LINE_PATTERNS.some((pattern) => pattern.test(line)));

  const sanitized = lines.join("\n").trim();
  return sanitized || safeCandidFallback(seed);
}

function stableIndex(seed: string, length: number) {
  if (length <= 1) return 0;
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return hash % length;
}
