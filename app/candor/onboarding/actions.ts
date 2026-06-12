"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function syncOnboardingCookieAndRedirect() {
  const cookieStore = await cookies();
  cookieStore.set("candor_onboarded", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  
  redirect("/candor/home");
}
