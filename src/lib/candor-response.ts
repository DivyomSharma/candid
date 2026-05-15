export function shapeCandorResponse(content: string) {
  const cleaned = content
    .replace(/\b(as an ai|as a chatbot|as an assistant|assistant|chatgpt|language model|ai system)\b/gi, "")
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .filter(Boolean)
    .map(depolish)
    .filter((line, index, lines) => lines.findIndex((item) => normalize(item) === normalize(line)) === index)
    .slice(0, 4);

  if (cleaned.length === 0) return "wait yeah... stay with that a little.";

  return cleaned.join("\n");
}

function depolish(value: string) {
  return value
    .replace(/\bthat's a beautiful goal\b/g, "honestly if you pull that off properly people are gonna get attached fast")
    .replace(/\bthat is a beautiful goal\b/g, "honestly if you pull that off properly people are gonna get attached fast")
    .replace(/\bthat's beautiful\b/g, "wait yeah, that hits")
    .replace(/\bthat is beautiful\b/g, "wait yeah, that hits")
    .replace(/\bthat's a complex (problem|challenge)\b/g, "that actually sounds insanely hard to get right")
    .replace(/\bthat is a complex (problem|challenge)\b/g, "that actually sounds insanely hard to get right")
    .replace(/\bi understand\b/g, "wait no, i get that")
    .replace(/\bthat sounds difficult\b/g, "yeah... okay that would annoy me too honestly")
    .replace(/\bthat sounds hard\b/g, "yeah... okay that would get heavy fast")
    .replace(/\bthat can be emotionally overwhelming\b/g, "that would genuinely fry my brain after a while");
}

function normalize(value: string) {
  return value.replace(/[^\w\s?.']/g, "").replace(/\s+/g, " ").trim();
}
