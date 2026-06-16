import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type AlignmentRow = {
  id: string;
  user_a_id: string;
  user_b_id: string;
  user_a_dm_enabled: boolean;
  user_b_dm_enabled: boolean;
};

async function getUser(authId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin.from("candid_users").select("id").eq("clerk_id", authId).maybeSingle();
  return data;
}

async function getAlignment(id: string, userId: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("candid_alignments")
    .select("id, user_a_id, user_b_id, user_a_dm_enabled, user_b_dm_enabled")
    .eq("id", id)
    .maybeSingle();

  const alignment = data as AlignmentRow | null;
  if (!alignment || (alignment.user_a_id !== userId && alignment.user_b_id !== userId)) return null;
  return alignment;
}

function canText(alignment: AlignmentRow) {
  return alignment.user_a_dm_enabled && alignment.user_b_dm_enabled;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(authId);
  const { id } = await params;
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const alignment = await getAlignment(id, user.id);
  if (!alignment) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!canText(alignment)) return NextResponse.json({ messages: [], locked: true });

  const supabaseAdmin = getSupabaseAdmin();
  const { data: messages } = await supabaseAdmin
    .from("candid_dm_messages")
    .select("id, sender_id, content, created_at")
    .eq("alignment_id", id)
    .order("created_at", { ascending: true })
    .limit(80);

  return NextResponse.json({
    locked: false,
    messages: (messages ?? []).map((message) => ({
      id: message.id,
      mine: message.sender_id === user.id,
      content: message.content,
      createdAt: message.created_at,
    })),
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authId = await getCurrentUserId();
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const user = await getUser(authId);
  const { id } = await params;
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const alignment = await getAlignment(id, user.id);
  if (!alignment) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!canText(alignment)) return NextResponse.json({ error: "dm_locked" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as { content?: string };
  const content = body.content?.trim();
  if (!content) return NextResponse.json({ error: "message_required" }, { status: 400 });

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin
    .from("candid_dm_messages")
    .insert({ alignment_id: id, sender_id: user.id, content: content.slice(0, 1200) })
    .select("id, sender_id, content, created_at")
    .single();

  if (error) throw error;

  return NextResponse.json({
    message: {
      id: data.id,
      mine: true,
      content: data.content,
      createdAt: data.created_at,
    },
  });
}
