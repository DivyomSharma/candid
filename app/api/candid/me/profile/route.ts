import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getOrCreateCandidUser } from "@/lib/candid/persistence";
import {
  emptyCandidPersonalProfile,
  normalizeCandidPersonalProfile,
  upsertCandidPersonalProfile,
  getCandidPersonalProfile,
} from "@/lib/candid/personal-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  const authId = await getCurrentUserId();
  if (!authId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const user = await getOrCreateCandidUser(authId);
    const profile = await getCandidPersonalProfile(user.id);
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ profile: emptyCandidPersonalProfile }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function PUT(request: NextRequest) {
  const authId = await getCurrentUserId();
  if (!authId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { profile?: unknown };

  try {
    const user = await getOrCreateCandidUser(authId);
    const profile = normalizeCandidPersonalProfile(body.profile);
    await upsertCandidPersonalProfile(user.id, profile);
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "profile_save_failed" }, { status: 500 });
  }
}
