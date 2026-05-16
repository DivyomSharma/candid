import { describe, expect, it } from "vitest";
import { candorFailureReply, safeCandorFallback, sanitizeCandorReply } from "@/lib/candor/fallback";

describe("candor fallback safety", () => {
  it("removes debug and provider leakage from user-facing replies", () => {
    const reply = sanitizeCandorReply("[DEBUG]: groq_chat_failed\n\nyeah... i lost the thread for a second.");

    expect(reply).toBe("yeah... i lost the thread for a second.");
    expect(reply).not.toMatch(/debug|groq|failed/i);
  });

  it("uses a conversational fallback when only internal text remains", () => {
    const reply = sanitizeCandorReply("[DEBUG]: openrouter_chat_failed", "hello");

    expect(reply).toBe(safeCandorFallback("hello"));
    expect(reply).not.toMatch(/debug|openrouter|failed/i);
  });

  it("uses honest operational copy for missing model configuration", () => {
    const reply = candorFailureReply(new Error("missing_groq_api_key"));

    expect(reply).toMatch(/ai reply failed/i);
    expect(reply).not.toMatch(/lost the thread|brain lagged|processed that weirdly/i);
  });
});
