import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { applyLearningEvent, logLearningEvent } from "@/lib/candor/learning";
import { buildTraitCluster, createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import type { CandorLearningEvent } from "@/lib/candor/types";
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
  const authId = await getCurrentUserId();

  if (!authId) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Partial<CandorLearningEvent>;
    const supabaseAdmin = getSupabaseAdmin();
    const user = await getOrCreateUser(authId);
    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    const event: CandorLearningEvent = {
      traitCluster: body.traitCluster || buildTraitCluster(memory),
      choicePattern: typeof body.choicePattern === "string" ? body.choicePattern : null,
      insightType: typeof body.insightType === "string" ? body.insightType : null,
      accepted: typeof body.accepted === "boolean" ? body.accepted : null,
      engagementSignal:
        typeof body.engagementSignal === "string" && body.engagementSignal
          ? body.engagementSignal
          : "interaction",
    };

    const nextMemory = applyLearningEvent(memory, event);

    await supabaseAdmin.from("candor_traits").upsert(
      { user_id: user.id, data: nextMemory },
      { onConflict: "user_id" },
    );

    await logLearningEvent(authId, nextMemory, event);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Learning event failed:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
