import { describe, expect, it } from "vitest";
import { candidFailureReply, safeCandidFallback, sanitizeCandidReply } from "@/lib/candid/fallback";

describe("candid fallback safety", () => {
  it("removes debug and provider leakage from user-facing replies", () => {
    const reply = sanitizeCandidReply("[DEBUG]: groq_chat_failed\n\nyeah... i lost the thread for a second.");

    expect(reply).toBe("yeah... i lost the thread for a second.");
    expect(reply).not.toMatch(/debug|groq|failed/i);
  });

  it("uses a conversational fallback when only internal text remains", () => {
    const reply = sanitizeCandidReply("[DEBUG]: openrouter_chat_failed", "hello");

    expect(reply).toBe(safeCandidFallback("hello"));
    expect(reply).not.toMatch(/debug|openrouter|failed/i);
  });

  it("uses honest operational copy for missing model configuration", () => {
    const reply = candidFailureReply(new Error("missing_groq_api_key"));

    expect(reply).toMatch(/ai reply failed/i);
    expect(reply).not.toMatch(/lost the thread|brain lagged|processed that weirdly/i);
  });
});
