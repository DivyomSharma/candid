import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const supabaseAdmin = getSupabaseAdmin();
  const { data: user } = await supabaseAdmin.from("candid_users").select("id").eq("clerk_id", authId).maybeSingle();
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const { id } = await params;
  const { data: alignment } = await supabaseAdmin
    .from("candid_alignments")
    .select("id, user_a_id, user_b_id")
    .eq("id", id)
    .maybeSingle();

  if (!alignment || (alignment.user_a_id !== user.id && alignment.user_b_id !== user.id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("candid_alignments")
    .update({ candid_invited: true })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "failed_to_update" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, candidInvited: true });
}
