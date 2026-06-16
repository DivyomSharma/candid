import { NextRequest, NextResponse } from "next/server";
import type { CandidHistoryMessage } from "@/lib/candid-api";
import { runCandidTurn } from "@/lib/candid/engine";
import { accessProfileFor, getCandidAccess } from "@/lib/candid/access";
import { createEmptyMemory, normalizeMemory } from "@/lib/candid/memory";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CANDOR_THREAD_ID, isCandidThread } from "@/lib/candid/thread";
import {
  fetchRecentMessages,
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

async function getUserTraits(authId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const user = await getOrCreateUser(authId);
  const { data: traits } = await supabaseAdmin
    .from("candid_traits")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    userId: user.id,
    traits: traits?.data ?? null,
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isCandidThread(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const user = await getOrCreateCandidUser(userId);
  const cursor = request.nextUrl.searchParams.get("before");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 60);
  const messages = await fetchRecentMessages({
    userId: user.id,
    before: cursor,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 20), 100) : 60,
  });
  const nextCursor = messages[0]?.created_at ?? null;

  return NextResponse.json({ messages, persisted: messages.length > 0, nextCursor, hasMore: messages.length > 0 });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isCandidThread(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    message?: string;
    history?: CandidHistoryMessage[];
    isImproveMode?: boolean;
    currentScreen?: string;
  };
  const content = body.message?.trim();

  if (!content) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }

  try {
  const supabaseAdmin = getSupabaseAdmin();
  const saved = await getUserTraits(userId);
  const access = await getCandidAccess(saved.userId);
  const accessProfile = accessProfileFor(access.tier);
  const history = body.history ?? [];
  const compressedHistory = history.slice(-8);
  const socialState = await getSocialState(saved.userId);
  const [retrievedMemories, factMemories] = await Promise.all([
    retrieveRelationalMemories({
      userId: saved.userId,
      message: content,
    }).catch((error) => {
      logCandidInternal({ event: "relational_memory_retrieval_skipped", level: "warn", error });
      return [];
    }),
    factsAsRetrievedMemory(saved.userId, accessProfile.factualMemoryLimit).catch((error) => {
      logCandidInternal({ event: "memory_fact_retrieval_skipped", level: "warn", error });
      return [];
    }),
  ]);
  const persistedUserMessage = await persistMessage({
    userId: saved.userId,
    role: "user",
    content,
  });

  let aiContent: string;
  let memory = normalizeMemory(saved.traits ?? createEmptyMemory());
  let nextSocialState = socialState;

  try {
    const turn = await runCandidTurn({
      userId,
      message: content,
      history: compressedHistory,
      memory,
      accessTier: access.tier,
      socialState,
      retrievedMemories: [...retrievedMemories, ...factMemories].slice(0, accessProfile.retrievedMemoryLimit),
      isImproveMode: body.isImproveMode,
      currentScreen: body.currentScreen,
    });
    aiContent = turn.reply;
    memory = turn.memory;
    nextSocialState = turn.socialState;
    void logInteractionPattern({
      userId: saved.userId,
      socialMove: turn.socialMove,
      outcome: "continued",
      weight: 0.55,
    });
  } catch (error) {
    logCandidInternal({ event: "conversation_turn_degraded", level: "error", error });
    aiContent = candidFailureReply(error, content);
  }

  aiContent = sanitizeCandidReply(aiContent, content);

  await supabaseAdmin.from("candid_traits").upsert(
    { user_id: saved.userId, data: memory },
    { onConflict: "user_id" },
  );
  await saveSocialState(saved.userId, nextSocialState);
  await maybeQueueInitiative({
    userId: saved.userId,
    memory,
    accessTier: access.tier,
    socialState: nextSocialState,
    lastUserMessage: content,
  });

  const persistedAiMessage = await persistMessage({
    userId: saved.userId,
    role: "ai",
    content: aiContent,
  });

  const relationalMemory = summarizeTurnForRelationalMemory(content);
  if (relationalMemory) {
    await writeRelationalMemoryEvent({
      userId: saved.userId,
      ...relationalMemory,
    });
  }
  await upsertMemoryFacts({ userId: saved.userId, message: content });

  return NextResponse.json({
    message: {
      id: persistedAiMessage?.id ?? crypto.randomUUID(),
      role: "ai",
      content: aiContent,
    },
    userMessage: persistedUserMessage,
    conversationId: CANDOR_THREAD_ID,
  });
  } catch (error) {
    logCandidInternal({ event: "conversation_message_failed", level: "error", error });
    return NextResponse.json({
      message: {
        id: crypto.randomUUID(),
        role: "ai",
        content: candidFailureReply(error, content),
      },
      conversationId: CANDOR_THREAD_ID,
    });
  }
}
