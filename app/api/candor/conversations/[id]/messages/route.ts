import { NextRequest, NextResponse } from "next/server";
import type { CandorHistoryMessage } from "@/lib/candor-api";
import { runCandorTurn } from "@/lib/candor/engine";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { CANDOR_THREAD_ID, isCandorThread } from "@/lib/candor/thread";
import {
  fetchRecentMessages,
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

async function getUserTraits(authId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const user = await getOrCreateUser(authId);
  const { data: traits } = await supabaseAdmin
    .from("candor_traits")
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

  if (!isCandorThread(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const user = await getOrCreateCandorUser(userId);
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

  if (!isCandorThread(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    message?: string;
    history?: CandorHistoryMessage[];
  };
  const content = body.message?.trim();

  if (!content) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const saved = await getUserTraits(userId);
  const history = body.history ?? [];
  const socialState = await getSocialState(saved.userId);
  const retrievedMemories = await retrieveRelationalMemories({
    userId: saved.userId,
    message: content,
  });
  const factMemories = await factsAsRetrievedMemory(saved.userId);
  const persistedUserMessage = await persistMessage({
    userId: saved.userId,
    role: "user",
    content,
  });

  let aiContent: string;
  let memory = normalizeMemory(saved.traits ?? createEmptyMemory());
  let nextSocialState = socialState;

  try {
    const turn = await runCandorTurn({
      userId,
      message: content,
      history,
      memory,
      socialState,
      retrievedMemories: [...retrievedMemories, ...factMemories].slice(0, 8),
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
    aiContent = `[DEBUG]: ${error instanceof Error ? error.message : String(error)} \n\nyeah... i lost the thread for a second.\ntry saying that again, simpler.`;
  }

  await supabaseAdmin.from("candor_traits").upsert(
    { user_id: saved.userId, data: memory },
    { onConflict: "user_id" },
  );
  await saveSocialState(saved.userId, nextSocialState);
  await maybeQueueInitiative({
    userId: saved.userId,
    memory,
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
}
