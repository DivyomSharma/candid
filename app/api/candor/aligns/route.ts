import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createEmptyMemory, normalizeMemory } from "@/lib/candor/memory";
import { getAlignmentPreview } from "@/lib/candor/alignment";
import { alignmentLanguage, alignmentScore, buildPublicProfile } from "@/lib/candor/matching";

type AlignmentRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  user_a_dm_enabled: boolean;
  user_b_dm_enabled: boolean;
};

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

function orderedPair(a: string, b: string) {
  return a < b ? [a, b] : [b, a];
}

function dmEnabledFor(row: AlignmentRow, userId: string) {
  return row.user_a_id === userId ? row.user_a_dm_enabled : row.user_b_dm_enabled;
}

function otherDmEnabledFor(row: AlignmentRow, userId: string) {
  return row.user_a_id === userId ? row.user_b_dm_enabled : row.user_a_dm_enabled;
}

async function ensureAlignment(userId: string, otherUserId: string, score: number) {
  const supabaseAdmin = getSupabaseAdmin();
  const [userA, userB] = orderedPair(userId, otherUserId);
  const { data: existing } = await supabaseAdmin
    .from("candor_alignments")
    .select("id, user_a_id, user_b_id, user_a_dm_enabled, user_b_dm_enabled")
    .eq("user_a_id", userA)
    .eq("user_b_id", userB)
    .maybeSingle();

  if (existing) return existing as AlignmentRow;

  const { data: created, error } = await supabaseAdmin
    .from("candor_alignments")
    .insert({ user_a_id: userA, user_b_id: userB, score })
    .select("id, user_a_id, user_b_id, user_a_dm_enabled, user_b_dm_enabled")
    .single();

  if (error) throw error;
  return created as AlignmentRow;
}

export async function GET() {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabaseAdmin = getSupabaseAdmin();
  const user = await getOrCreateUser(authId);
  const { data: traits } = await supabaseAdmin
    .from("candor_traits")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
  const preview = getAlignmentPreview(memory);

  if (!memory.alignmentReady) {
    return NextResponse.json({ ready: false, language: preview.language, aligns: [] });
  }

  const { data: allTraits } = await supabaseAdmin
    .from("candor_traits")
    .select("user_id, data")
    .neq("user_id", user.id);

  const scored = (allTraits ?? [])
    .map((row) => {
      const otherMemory = normalizeMemory(row.data);
      return {
        userId: row.user_id as string,
        memory: otherMemory,
        score: otherMemory.alignmentReady ? alignmentScore(memory, otherMemory) : 0,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const aligns = await Promise.all(
    scored.map(async (item) => {
      const alignment = await ensureAlignment(user.id, item.userId, item.score);
      const myDmOn = dmEnabledFor(alignment, user.id);
      const theirDmOn = otherDmEnabledFor(alignment, user.id);
      return {
        id: alignment.id,
        score: item.score,
        language: alignmentLanguage(memory, item.memory),
        profile: buildPublicProfile(item.memory),
        myDmOn,
        theirDmOn,
        canText: myDmOn && theirDmOn,
      };
    }),
  );

  return NextResponse.json({
    ready: true,
    language: aligns[0]?.language ?? preview.language,
    aligns,
  });
}

export async function PATCH(request: NextRequest) {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { alignmentId?: string; dmOn?: boolean };
  if (!body.alignmentId || typeof body.dmOn !== "boolean") {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const user = await getOrCreateUser(authId);
  const { data: alignment } = await supabaseAdmin
    .from("candor_alignments")
    .select("id, user_a_id, user_b_id, user_a_dm_enabled, user_b_dm_enabled")
    .eq("id", body.alignmentId)
    .maybeSingle();

  if (!alignment || (alignment.user_a_id !== user.id && alignment.user_b_id !== user.id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const field = alignment.user_a_id === user.id ? "user_a_dm_enabled" : "user_b_dm_enabled";
  const { data: updated, error } = await supabaseAdmin
    .from("candor_alignments")
    .update({ [field]: body.dmOn })
    .eq("id", body.alignmentId)
    .select("id, user_a_id, user_b_id, user_a_dm_enabled, user_b_dm_enabled")
    .single();

  if (error) throw error;

  const row = updated as AlignmentRow;
  const myDmOn = dmEnabledFor(row, user.id);
  const theirDmOn = otherDmEnabledFor(row, user.id);
  return NextResponse.json({ myDmOn, theirDmOn, canText: myDmOn && theirDmOn });
}
