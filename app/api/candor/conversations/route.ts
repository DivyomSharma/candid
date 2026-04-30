import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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

    const id = `local-${crypto.randomUUID()}`;
    let aiContent: string | null = null;

    if (opening) {
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
        aiContent = `[DEBUG]: ${error instanceof Error ? error.message : String(error)} \n\nhmm... that already says something.\nlet it stay here for a second.`;
      }

      // Upsert traits
      await supabaseAdmin.from("candor_traits").upsert(
        { user_id: user.id, data: memory },
        { onConflict: "user_id" },
      );
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
      id: `local-${crypto.randomUUID()}`,
      persisted: false,
      warning: "database_unavailable",
    });
  }
}
