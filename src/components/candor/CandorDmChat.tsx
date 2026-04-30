"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";

type AlignProfile = {
  id: string;
  profile: {
    username: string;
    avatarInitials: string;
    avatarTone: string;
  };
  canText: boolean;
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
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [messages, isSending]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isSending) return;

    const optimistic: DmMessage = { id: crypto.randomUUID(), mine: true, content, pending: true };
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
        <div className="sticky top-0 z-20 -mx-6 flex items-center gap-3 bg-background/45 px-6 py-3 backdrop-blur-md">
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

        <div className="flex min-h-[60vh] flex-col gap-8 pb-36">
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
                {message.content}
              </p>
            </motion.div>
          ))}
          <div ref={scrollRef} className="h-8" />
        </div>

        <form onSubmit={submit} className="fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-[600px] gap-3 px-6">
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
