"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import type { CandorHistoryMessage } from "@/lib/candor-api";

type Message = CandorHistoryMessage & { id: string; pending?: boolean };

export function CandorSession({ id }: { id: string }) {
  const { isLoaded, isSignedIn } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    fetch(`/api/candor/conversations/${id}/messages`)
      .then((response) => (response.ok ? response.json() : { messages: [] }))
      .then((data: { messages: Message[] }) => setMessages(data.messages ?? []));
  }, [id, isSignedIn]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isResponding]);

  const history = useMemo(
    () => messages.filter((message) => !message.pending).map(({ role, content }) => ({ role, content })),
    [messages],
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || isResponding) return;

    const optimistic: Message = { id: crypto.randomUUID(), role: "user", content };
    setMessages((current) => [...current, optimistic]);
    setDraft("");
    setIsResponding(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

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

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 mx-auto flex max-w-[440px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">this part is yours to keep</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">
            conversations need a place to remember you.
          </p>
          <SignInButton mode="modal">
            <Button className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90">sign in</Button>
          </SignInButton>
        </div>
      </main>
    );
  }

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-36 pt-16">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-12">
        <div className="pt-8">
          <p className="text-sm font-light text-foreground-secondary">candor is listening</p>
        </div>

        <div className="flex min-h-[55vh] flex-col gap-12">
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
              {index < messages.length - 1 && <div className="mt-8 h-px w-10 bg-border/50" />}
            </motion.div>
          ))}

          {isResponding && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} className="text-xl font-light text-foreground-secondary">
              hmm...
            </motion.p>
          )}
          <div ref={scrollRef} />
        </div>

        <form onSubmit={submit} className="fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-[600px] gap-3 px-6">
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
