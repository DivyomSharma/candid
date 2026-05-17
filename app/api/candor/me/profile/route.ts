import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { getOrCreateCandorUser } from "@/lib/candor/persistence";
import {
  emptyCandorPersonalProfile,
  normalizeCandorPersonalProfile,
  upsertCandorPersonalProfile,
  getCandorPersonalProfile,
} from "@/lib/candor/personal-profile";

export const dynamic = "force-dynamic";

export async function GET() {
  const authId = await getCurrentUserId();
  if (!authId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const user = await getOrCreateCandorUser(authId);
    const profile = await getCandorPersonalProfile(user.id);
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ profile: emptyCandorPersonalProfile }, { headers: { "Cache-Control": "no-store" } });
  }
}

export async function PUT(request: NextRequest) {
  const authId = await getCurrentUserId();
  if (!authId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { profile?: unknown };

  try {
    const user = await getOrCreateCandorUser(authId);
    const profile = normalizeCandorPersonalProfile(body.profile);
    await upsertCandorPersonalProfile(user.id, profile);
    return NextResponse.json({ profile }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "profile_save_failed" }, { status: 500 });
  }
}
