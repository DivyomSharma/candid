import { sendCandorJson, sendCandorMessage } from "@/lib/candor-api";
import { mergeMemory, extractLightMemory, updateTurnMemory } from "@/lib/candor/memory";
import { buildAnalysisPrompt, buildCandorPrompt } from "@/lib/candor/prompts";
import { selectScenario } from "@/lib/candor/scenarios";
import type { CandorMode, CandorTurnInput, CandorTurnResult, CandorMemory } from "@/lib/candor/types";
import { shapeCandorResponse } from "@/lib/candor-response";

export async function runCandorTurn(input: CandorTurnInput): Promise<CandorTurnResult> {
  const lightMemory = mergeMemory(input.memory, extractLightMemory(input.message));
  const mode = chooseMode(input.message, lightMemory);
  const scenario = mode === "scenario" ? selectScenario(lightMemory) : undefined;
  const prompt = buildCandorPrompt(lightMemory, mode, scenario?.text);
  const reply = shapeCandorResponse(
    await sendCandorMessage({
      message: input.message,
      history: input.history,
      user_id: input.userId,
      system_prompt: prompt,
      temperature: mode === "challenge" ? 0.72 : 0.82,
      max_tokens: 110,
    }),
  );

  let memory = updateTurnMemory(
    mergeMemory(lightMemory, scenario ? { seenScenarios: [scenario.id] } : {}),
    mode,
  );

  if (shouldAnalyzeDeeply(memory)) {
    const deepMemory = await analyzeMemory(input.message, input.history, memory);
    memory = mergeMemory(memory, deepMemory);
  }

  return { reply, memory, mode };
}

function chooseMode(message: string, memory: CandorMemory): CandorMode {
  const text = message.toLowerCase();
  const recent = memory.lastModes.slice(-2);

  if (/\b(match|matches|align|aligns|people|meet someone|find someone)\b/.test(text)) return "deepen";
  if (/\b(sad|hurt|cry|tired|alone|scared|miss|heavy|broken|anxious)\b/.test(text)) return "comfort";
  if (/\b(fine|idk|don't know|nothing|whatever|no idea)\b/.test(text) || message.trim().split(/\s+/).length <= 4) {
    return "scenario";
  }
  if (recent[0] === "listen" && recent[1] === "listen") return "deepen";
  if (memory.turnCount > 2 && /\b(but|maybe|i guess|it's okay|not a big deal)\b/.test(text)) return "challenge";
  if (/\b(i did|i tried|i care|i helped|i stayed)\b/.test(text)) return "appreciate";

  return memory.turnCount < 2 ? "listen" : "deepen";
}

function shouldAnalyzeDeeply(memory: CandorMemory) {
  return memory.turnCount > 0 && memory.turnCount % 5 === 0;
}

async function analyzeMemory(message: string, history: CandorTurnInput["history"], memory: CandorMemory) {
  try {
    return await sendCandorJson<Partial<CandorMemory>>({
      systemPrompt: buildAnalysisPrompt(),
      message:
        "current memory:\n" +
        JSON.stringify(memory) +
        "\n\nconversation:\n" +
        [...history, { role: "user" as const, content: message }]
          .slice(-18)
          .map((item) => `${item.role}: ${item.content}`)
          .join("\n"),
      temperature: 0.25,
      maxTokens: 450,
    });
  } catch (error) {
    console.error("Candor memory analysis failed:", error);
    return {};
  }
}
