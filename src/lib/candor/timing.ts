export function responseDelayFor(input: { message: string; hour?: number }) {
  const text = input.message.toLowerCase();
  const words = input.message.trim().split(/\s+/).filter(Boolean).length;
  const hour = input.hour ?? new Date().getHours();
  const isLateNight = hour >= 23 || hour <= 4;
  const isHeavy = /\b(hurt|heavy|alone|scared|miss|broken|anxious|ashamed|stuck)\b/.test(text);
  const isBanter = /\b(lol|lmao|wild|chaos|random|quick|pick one)\b/.test(text);

  const base = isBanter ? 420 : isHeavy ? 1100 : 680;
  const lengthDelay = Math.min(900, words * 22);
  const lateNightDelay = isLateNight ? 380 : 0;
  const jitter = stableJitter(input.message) * 90;

  return Math.min(2600, base + lengthDelay + lateNightDelay + jitter);
}

function stableJitter(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 29 + value.charCodeAt(index)) % 13;
  }
  return hash;
}
