import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { runCandidTurn } from "@/lib/candid/engine";
import { createEmptyMemory, normalizeMemory } from "@/lib/candid/memory";
import { accessProfileFor, getCandidAccess } from "@/lib/candid/access";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CANDOR_THREAD_ID } from "@/lib/candid/thread";
import {
  getOrCreateCandidUser,
  getSocialState,
  persistMessage,
  saveSocialState,
} from "@/lib/candid/persistence";
import {
  retrieveRelationalMemories,
  summarizeTurnForRelationalMemory,
  writeRelationalMemoryEvent,
} from "@/lib/candid/relational-memory";
import { factsAsRetrievedMemory, upsertMemoryFacts } from "@/lib/candid/memory-facts";
import { logInteractionPattern } from "@/lib/candid/interaction-patterns";
import { maybeQueueInitiative } from "@/lib/candid/initiatives";
import { candidFailureReply, sanitizeCandidReply } from "@/lib/candid/fallback";
import { logCandidInternal } from "@/lib/candid/logger";

async function getOrCreateUser(authId: string) {
  return getOrCreateCandidUser(authId);
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const body = (await request.json().catch(() => ({}))) as { message?: string; currentScreen?: string };
    const opening = body.message?.trim();

    const user = await getOrCreateUser(userId);
    const access = await getCandidAccess(user.id);
    const accessProfile = accessProfileFor(access.tier);

    const { data: traitsRow } = await supabaseAdmin
      .from("candid_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const id = CANDOR_THREAD_ID;
    let aiContent: string | null = null;

    if (opening) {
      let memory = normalizeMemory(traitsRow?.data ?? createEmptyMemory());
      const socialState = await getSocialState(user.id);
      const [retrievedMemories, factMemories] = await Promise.all([
        retrieveRelationalMemories({
          userId: user.id,
          message: opening,
        }).catch((error) => {
          logCandidInternal({ event: "relational_memory_retrieval_skipped", level: "warn", error });
          return [];
        }),
        factsAsRetrievedMemory(user.id, accessProfile.factualMemoryLimit).catch((error) => {
          logCandidInternal({ event: "memory_fact_retrieval_skipped", level: "warn", error });
          return [];
        }),
      ]);
      await persistMessage({ userId: user.id, role: "user", content: opening });

      try {
        const turn = await runCandidTurn({
          userId,
          message: opening,
          history: [],
          memory,
          accessTier: access.tier,
          socialState,
          retrievedMemories: [...retrievedMemories, ...factMemories].slice(0, accessProfile.retrievedMemoryLimit),
          currentScreen: body.currentScreen,
        });
        aiContent = turn.reply;
        memory = turn.memory;
        await saveSocialState(user.id, turn.socialState);
        await maybeQueueInitiative({
          userId: user.id,
          memory,
          accessTier: access.tier,
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
        logCandidInternal({ event: "conversation_turn_degraded", level: "error", error });
        aiContent = candidFailureReply(error, opening);
      }

      aiContent = sanitizeCandidReply(aiContent, opening);

      // Upsert traits
      await supabaseAdmin.from("candid_traits").upsert(
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
    logCandidInternal({ event: "conversation_creation_failed", level: "error", error });
    return NextResponse.json({
      id: CANDOR_THREAD_ID,
      persisted: false,
      warning: "database_unavailable",
    });
  }
}
