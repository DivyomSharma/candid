export function shapeCandorResponse(content: string) {
  const cleaned = content
    .replace(/\b(as an ai|assistant|chatgpt)\b/gi, "")
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
    .filter((line, index, lines) => lines.findIndex((item) => normalize(item) === normalize(line)) === index)
    .slice(0, 3);

  if (cleaned.length === 0) return "hmm... stay with that a little.";

  return cleaned.join("\n");
}

function normalize(value: string) {
  return value.replace(/[^\w\s?.']/g, "").replace(/\s+/g, " ").trim();
}
