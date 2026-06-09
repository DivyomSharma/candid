import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createEmptyMemory, normalizeMemory, extractLightMemory, mergeMemory } from "@/lib/candor/memory";
import { selectSignals, generateAiSignals, STATIC_SIGNALS, getDeterministicSplit } from "@/lib/candor/scenarios";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const authId = await getCurrentUserId();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "3")));
  const excludeId = searchParams.get("excludeId");

  if (!authId) {
    const dummyMemory = createEmptyMemory();
    let signals = selectSignals(dummyMemory, limit);
    if (excludeId) {
      signals = signals.filter((s) => s.id !== excludeId);
    }
    return NextResponse.json({ signals }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const user = await getOrCreateUser(authId);
    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    
    // Use AI-generated signals for authenticated users
    let signals = await generateAiSignals(memory, limit + (excludeId ? 1 : 0));
    
    if (excludeId) {
      signals = signals.filter((s) => s.id !== excludeId);
    }
    signals = signals.slice(0, limit);

    return NextResponse.json({ signals }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET signals failed:", error);
    const dummyMemory = createEmptyMemory();
    const signals = selectSignals(dummyMemory, limit);
    return NextResponse.json({ signals }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function POST(request: NextRequest) {
  const authId = await getCurrentUserId();
  if (!authId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { signalId?: string; option?: string };
    if (!body.signalId || !body.option) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const user = await getOrCreateUser(authId);
    
    // Fetch current traits
    const { data: traits } = await supabaseAdmin
      .from("candor_traits")
      .select("data")
      .eq("user_id", user.id)
      .maybeSingle();

    const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
    
    // Update answeredSignals & seenScenarios
    const updatedSeen = Array.from(new Set([...(memory.seenScenarios ?? []), body.signalId]));
    const updatedAnswers = {
      ...(memory.answeredSignals ?? {}),
      [body.signalId]: body.option
    };

    let updatedMemory = {
      ...memory,
      seenScenarios: updatedSeen,
      answeredSignals: updatedAnswers
    };

    // Find prompt content to extract light memory
    const originalSignal = STATIC_SIGNALS.find((s) => s.id === body.signalId);
    if (originalSignal) {
      // Feed prompt + answer into the light memory extractor
      const extracted = extractLightMemory(`${originalSignal.prompt} ${body.option}`);
      updatedMemory = mergeMemory(updatedMemory, extracted);
    }

    // Save back to DB
    await supabaseAdmin.from("candor_traits").upsert(
      { user_id: user.id, data: updatedMemory },
      { onConflict: "user_id" }
    );

    // Compute split for community reveal
    const split = originalSignal?.options.length
      ? getDeterministicSplit(body.signalId, originalSignal.options.length)
      : undefined;

    return NextResponse.json({ ok: true, communitySplit: split });
  } catch (error) {
    console.error("POST signal answer failed:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
