"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useClerk, useUser as useClerkUser } from "@clerk/nextjs";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export type CandorAuthUser = {
  id: string;
  email: string | null;
  provider: "supabase" | "clerk";
};

interface AuthContextType {
  user: CandorAuthUser | null;
  session: Session | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoaded: false,
  isSignedIn: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isSupabaseLoaded, setIsSupabaseLoaded] = useState(false);
  const { user: clerkUser, isLoaded: isClerkLoaded } = useClerkUser();
  const { signOut: clerkSignOut } = useClerk();

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      setIsSupabaseLoaded(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setSupabaseUser(s?.user ?? null);
      setIsSupabaseLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowser();
    await Promise.allSettled([supabase.auth.signOut(), clerkSignOut()]);
  }, [clerkSignOut]);

  const user: CandorAuthUser | null = supabaseUser
    ? {
        id: supabaseUser.id,
        email: supabaseUser.email ?? null,
        provider: "supabase",
      }
    : clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress ?? null,
          provider: "clerk",
        }
      : null;

  const isLoaded = isSupabaseLoaded && isClerkLoaded;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoaded,
        isSignedIn: !!user,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
