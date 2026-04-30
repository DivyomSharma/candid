"use client";

import { useState } from "react";
import { Suspense } from "react";
import { motion } from "framer-motion";
import { useSignIn } from "@clerk/nextjs/legacy";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginExperience />
    </Suspense>
  );
}

function LoginExperience() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowser();
  const { signIn, isLoaded: isClerkLoaded } = useSignIn();
  const next = searchParams.get("next") ?? "/candor/home";
  const getCallbackUrl = () =>
    `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`;

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: getCallbackUrl(),
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error("could not send link. try again later.");
    } else {
      toast.success("check your email for the link.");
      setEmail("");
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      const signUp = await fetch("/api/auth/password-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!signUp.ok) {
        setIsLoading(false);
        toast.error("that login did not open. check the details.");
        return;
      }

      const retry = await supabase.auth.signInWithPassword({ email, password });
      setIsLoading(false);

      if (retry.error) {
        toast.error("that login did not open. try again in a moment.");
        return;
      }

      router.push(next);
      return;
    }

    setIsLoading(false);
    router.push(next);
  };

  const handleClerkOAuth = async (strategy: "oauth_google" | "oauth_facebook" | "oauth_apple") => {
    if (!isClerkLoaded || !signIn) {
      toast.message("that door is still waking up. try again in a breath.");
      return;
    }

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: next,
      });
    } catch {
      toast.error("that door did not open. try again later.");
    }
  };

  return (
    <main className="gradient-bg grain relative flex min-h-screen flex-col items-center justify-center px-6">
      <AmbientGlow />
      <div className="absolute inset-0 z-0 bg-background/50 mix-blend-overlay pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[360px] surface soft-shadow rounded-3xl border border-border/50 p-8 backdrop-blur-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-light tracking-tight mb-2">enter candor</h1>
          <p className="text-sm font-light text-foreground-secondary">
            a quieter way to connect.
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-8">
          <Button
            variant="outline"
            className="w-full rounded-full h-11 border-border/50 bg-background/50 font-light hover:bg-accent/10 transition-colors"
            onClick={() => handleClerkOAuth("oauth_google")}
          >
            continue with google
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full h-11 border-border/50 bg-background/50 font-light hover:bg-accent/10 transition-colors"
            onClick={() => handleClerkOAuth("oauth_facebook")}
          >
            continue with facebook
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full h-11 border-border/50 bg-background/50 font-light hover:bg-accent/10 transition-colors"
            onClick={() => handleClerkOAuth("oauth_apple")}
          >
            continue with apple
          </Button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 font-light text-foreground-secondary">or</span>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full border border-border/50 bg-background/40 p-1 text-xs font-light">
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={`rounded-full px-3 py-2 transition-colors ${mode === "magic" ? "bg-accent text-accent-foreground" : "text-foreground-secondary"}`}
          >
            magic link
          </button>
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`rounded-full px-3 py-2 transition-colors ${mode === "password" ? "bg-accent text-accent-foreground" : "text-foreground-secondary"}`}
          >
            password
          </button>
        </div>

        <form onSubmit={mode === "magic" ? handleMagicLink : handlePassword} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-11 h-12 rounded-full border-border/50 bg-background/50 font-light focus-visible:ring-accent/40"
              required
            />
          </div>
          {mode === "password" && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-secondary" />
              <Input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 h-12 rounded-full border-border/50 bg-background/50 font-light focus-visible:ring-accent/40"
                required
              />
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading || !email || (mode === "password" && !password)}
            className="w-full rounded-full h-11 bg-accent text-primary-foreground hover:bg-accent/90"
          >
            {isLoading ? "opening..." : mode === "magic" ? "send magic link" : "enter"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </motion.div>
    </main>
  );
}
