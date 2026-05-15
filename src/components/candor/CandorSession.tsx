"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useCandorComposerClearance } from "@/hooks/use-candor-composer-clearance";
import { candorThreadStorageKey } from "@/lib/candor/thread";
import { responseDelayFor } from "@/lib/candor/timing";
import type { CandorHistoryMessage } from "@/lib/candor-api";

type Message = CandorHistoryMessage & { id: string; pending?: boolean };

export function CandorSession({ id }: { id: string }) {
  const { isLoaded, isSignedIn, user } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [historyCursor, setHistoryCursor] = useState<string | null>(null);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shouldRestoreHistoryPositionRef = useRef(false);
  const previousScrollHeightRef = useRef(0);
  const shouldStickToBottomRef = useRef(true);
  const forceAutoscrollRef = useRef(false);
  const { composerRef, composerClearance, measureComposerClearance } = useCandorComposerClearance<HTMLFormElement>();

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

    fetch(`/api/candor/conversations/${id}/messages`)
      .then((response) => (response.ok ? response.json() : { messages: [] }))
      .then((data: { messages: Message[]; nextCursor?: string | null; hasMore?: boolean }) => {
        if (data.messages?.length) {
          setMessages(data.messages);
          setHistoryCursor(data.nextCursor ?? null);
          setHasMoreHistory(Boolean(data.hasMore));
          return;
        }

        const saved = window.localStorage.getItem(candorThreadStorageKey(user.id));
        if (saved) setMessages(JSON.parse(saved) as Message[]);
      });
  }, [id, isSignedIn, user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    window.localStorage.setItem(candorThreadStorageKey(user.id), JSON.stringify(messages));
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
    () => messages.filter((message) => !message.pending).map(({ role, content }) => ({ role, content })),
    [messages],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isResponding) return;

    const optimistic: Message = { id: crypto.randomUUID(), role: "user", content };
    forceAutoscrollRef.current = true;
    setMessages((current) => [...current, optimistic]);
    setDraft("");
    setIsResponding(true);

    await new Promise((resolve) => setTimeout(resolve, responseDelayFor({ message: content })));

    const response = await fetch(`/api/candor/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: content, history }),
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
    const response = await fetch(`/api/candor/conversations/${id}/messages?before=${encodeURIComponent(historyCursor)}&limit=60`);
    if (response.ok) {
      const data = (await response.json()) as { messages: Message[]; nextCursor?: string | null; hasMore?: boolean };
      if (data.messages.length) {
        shouldRestoreHistoryPositionRef.current = true;
        setMessages((current) => {
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
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 mx-auto flex max-w-[440px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">this part is yours to keep</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">
            conversations need a place to remember you.
          </p>
          <Button
            onClick={() => router.push(`/candor/login?next=${encodeURIComponent(`/candor/session/${id}`)}`)}
            className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90"
          >
            sign in
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-36 pt-16">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-12">
        <div className="pt-8">
          <p className="text-sm font-light text-foreground-secondary">the same thread. still here.</p>
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

          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: message.role === "ai" ? 16 : 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: message.role === "ai" ? 0.7 : 0.25, delay: message.role === "ai" ? 0.08 : 0 }}
              className={message.role === "user" ? "self-end text-right" : "self-start"}
            >
              <p
                className={
                  message.role === "user"
                    ? "max-w-[460px] text-lg font-light leading-8 text-foreground"
                    : "max-w-[500px] text-xl font-light leading-9 text-foreground-secondary"
                }
              >
                {message.content}
              </p>
            </motion.div>
          ))}

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
          className="fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-[600px] gap-3 px-6"
          style={{ bottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
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
