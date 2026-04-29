import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => ({}))) as { message?: string };
    const opening = body.message?.trim();

    const user = await getOrCreateUser(userId);

    const { data: traitsRow } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    // Create conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from("candor_conversations")
      .insert({ user_id: user.id })
      .select("id")
      .single();

    if (convError) throw convError;

    if (opening) {
      await supabaseAdmin.from("candor_messages").insert({
        conversation_id: conversation!.id,
        role: "user",
        content: opening,
      });

      let aiContent = "hmm... that already says something.\nlet it stay here for a second.";
      let memory = normalizeMemory(traitsRow?.data ?? createEmptyMemory());

      try {
        const turn = await runCandorTurn({
          userId,
          message: opening,
          history: [],
          memory,
        });
        aiContent = turn.reply;
        memory = turn.memory;
      } catch (error) {
        console.error("Candor AI fallback used:", error);
      }

      await supabaseAdmin.from("candor_messages").insert({
        conversation_id: conversation!.id,
        role: "ai",
        content: aiContent,
      });

      // Upsert traits
      await supabaseAdmin.from("candor_traits").upsert(
        { user_id: user.id, data: memory },
        { onConflict: "user_id" },
      );
    }

    return NextResponse.json({ id: conversation!.id, persisted: true });
  } catch (error) {
    console.error("Conversation creation failed:", error);
    return NextResponse.json({
      id: `local-${crypto.randomUUID()}`,
      persisted: false,
      warning: "database_unavailable",
    });
  }
}
