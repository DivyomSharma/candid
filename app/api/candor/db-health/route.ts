import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return NextResponse.json(
      { ok: false, error: "missing_supabase_env" },
      { status: 503 },
    );
  }

  try {
    const { count, error } = await supabaseAdmin
      .from("candor_users")
      .select("id", { count: "exact", head: true });

    if (error) throw error;

    return NextResponse.json({ ok: true, userCount: count ?? 0 });
  } catch (error) {
    console.error("Database health check failed:", error);
    return NextResponse.json(
      { ok: false, error: "database_unavailable" },
      { status: 500 },
    );
  }
}
