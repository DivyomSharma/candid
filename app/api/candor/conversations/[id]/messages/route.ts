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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!isCandorThread(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const user = await getOrCreateCandorUser(userId);
  const messages = await fetchRecentMessages(user.id);

  return NextResponse.json({ messages, persisted: messages.length > 0 });
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
      retrievedMemories,
    });
    aiContent = turn.reply;
    memory = turn.memory;
    nextSocialState = turn.socialState;
  } catch (error) {
    aiContent = `[DEBUG]: ${error instanceof Error ? error.message : String(error)} \n\nyeah... i lost the thread for a second.\ntry saying that again, simpler.`;
  }

  await supabaseAdmin.from("candor_traits").upsert(
    { user_id: saved.userId, data: memory },
    { onConflict: "user_id" },
  );
  await saveSocialState(saved.userId, nextSocialState);

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
