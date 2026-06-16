import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createEmptyMemory, normalizeMemory } from "@/lib/candid/memory";
import { accessProfileFor, getCandidAccess } from "@/lib/candid/access";
import { getAlignmentPreview } from "@/lib/candid/alignment";
import { alignmentObservation, alignmentWhy, alignmentScoreWithSignals, buildPublicProfile } from "@/lib/candid/matching";
import { getPublicIdentitiesForCandidUserIds } from "@/lib/candid/identity";
import { getAlignmentSignals } from "@/lib/candid/alignment-memory";

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
    .from("candid_users")
    .select("id")
    .eq("clerk_id", authId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabaseAdmin
    .from("candid_users")
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
    .from("candid_alignments")
    .select("id, user_a_id, user_b_id, user_a_dm_enabled, user_b_dm_enabled")
    .eq("user_a_id", userA)
    .eq("user_b_id", userB)
    .maybeSingle();

  if (existing) return existing as AlignmentRow;

  const { data: created, error } = await supabaseAdmin
    .from("candid_alignments")
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
  const access = await getCandidAccess(user.id);
  const accessProfile = accessProfileFor(access.tier);
  const { data: traits } = await supabaseAdmin
    .from("candid_traits")
    .select("data")
    .eq("user_id", user.id)
    .maybeSingle();

  const memory = normalizeMemory(traits?.data ?? createEmptyMemory());
  const preview = getAlignmentPreview(memory);

  if (!memory.alignmentReady) {
    return NextResponse.json({ ready: false, observation: "finding someone who listens like you do.", aligns: [] });
  }

  const { data: allTraits } = await supabaseAdmin
    .from("candid_traits")
    .select("user_id, data")
    .neq("user_id", user.id);

  const allUserIds = [user.id as string, ...(allTraits ?? []).map((row) => row.user_id as string)];
  const signalMap = await getAlignmentSignals(allUserIds);
  const mySignals = signalMap.get(user.id as string) ?? [];

  const scored = (allTraits ?? [])
    .map((row) => {
      const otherMemory = normalizeMemory(row.data);
      const otherUserId = row.user_id as string;
      const theirSignals = signalMap.get(otherUserId) ?? [];
      return {
        userId: otherUserId,
        memory: otherMemory,
        signals: theirSignals,
        score: otherMemory.alignmentReady
          ? alignmentScoreWithSignals({ a: memory, b: otherMemory, aSignals: mySignals, bSignals: theirSignals })
          : 0,
      };
    })
    .filter((item) => item.score >= accessProfile.minAlignScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, accessProfile.alignCount);
  const identities = await getPublicIdentitiesForCandidUserIds(scored.map((item) => item.userId));

  const aligns = await Promise.all(
    scored.map(async (item) => {
      const alignment = await ensureAlignment(user.id, item.userId, item.score);
      const myDmOn = dmEnabledFor(alignment, user.id);
      const theirDmOn = otherDmEnabledFor(alignment, user.id);
      return {
        id: alignment.id,
        score: item.score,
        observation: alignmentObservation(memory, item.memory, item.signals),
        why: alignmentWhy(memory, item.memory),
        profile: buildPublicProfile(item.memory, item.userId, identities.get(item.userId)),
        myDmOn,
        theirDmOn,
        canText: myDmOn && theirDmOn,
      };
    }),
  );

  return NextResponse.json({
    ready: true,
    observation: aligns[0]?.observation ?? "finding someone who listens like you do.",
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
    .from("candid_alignments")
    .select("id, user_a_id, user_b_id, user_a_dm_enabled, user_b_dm_enabled")
    .eq("id", body.alignmentId)
    .maybeSingle();

  if (!alignment || (alignment.user_a_id !== user.id && alignment.user_b_id !== user.id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const field = alignment.user_a_id === user.id ? "user_a_dm_enabled" : "user_b_dm_enabled";
  const { data: updated, error } = await supabaseAdmin
    .from("candid_alignments")
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
