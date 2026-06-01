"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUp, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useCandorComposerClearance } from "@/hooks/use-candor-composer-clearance";

type AlignProfile = {
  id: string;
  profile: {
    username: string;
    avatarInitials: string;
    avatarTone: string;
  };
  canText: boolean;
  candorInvited?: boolean;
};

type DmMessage = {
  id: string;
  mine: boolean;
  content: string;
  createdAt?: string;
  pending?: boolean;
};

export function CandorDmChat({ id }: { id: string }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [align, setAlign] = useState<AlignProfile | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldStickToBottomRef = useRef(true);
  const forceAutoscrollRef = useRef(false);
  const { composerRef, composerClearance, measureComposerClearance } = useCandorComposerClearance<HTMLFormElement>();
  const [isInviting, setIsInviting] = useState(false);

  const sparks = [
    "candor notices they're into obscure cinema... ask about a24?",
    "candor noticed they prefer directness... ask a question they're avoiding?",
    "candor sees they read late... ask about their 2am thoughts?",
    "candor feels the pacing shifted... ask what they're distracted by?",
    "candor notices they like slow openers... ask what they secretly hate?",
  ];
  const [sparkIndex, setSparkIndex] = useState(0);

  const isNearBottom = useCallback(() => {
    if (typeof window === "undefined") return true;
    const page = document.documentElement;
    return page.scrollHeight - window.scrollY - window.innerHeight <= composerClearance + 160;
  }, [composerClearance]);

  const scrollToConversationEnd = useCallback(
    (behavior: ScrollBehavior = "smooth") => {
      scrollRef.current?.scrollIntoView({ behavior, block: "end" });
      window.requestAnimationFrame(() => {
        const composerTop = composerRef.current?.getBoundingClientRect().top;
        const markerBottom = scrollRef.current?.getBoundingClientRect().bottom;
        if (composerTop === undefined || markerBottom === undefined || markerBottom <= composerTop - 24) return;
        window.scrollBy({ top: markerBottom - composerTop + 24, behavior });
      });
    },
    [composerRef],
  );

  useEffect(() => {
    const updateStickiness = () => {
      shouldStickToBottomRef.current = isNearBottom();
    };

    updateStickiness();
    window.addEventListener("scroll", updateStickiness, { passive: true });
    window.addEventListener("resize", updateStickiness);

    return () => {
      window.removeEventListener("scroll", updateStickiness);
      window.removeEventListener("resize", updateStickiness);
    };
  }, [isNearBottom]);

  useEffect(() => {
    if (!isSignedIn) return;

    fetch(`/api/candor/aligns/${id}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: AlignProfile | null) => {
        setAlign(payload);
        if (payload && !payload.canText) router.replace(`/candor/aligns/${id}`);
      });
  }, [id, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;

    const load = () => {
      fetch(`/api/candor/aligns/${id}/messages`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: { messages?: DmMessage[]; locked?: boolean } | null) => {
          if (payload?.locked) {
            router.replace(`/candor/aligns/${id}`);
            return;
          }
          setMessages((current) => {
            const pending = current.filter((message) => message.pending);
            return [...(payload?.messages ?? []), ...pending];
          });
        });
    };

    load();
    const interval = window.setInterval(load, 5000);
    return () => window.clearInterval(interval);
  }, [id, isSignedIn, router]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      measureComposerClearance();
      if (forceAutoscrollRef.current || shouldStickToBottomRef.current) {
        scrollToConversationEnd("smooth");
        forceAutoscrollRef.current = false;
      }
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [messages, isSending, measureComposerClearance, scrollToConversationEnd]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const optimistic: DmMessage = { id: crypto.randomUUID(), mine: true, content, pending: true };
    forceAutoscrollRef.current = true;
    setMessages((current) => [...current, optimistic]);
    setDraft("");
    setIsSending(true);

    const response = await fetch(`/api/candor/aligns/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (response.ok) {
      const payload = (await response.json()) as { message: DmMessage };
      setMessages((current) => current.map((message) => (message.id === optimistic.id ? payload.message : message)));
    } else {
      setMessages((current) => current.filter((message) => message.id !== optimistic.id));
    }

    setIsSending(false);
  };

  const inviteCandor = async () => {
    if (!align || align.candorInvited || isInviting) return;
    setIsInviting(true);
    const response = await fetch(`/api/candor/aligns/${id}/invite`, { method: "POST" });
    if (response.ok) {
      setAlign((prev) => prev ? { ...prev, candorInvited: true } : null);
    }
    setIsInviting(false);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 mx-auto flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">dm opens after sign in</h1>
          <Button onClick={() => router.push(`/candor/login?next=${encodeURIComponent(`/candor/aligns/${id}/chat`)}`)} className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90">
            sign in
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-36 pt-16">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-8">
        <div className="sticky top-0 z-20 -mx-6 flex items-center justify-between bg-background/45 px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push(`/candor/aligns/${id}`)} className="rounded-full border border-border/50 p-2 text-foreground-secondary transition-colors hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </button>
            {align && (
              <>
                <Avatar className="h-10 w-10 border border-border/60 bg-background/70">
                  <AvatarFallback className="text-sm font-light text-foreground" style={{ background: align.profile.avatarTone }}>
                    {align.profile.avatarInitials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-light text-foreground">{align.profile.username}</p>
                  <p className="text-xs font-light text-foreground-secondary">dm mode</p>
                </div>
              </>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={inviteCandor}
            disabled={align?.candorInvited || isInviting}
            className={align?.candorInvited 
              ? "rounded-full text-[11px] uppercase tracking-wider font-light text-foreground-secondary opacity-70 pointer-events-none"
              : "rounded-full text-[11px] uppercase tracking-wider font-light text-accent/80 hover:bg-accent/10 hover:text-accent"
            }
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            {align?.candorInvited ? "candor is reading" : isInviting ? "inviting..." : "invite candor"}
          </Button>
        </div>

        <div
          className="flex min-h-[60vh] flex-col gap-8"
          style={{ paddingBottom: `calc(${composerClearance}px + env(safe-area-inset-bottom, 0px))` }}
        >
          {messages.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.65 }} className="pt-16 text-center text-lg font-light text-foreground-secondary">
              say something simple first.
            </motion.p>
          )}

          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: message.mine ? 8 : 16 }}
              animate={{ opacity: message.pending ? 0.55 : 1, y: 0 }}
              transition={{ duration: message.mine ? 0.25 : 0.55 }}
              className={message.mine ? "self-end text-right" : "self-start"}
            >
              <p
                className={
                  message.mine
                    ? "max-w-[460px] whitespace-pre-wrap text-lg font-light leading-8 text-foreground"
                    : "max-w-[500px] whitespace-pre-wrap text-xl font-light leading-9 text-foreground-secondary"
                }
              >
                {message.role === "user" ? message.content.replace(/^\[System:.*?\]\n\n/s, "") : message.content}
              </p>
            </motion.div>
          ))}
          <div ref={scrollRef} className="h-8" style={{ scrollMarginBottom: `calc(${composerClearance}px + env(safe-area-inset-bottom, 0px))` }} />
        </div>

        <div 
          className="fixed inset-x-0 z-20 flex justify-center px-6 transition-all duration-500 ease-in-out"
          style={{ bottom: "calc(11.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <AnimatePresence mode="wait">
            <motion.button
              key={sparkIndex}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              type="button"
              onClick={() => {
                const prompt = sparks[sparkIndex];
                const topic = prompt.split("... ask ")[1]?.replace("?", "") || "that";
                setDraft(`what's your take on ${topic}?`);
                setSparkIndex((prev) => (prev + 1) % sparks.length);
              }}
              className="flex items-center gap-2 rounded-full border border-accent/20 bg-background/50 px-4 py-2.5 text-xs font-light text-foreground-secondary backdrop-blur-md transition-all hover:border-accent/50 hover:text-foreground shadow-[0_4px_14px_-4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_14px_-4px_hsl(var(--accent)/0.15)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent/80" />
              <span>{sparks[sparkIndex]}</span>
            </motion.button>
          </AnimatePresence>
        </div>

        <form
          ref={composerRef}
          onSubmit={submit}
          className="fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-[600px] gap-3 px-6"
          style={{ bottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="write gently"
            className="min-h-14 resize-none rounded-2xl border-border/50 bg-background/70 px-5 py-4 text-base font-light leading-6 shadow-none backdrop-blur-md focus-visible:ring-accent/40"
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <Button
            type="submit"
            disabled={!draft.trim() || isSending || !align?.canText}
            size="icon"
            className="mt-1 rounded-full bg-accent text-primary-foreground hover:bg-accent/90"
          >
            <ArrowUp />
          </Button>
        </form>
      </section>
      <BottomNav />
    </main>
  );
}
