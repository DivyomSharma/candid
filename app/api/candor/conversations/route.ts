import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runCandorTurn } from "@/lib/candor/engine";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CANDOR_THREAD_ID } from "@/lib/candor/thread";
import {
  getOrCreateCandorUser,
  getSocialState,
  persistMessage,
  saveSocialState,
} from "@/lib/candor/persistence";
import {
  retrieveRelationalMemories,
  summarizeTurnForRelationalMemory,
  writeRelationalMemoryEvent,
} from "@/lib/candor/relational-memory";
import { factsAsRetrievedMemory, upsertMemoryFacts } from "@/lib/candor/memory-facts";
import { logInteractionPattern } from "@/lib/candor/interaction-patterns";
import { maybeQueueInitiative } from "@/lib/candor/initiatives";

async function getOrCreateUser(authId: string) {
  return getOrCreateCandorUser(authId);
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const body = (await request.json().catch(() => ({}))) as { message?: string };
    const opening = body.message?.trim();

    const user = await getOrCreateUser(userId);

    const { data: traitsRow } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const id = CANDOR_THREAD_ID;
    let aiContent: string | null = null;

    if (opening) {
      let memory = normalizeMemory(traitsRow?.data ?? createEmptyMemory());
      const socialState = await getSocialState(user.id);
      const retrievedMemories = await retrieveRelationalMemories({
        userId: user.id,
        message: opening,
      });
      const factMemories = await factsAsRetrievedMemory(user.id);
      await persistMessage({ userId: user.id, role: "user", content: opening });

      try {
        const turn = await runCandorTurn({
          userId,
          message: opening,
          history: [],
          memory,
          socialState,
          retrievedMemories: [...retrievedMemories, ...factMemories].slice(0, 8),
        });
        aiContent = turn.reply;
        memory = turn.memory;
        await saveSocialState(user.id, turn.socialState);
        await maybeQueueInitiative({
          userId: user.id,
          memory,
          socialState: turn.socialState,
          lastUserMessage: opening,
        });
        void logInteractionPattern({
          userId: user.id,
          socialMove: turn.socialMove,
          outcome: "continued",
          weight: 0.55,
        });
      } catch (error) {
        console.error("Candor AI fallback used:", error);
        aiContent = `[DEBUG]: ${error instanceof Error ? error.message : String(error)} \n\nhmm... that already says something.\nlet it stay here for a second.`;
      }

      // Upsert traits
      await supabaseAdmin.from("candor_traits").upsert(
        { user_id: user.id, data: memory },
        { onConflict: "user_id" },
      );

      await persistMessage({ userId: user.id, role: "ai", content: aiContent });
      const relationalMemory = summarizeTurnForRelationalMemory(opening);
      if (relationalMemory) {
        await writeRelationalMemoryEvent({
          userId: user.id,
          ...relationalMemory,
        });
      }
      await upsertMemoryFacts({ userId: user.id, message: opening });
    }

    return NextResponse.json({
      id,
      persisted: false,
      message: aiContent
        ? {
            id: crypto.randomUUID(),
            role: "ai",
            content: aiContent,
          }
        : null,
    });
  } catch (error) {
    console.error("Conversation creation failed:", error);
    return NextResponse.json({
      id: CANDOR_THREAD_ID,
      persisted: false,
      warning: "database_unavailable",
    });
  }
}
