export function shapeCandorResponse(content: string) {
  const cleaned = content
    .replace(/\b(as an ai|assistant|chatgpt)\b/gi, "")
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3);

  if (cleaned.length === 0) return "hmm... stay with that a little.";

  return cleaned.join("\n");
}
