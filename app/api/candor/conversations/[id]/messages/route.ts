import { NextRequest, NextResponse } from "next/server";
import type { CandorHistoryMessage } from "@/lib/candor-api";
import { runCandorTurn } from "@/lib/candor/engine";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

async function getOrCreateUser(authId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: existing } = await supabaseAdmin
    .from("candor_users")
    .select("id")
    .eq("clerk_id", authId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("candor_users")
    .insert({ clerk_id: authId })
    .select("id")
    .single();

  if (error) throw error;
  return created!;
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

function isLocalConversation(id: string) {
  return id.startsWith("local-");
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
  const { id } = await params;

  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ messages: [], persisted: false });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getCurrentUserId();
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

  const supabaseAdmin = getSupabaseAdmin();
  const saved = await getUserTraits(userId);
  const history = body.history ?? [];

  let aiContent: string;
  let memory = normalizeMemory(saved.traits ?? createEmptyMemory());

  try {
    const turn = await runCandorTurn({
      userId,
      message: content,
      history,
      memory,
    });
    aiContent = turn.reply;
    memory = turn.memory;
  } catch (error) {
    aiContent = `[DEBUG]: ${error instanceof Error ? error.message : String(error)} \n\nyeah... i lost the thread for a second.\ntry saying that again, simpler.`;
  }

  await supabaseAdmin.from("candor_traits").upsert(
    { user_id: saved.userId, data: memory },
    { onConflict: "user_id" },
  );

  return NextResponse.json({
    message: {
      id: crypto.randomUUID(),
      role: "ai",
      content: aiContent,
    },
  });
}
