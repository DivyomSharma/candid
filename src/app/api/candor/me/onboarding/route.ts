import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, username, birthday, city, gender, lookingFor, identityChoices } = body;

    const supabase = getSupabaseAdmin();

    // Fetch internal UUID mapping
    let internalUserId;
    const { data: userRow, error: userError } = await supabase
      .from("candor_users")
      .select("id")
      .eq("clerk_id", clerkId)
      .maybeSingle();

    if (!userRow) {
      // Lazy create the user if webhook missed them
      const { data: newUser, error: createError } = await supabase
        .from("candor_users")
        .insert({ clerk_id: clerkId })
        .select("id")
        .single();
        
      if (createError || !newUser) {
        console.error("Failed to lazy-create internal user:", createError);
        return NextResponse.json({ error: "Failed to create internal user" }, { status: 500 });
      }
      internalUserId = newUser.id;
    } else {
      internalUserId = userRow.id;
    }

    // Upsert the profile data
    const { error } = await supabase.from("candor_profiles").upsert({
      user_id: internalUserId,
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
