import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/candor/home";

  if (code) {
    const supabase = await createSupabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
