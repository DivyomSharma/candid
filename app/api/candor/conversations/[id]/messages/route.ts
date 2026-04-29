import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { CandorHistoryMessage } from "@/lib/candor-api";
import { runCandorTurn } from "@/lib/candor/engine";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { supabaseAdmin } from "@/lib/supabase-admin";

async function getOrCreateUser(clerkId: string) {
  const { data: existing } = await supabaseAdmin
    .from("candor_users")
    .select("id")
    .eq("clerk_id", clerkId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("candor_users")
    .insert({ clerk_id: clerkId })
    .select("id")
    .single();

  if (error) throw error;
  return created!;
}

async function getUserConversation(clerkId: string, conversationId: string) {
  const user = await getOrCreateUser(clerkId);

  const { data: conversation } = await supabaseAdmin
    .from("candor_conversations")
    .select("id, user_id")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (!conversation) return null;

  const { data: messages } = await supabaseAdmin
    .from("candor_messages")
    .select("id, role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  const { data: traits } = await supabaseAdmin
    .from("candor_traits")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  return {
    ...conversation,
    messages: messages ?? [],
    traits: traits?.data ?? null,
  };
}

function isLocalConversation(id: string) {
  return id.startsWith("local-");
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (isLocalConversation(id)) {
    return NextResponse.json({ messages: [], persisted: false });
  }

  const conversation = await getUserConversation(userId, id);

  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    messages: conversation.messages.map((message) => ({
      id: message.id,
      role: message.role === "user" ? "user" : "ai",
      content: message.content,
    })),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    message?: string;
    history?: CandorHistoryMessage[];
  };
  const content = body.message?.trim();

  if (!content) {
    return NextResponse.json({ error: "message_required" }, { status: 400 });
  }

  if (isLocalConversation(id)) {
    const history = body.history ?? [];
    let aiContent = "yeah... i'm here.\nkeep going.";

    try {
      const turn = await runCandorTurn({
        userId,
        message: content,
        history,
        memory: createEmptyMemory(),
      });
      aiContent = turn.reply;
    } catch (error) {
      console.error("Local Candor turn failed:", error);
    }

    return NextResponse.json({
      persisted: false,
      message: {
        id: crypto.randomUUID(),
        role: "ai",
        content: aiContent,
      },
    });
  }

  const conversation = await getUserConversation(userId, id);

  if (!conversation) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await supabaseAdmin.from("candor_messages").insert({
    conversation_id: conversation.id,
    role: "user",
    content,
  });

  const history =
    body.history ??
    conversation.messages.map((message) => ({
      role: message.role === "user" ? "user" : "ai",
      content: message.content,
    }));

  let aiContent: string;
  let memory = normalizeMemory(conversation.traits ?? createEmptyMemory());

  try {
    const turn = await runCandorTurn({
      userId,
      message: content,
      history,
      memory,
    });
    aiContent = turn.reply;
    memory = turn.memory;
  } catch {
    aiContent = "yeah... i lost the thread for a second.\ntry saying that again, simpler.";
  }

  const { data: aiMessage } = await supabaseAdmin
    .from("candor_messages")
    .insert({
      conversation_id: conversation.id,
      role: "ai",
      content: aiContent,
    })
    .select("id, content")
    .single();

  await supabaseAdmin.from("candor_traits").upsert(
    { user_id: conversation.user_id, data: memory },
    { onConflict: "user_id" },
  );

  return NextResponse.json({
    message: {
      id: aiMessage!.id,
      role: "ai",
      content: aiMessage!.content,
    },
  });
}
