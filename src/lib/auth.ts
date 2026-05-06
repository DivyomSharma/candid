import { auth } from "@clerk/nextjs/server";
import { createSupabaseServer } from "@/lib/supabase-server";

export async function getCurrentUser() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  if (user?.id) return user.id;

  const { userId } = await auth();
  return userId ?? null;
}
