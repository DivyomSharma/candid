"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowser();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoaded(true);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
  }, []);

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
