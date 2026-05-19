import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { normalizeMemory } from "@/lib/candor/memory";
import { buildPublicProfile } from "@/lib/candor/matching";
import { getPublicIdentityForCandorUserId } from "@/lib/candor/identity";
import { getAlignmentSignals } from "@/lib/candor/alignment-memory";

type AlignmentRow = {
  id: string;
  score: number;
  user_a_id: string;
  user_b_id: string;
  user_a_dm_enabled: boolean;
  user_b_dm_enabled: boolean;
  candor_invited: boolean | null;
};

async function getUser(authId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from("candor_users").select("id").eq("clerk_id", authId).maybeSingle();
  return data;
}

function dmEnabledFor(row: AlignmentRow, userId: string) {
  return row.user_a_id === userId ? row.user_a_dm_enabled : row.user_b_dm_enabled;
}

function otherDmEnabledFor(row: AlignmentRow, userId: string) {
  return row.user_a_id === userId ? row.user_b_dm_enabled : row.user_a_dm_enabled;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(authId);
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { id } = await params;
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("candor_alignments")
    .select("id, score, user_a_id, user_b_id, user_a_dm_enabled, user_b_dm_enabled, candor_invited")
    .eq("id", id)
    .maybeSingle();

  const alignment = data as AlignmentRow | null;
  if (!alignment || (alignment.user_a_id !== user.id && alignment.user_b_id !== user.id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const otherUserId = alignment.user_a_id === user.id ? alignment.user_b_id : alignment.user_a_id;
  const { data: traits } = await supabaseAdmin
    .from("candor_traits")
    .select("data")
    .eq("user_id", otherUserId)
    .maybeSingle();

  if (!traits) return NextResponse.json({ error: "profile_not_found" }, { status: 404 });

  const myDmOn = dmEnabledFor(alignment, user.id);
  const theirDmOn = otherDmEnabledFor(alignment, user.id);
  const identity = await getPublicIdentityForCandorUserId(otherUserId);
  const signals = await getAlignmentSignals([otherUserId]);
  const profile = buildPublicProfile(normalizeMemory(traits.data), otherUserId, identity);
  const conversationSignals = signals.get(otherUserId)?.slice(0, 2) ?? [];

  return NextResponse.json({
    id: alignment.id,
    score: alignment.score,
    profile: {
      ...profile,
      conversation: [...conversationSignals, ...profile.conversation].slice(0, 4),
    },
    myDmOn,
    theirDmOn,
    canText: myDmOn && theirDmOn,
    candorInvited: alignment.candor_invited ?? false,
  });
}
