import { kv } from "@vercel/kv";
import { logCandorInternal } from "./logger";

export async function getCachedGeneration<T>(
  key: string,
  generateFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  try {
    const cached = await kv.get<T>(key);
    if (cached !== null) {
      logCandorInternal({
        event: "cache_hit",
        context: { cache_key: key },
      });
      return cached;
    }
  } catch (error) {
    logCandorInternal({
      event: "cache_error",
      level: "warn",
      error,
      context: { cache_key: key, action: "get" },
    });
  }

  logCandorInternal({
    event: "cache_miss",
    context: { cache_key: key },
  });

  const generated = await generateFn();

  try {
    await kv.set(key, generated, { ex: ttlSeconds });
  } catch (error) {
    logCandorInternal({
      event: "cache_error",
      level: "warn",
      error,
      context: { cache_key: key, action: "set" },
    });
  }

  return generated;
}
