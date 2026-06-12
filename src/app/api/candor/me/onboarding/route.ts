import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, birthday, city, gender, lookingFor, identityChoices } = body;

    const supabase = await createSupabaseServer();

    // Fetch internal UUID mapping
    const { data: userRow, error: userError } = await supabase
      .from("candor_users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !userRow) {
      console.error("Failed to find internal user:", userError);
      return NextResponse.json({ error: "Internal user missing" }, { status: 404 });
    }

    // Upsert the profile data
    const { error } = await supabase.from("candor_profiles").upsert({
      user_id: userRow.id,
      display_name: name,
      username: username || null,
      dob: birthday || null,
      city: city || null,
      gender_identity: gender || null,
      relationship_preference: lookingFor ? lookingFor.join(", ") : null,
      identity_choices: identityChoices || {},
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (error) {
      console.error("Supabase error saving onboarding:", error);
      return NextResponse.json({ error: "Failed to save profile data" }, { status: 500 });
    }

    // Set the completion cookie so middleware doesn't intercept anymore
    const response = NextResponse.json({ success: true });
    response.cookies.set("candor_onboarded", "true", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("Onboarding API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
