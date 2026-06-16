"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, Check, ArrowLeft } from "lucide-react";
import { useSearchParams, usePathname } from "next/navigation";
import { useTransitionRouter } from "next-view-transitions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candid/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useCandidComposerClearance } from "@/hooks/use-candid-composer-clearance";
import { useHaptics } from "@/hooks/use-haptics";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { candidThreadPresenceStorageKey, candidThreadReadStorageKey, candidThreadStorageKey } from "@/lib/candid/thread";
import { responseDelayFor } from "@/lib/candid/timing";
import type { CandidHistoryMessage } from "@/lib/candid-api";

type Message = CandidHistoryMessage & { id: string; pending?: boolean };

// Helper to parse proposals out of AI message content
type ProposalData = {
  field?: string;
  value?: unknown;
  profileV4?: unknown;
  confidence?: number;
  reasoning?: string;
} | null;

const parseMessageContent = (content: string): { cleanContent: string, proposal: ProposalData } => {
  const proposalRegex = /<proposal>([\s\S]*?)<\/proposal>/;
  const match = content.match(proposalRegex);
  
  if (match) {
    const rawJson = match[1].trim();
    let proposalData: ProposalData = null;
    try {
      proposalData = JSON.parse(rawJson);
    } catch (e) {
      console.error("Failed to parse proposal JSON:", e);
    }
    
    const cleanContent = content.replace(proposalRegex, "").trim();
    return {
      cleanContent,
      proposal: proposalData
    };
  }
  
  return {
    cleanContent: content,
    proposal: null
  };
};

export function CandidSession({ id }: { id: string }) {
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useTransitionRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isImproveMode = searchParams.get("mode") === "improve";

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState(searchParams.get("q") ?? "");
  const [isResponding, setIsResponding] = useState(false);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [hasTriggeredImproveInit, setHasTriggeredImproveInit] = useState(false);
  const [proposalStates, setProposalStates] = useState<Record<string, "idle" | "applying" | "applied" | "skipped">>({});
  const [historyDividerId, setHistoryDividerId] = useState<string | null>(null);
  const { triggerLight, triggerMedium } = useHaptics();
  const { isKeyboardOpen, viewportHeight } = useVisualViewport();

  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldRestoreHistoryPositionRef = useRef(false);
  const previousScrollHeightRef = useRef(0);
  const shouldStickToBottomRef = useRef(true);
  const forceAutoscrollRef = useRef(false);
  const { composerRef, composerClearance, measureComposerClearance } = useCandidComposerClearance<HTMLFormElement>();

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
    if (!isSignedIn || !user?.id) return;
    setHasLoadedHistory(false);

    fetch(`/api/candid/conversations/${id}/messages`)
      .then((response) => (response.ok ? response.json() : { messages: [] }))
      .then((data: { messages: Message[]; nextCursor?: string | null; hasMore?: boolean }) => {
        if (data.messages?.length) {
          setMessages(data.messages);
          setHistoryCursor(data.nextCursor ?? null);
          setHasMoreHistory(Boolean(data.hasMore));
        } else {
          const saved = window.localStorage.getItem(candidThreadStorageKey(user.id));
          if (saved) setMessages(JSON.parse(saved) as Message[]);
        }
      })
      .finally(() => setHasLoadedHistory(true));
  }, [id, isSignedIn, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    window.localStorage.setItem(candidThreadStorageKey(user.id), JSON.stringify(messages));
    window.localStorage.setItem(candidThreadReadStorageKey(user.id), String(Date.now()));
    window.localStorage.removeItem(candidThreadPresenceStorageKey(user.id));
    window.dispatchEvent(new Event("candid-thread-presence"));
  }, [messages, user?.id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (shouldRestoreHistoryPositionRef.current) {
        const delta = document.documentElement.scrollHeight - previousScrollHeightRef.current;
        window.scrollBy({ top: delta, behavior: "instant" });
        shouldRestoreHistoryPositionRef.current = false;
        return;
      }

      measureComposerClearance();
      if (forceAutoscrollRef.current || shouldStickToBottomRef.current) {
        scrollToConversationEnd("smooth");
        forceAutoscrollRef.current = false;
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages, isResponding, measureComposerClearance, scrollToConversationEnd]);

  const history = useMemo(
    () => messages.filter((message) => !message.pending).map(({ role, content }) => ({ role, content })).slice(-10),
    [messages],
  );

  // Automatically start onboarding in improve mode
  useEffect(() => {
    if (!hasLoadedHistory || !isImproveMode || hasTriggeredImproveInit || isResponding) return;

    const lastMessage = messages[messages.length - 1];
    const shouldGreet = !lastMessage || lastMessage.role === "user";

    if (shouldGreet) {
      setHasTriggeredImproveInit(true);
      const systemText = `[System: User clicked Improve with Candid. Greet them warmly and start asking about their currently, shelf, loops, or small things in a conversational, low-pressure way to refine their profile. Use proposals like <proposal>{"field": "currently.watching", "value": "movie"}</proposal> when they mention their tastes.]\n\n`;

      const optimistic: Message = { id: crypto.randomUUID(), role: "user" as const, content: systemText };
      setMessages((current) => [...current, optimistic]);
      setIsResponding(true);

      fetch(`/api/candid/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: systemText, history: history.slice(-8), isImproveMode: true, currentScreen: pathname }),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { message: Message } | null) => {
          if (data && data.message) {
            setMessages((current) => [
              ...current.filter((msg) => msg.id !== optimistic.id),
              optimistic,
              data.message,
            ]);
          }
        })
        .finally(() => {
          setIsResponding(false);
        });
    }
  }, [hasLoadedHistory, isImproveMode, messages, hasTriggeredImproveInit, isResponding, history, id, pathname]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isResponding) return;

    const optimistic: Message = { id: crypto.randomUUID(), role: "user", content };
    forceAutoscrollRef.current = true;
    setMessages((current) => [...current, optimistic]);
    setDraft("");
    setIsResponding(true);
    triggerLight();

    await new Promise((resolve) => setTimeout(resolve, responseDelayFor({ message: content })));

    const response = await fetch(`/api/candid/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content, history, isImproveMode, currentScreen: pathname }),
    });

    if (response.ok) {
      const data = (await response.json()) as { message: Message };
      setMessages((current) => [...current.filter((message) => message.id !== optimistic.id), optimistic, data.message]);
    } else {
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "ai", content: "hmm... something got quiet there. try again in a moment." },
      ]);
    }

    setIsResponding(false);
  };

  const loadOlder = async () => {
    if (!historyCursor || isLoadingHistory || !hasMoreHistory) return;
    setIsLoadingHistory(true);
    previousScrollHeightRef.current = document.documentElement.scrollHeight;
    const response = await fetch(`/api/candid/conversations/${id}/messages?before=${encodeURIComponent(historyCursor)}&limit=60`);
    if (response.ok) {
      const data = (await response.json()) as { messages: Message[]; nextCursor?: string | null; hasMore?: boolean };
      if (data.messages.length) {
        shouldRestoreHistoryPositionRef.current = true;
        
        setMessages((current) => {
          if (current.length > 0) {
            setHistoryDividerId(current[0].id);
            setTimeout(() => setHistoryDividerId(null), 4000);
          }
          const existing = new Set(current.map((message) => message.id));
          return [...data.messages.filter((message) => !existing.has(message.id)), ...current];
        });
        setHistoryCursor(data.nextCursor ?? null);
        setHasMoreHistory(Boolean(data.hasMore));
      } else {
        setHasMoreHistory(false);
      }
    } else {
      shouldRestoreHistoryPositionRef.current = false;
    }
    setIsLoadingHistory(false);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-dvh items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 mx-auto flex max-w-[440px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">this part is yours to keep</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">
            conversations need a place to remember you.
          </p>
          <Button
            onClick={() => router.push(`/candid/login?next=${encodeURIComponent(`/candid/session/${id}`)}`)}
            className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90"
          >
            sign in
          </Button>
        </div>
      </main>
    );
  }

  const promptChips = [
    "talk",
    "voice",
    "movie",
    "music",
    "continue",
    "reflection",
    "memory",
  ];

  return (
    <main className="gradient-bg grain relative min-h-dvh overflow-x-hidden px-6 pb-48 pt-16">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[1100px] flex-col gap-12">
        <div className="pt-8 flex items-center justify-between">
          {isImproveMode ? (
            <button
              onClick={() => router.push("/candid/you")}
              className="text-xs font-light text-accent hover:underline flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> back to profile
            </button>
          ) : (
            <p className="text-sm font-light text-foreground-secondary">the same thread. still here.</p>
          )}
          {isImproveMode && (
            <span className="text-[10px] font-medium tracking-wider text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full uppercase">
              profile refinement
            </span>
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[2rem] border border-border/35 bg-[linear-gradient(135deg,hsl(var(--card)/0.30),hsl(var(--background)/0.16))] px-6 py-7 backdrop-blur-md sm:px-8">
            <p className="text-xs font-light uppercase tracking-[0.18em] text-foreground-secondary/60">
              {isImproveMode ? "improve with candid" : "candid"}
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-light leading-[1.08] tracking-tight text-foreground sm:text-4xl">
              {isImproveMode ? "make this feel more like you." : "the relationship stays in one thread."}
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-foreground-secondary">
              {isImproveMode
                ? "candid should refine profile details conversationally, not through forms."
                : "no assistant chrome. no dashboard posture. just the part of candid that remembers where you were."}
            </p>
          </div>

          <div className="rounded-[2rem] border border-border/35 bg-card/30 p-5 backdrop-blur-md">
            <p className="text-xs font-light uppercase tracking-[0.2em] text-foreground-secondary/60">keep nearby</p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {promptChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setDraft((current) => (current ? `${current} ${chip}` : chip))}
                  className="rounded-full border border-border/45 bg-background/20 px-4 py-2 text-xs font-light text-foreground-secondary transition-colors hover:border-accent/35 hover:bg-accent/10 hover:text-foreground"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div
          className="flex min-h-[55vh] flex-col gap-8"
          style={{ paddingBottom: `calc(${composerClearance}px + env(safe-area-inset-bottom, 0px))` }}
        >
          {hasMoreHistory && (
            <button
              type="button"
              onClick={loadOlder}
              disabled={isLoadingHistory}
              className="self-center rounded-full border border-border/45 bg-background/35 px-4 py-2 text-xs font-light text-foreground-secondary backdrop-blur-md transition-colors hover:border-accent/40 hover:text-foreground"
            >
              {isLoadingHistory ? "finding older thread..." : "older thread"}
            </button>
          )}

          {messages.map((message, index) => {
            const isSystemText = message.role === "user" && message.content.toLowerCase().startsWith("[system:");
            if (isSystemText) return null;

            const { cleanContent, proposal } = message.role === "ai" 
              ? parseMessageContent(message.content) 
              : { cleanContent: message.content, proposal: null };

            return (
              <div key={message.id} className="flex flex-col gap-8 w-full">
                <AnimatePresence>
                  {message.id === historyDividerId && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="w-full flex items-center gap-4 my-2"
                    >
                      <div className="h-px bg-border/40 flex-1" />
                      <span className="text-[10px] uppercase tracking-widest font-medium text-foreground-secondary/40">older messages</span>
                      <div className="h-px bg-border/40 flex-1" />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div
                  initial={{ opacity: 0, y: message.role === "ai" ? 16 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: message.role === "ai" ? 0.05 : 0,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className={message.role === "user" ? "self-end text-right flex flex-col items-end" : "self-start flex flex-col items-start"}
              >
                <p
                  className={
                    message.role === "user"
                      ? "max-w-[460px] text-lg font-light leading-8 text-foreground"
                      : "max-w-[500px] text-xl font-light leading-9 text-foreground-secondary"
                  }
                >
                  {cleanContent}
                </p>

                {/* Inline Proposal UI Card */}
                {proposal && proposal.field && proposalStates[message.id] !== "skipped" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 max-w-[430px] space-y-3 overflow-hidden rounded-2xl border border-accent/20 bg-accent/5 p-4 text-left shadow-md backdrop-blur-md"
                  >
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-wider text-accent font-medium">update recommendation</p>
                        <p className="text-xs font-light text-foreground-secondary leading-relaxed">
                          add <span className="text-foreground font-normal">"{typeof proposal.value === 'string' ? proposal.value : JSON.stringify(proposal.value)}"</span> to your profile's <span className="text-foreground font-normal">"{proposal.field.replace(".", " ")}"</span>?
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 justify-end pt-1">
                      {proposalStates[message.id] === "applied" ? (
                        <span className="text-xs font-light text-accent flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> applied to profile
                        </span>
                      ) : (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setProposalStates(prev => ({ ...prev, [message.id]: "skipped" }))}
                            disabled={proposalStates[message.id] === "applying"}
                            className="h-8 rounded-full px-3 text-xs font-light text-foreground-secondary hover:bg-background/40 hover:text-foreground shadow-none"
                          >
                            skip
                          </Button>
                          <Button
                            type="button"
                            onClick={async () => {
                              triggerMedium();
                              setProposalStates(prev => ({ ...prev, [message.id]: "applying" }));
                              try {
                                const res = await fetch("/api/candid/me/profile/update", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ field: proposal.field, value: proposal.value })
                                });
                                if (res.ok) {
                                  setProposalStates(prev => ({ ...prev, [message.id]: "applied" }));
                                } else {
                                  setProposalStates(prev => ({ ...prev, [message.id]: "idle" }));
                                }
                              } catch (e) {
                                console.error(e);
                                setProposalStates(prev => ({ ...prev, [message.id]: "idle" }));
                              }
                            }}
                            disabled={proposalStates[message.id] === "applying"}
                            className="h-8 rounded-full bg-accent px-4 text-xs font-light text-primary-foreground hover:bg-accent/90 shadow-none"
                          >
                            {proposalStates[message.id] === "applying" ? "applying..." : "apply"}
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
              </div>
            );
          })}

          {isResponding && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} className="text-xl font-light text-foreground-secondary">
              hmm...
            </motion.p>
          )}
          <div ref={scrollRef} className="h-8" style={{ scrollMarginBottom: `calc(${composerClearance}px + env(safe-area-inset-bottom, 0px))` }} />
        </div>

        <form
          ref={composerRef}
          onSubmit={submit}
          className="fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-[900px] gap-3 px-6 transition-all duration-300"
          style={{ bottom: isKeyboardOpen ? Math.max(16, typeof window !== 'undefined' ? window.innerHeight - viewportHeight + 16 : 16) : "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="keep going"
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
            disabled={!draft.trim() || isResponding}
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
