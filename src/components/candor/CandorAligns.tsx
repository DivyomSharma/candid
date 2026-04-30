"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowUp, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AmbientGlow } from "@/components/magicui/ambient-glow";
import { BottomNav } from "@/components/candor/BottomNav";
import { useAuth } from "@/contexts/AuthContext";

type Align = {
  id: string;
  score: number;
  language: string;
  profile: {
    title: string;
    about: string;
    values: string[];
    conversation: string[];
  };
  myDmOn: boolean;
  theirDmOn: boolean;
  canText: boolean;
};

type AlignsResponse = {
  ready: boolean;
  language: string;
  aligns: Align[];
};

type DmMessage = {
  id: string;
  mine: boolean;
  content: string;
};

export function CandorAligns() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AlignsResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DmMessage[]>([]);
  const [draft, setDraft] = useState("");

  const refresh = useCallback(() => {
    if (!isSignedIn) return;

    fetch("/api/candor/aligns")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: AlignsResponse | null) => {
        setData(payload);
        setSelectedId((current) => current ?? payload?.aligns[0]?.id ?? null);
      });
  }, [isSignedIn]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selected = data?.aligns.find((align) => align.id === selectedId) ?? data?.aligns[0];

  useEffect(() => {
    if (!selected?.canText) {
      setMessages([]);
      return;
    }

    fetch(`/api/candor/aligns/${selected.id}/messages`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { messages?: DmMessage[] } | null) => setMessages(payload?.messages ?? []));
  }, [selected?.id, selected?.canText]);

  const toggleDm = async (align: Align) => {
    const response = await fetch("/api/candor/aligns", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alignmentId: align.id, dmOn: !align.myDmOn }),
    });

    if (!response.ok) return;
    const status = (await response.json()) as Pick<Align, "myDmOn" | "theirDmOn" | "canText">;
    setData((current) =>
      current
        ? {
            ...current,
            aligns: current.aligns.map((item) => (item.id === align.id ? { ...item, ...status } : item)),
          }
        : current,
    );
  };

  const sendMessage = async () => {
    if (!selected?.canText || !draft.trim()) return;
    const content = draft.trim();
    setDraft("");

    const response = await fetch(`/api/candor/aligns/${selected.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) return;
    const payload = (await response.json()) as { message: DmMessage };
    setMessages((current) => [...current, payload.message]);
  };

  if (isLoaded && !isSignedIn) {
    return (
      <main className="gradient-bg grain relative flex min-h-screen items-center justify-center overflow-hidden px-6">
        <AmbientGlow />
        <div className="relative z-10 flex max-w-[420px] flex-col items-center gap-6 text-center">
          <h1 className="text-3xl font-light">your aligns come later</h1>
          <p className="text-sm font-light leading-6 text-foreground-secondary">candor needs to know you first.</p>
          <Button
            onClick={() => router.push(`/candor/login?next=${encodeURIComponent("/candor/aligns")}`)}
            className="rounded-full bg-accent px-6 text-primary-foreground hover:bg-accent/90"
          >
            sign in
          </Button>
        </div>
      </main>
    );
  }

  const ready = data?.ready;

  return (
    <main className="gradient-bg grain relative min-h-screen overflow-hidden px-6 pb-32 pt-20">
      <AmbientGlow />
      <section className="relative z-10 mx-auto flex max-w-[600px] flex-col gap-10">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <h1 className="text-3xl font-light leading-tight tracking-tight md:text-5xl">aligns</h1>
          <p className="mt-4 text-sm font-light leading-6 text-foreground-secondary">
            {data?.language ?? "candor is still learning the shape of you."}
          </p>
        </motion.div>

        {!ready && (
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardContent className="flex flex-col gap-5 p-5">
              <p className="text-lg font-light leading-8 text-foreground-secondary">
                not yet. a real align should come from understanding, not a quick guess.
              </p>
              <p className="text-sm font-light leading-6 text-foreground-secondary/80">
                keep talking. family, friends, career, fear, ambition, love, all of it matters here.
              </p>
            </CardContent>
          </Card>
        )}

        {ready && data?.aligns.length === 0 && (
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardContent className="p-5 text-lg font-light leading-8 text-foreground-secondary">
              candor understands you enough. it is waiting for someone else with enough signal too.
            </CardContent>
          </Card>
        )}

        {ready && data?.aligns.map((align) => (
          <Card
            key={align.id}
            className={`surface border-border/50 bg-card/45 backdrop-blur-sm transition-colors ${
              selected?.id === align.id ? "border-accent/50" : ""
            }`}
          >
            <CardContent className="flex flex-col gap-5 p-5">
              <button type="button" onClick={() => setSelectedId(align.id)} className="text-left">
                <p className="text-xs font-light uppercase tracking-[0.24em] text-accent/70">possible align</p>
                <h2 className="mt-3 text-2xl font-light leading-8">{align.profile.title}</h2>
                <p className="mt-3 text-sm font-light leading-6 text-foreground-secondary">{align.profile.about}</p>
              </button>

              <div className="flex flex-wrap gap-2">
                {align.profile.values.map((value) => (
                  <span key={value} className="rounded-full border border-border/50 px-3 py-1 text-xs font-light text-foreground-secondary">
                    {value}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {align.profile.conversation.map((line) => (
                  <p key={line} className="text-sm font-light leading-6 text-foreground-secondary">
                    {line}
                  </p>
                ))}
              </div>

              <div className="flex flex-col gap-3 border-t border-border/40 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm font-light text-foreground-secondary">
                    {align.canText ? <MessageCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {align.canText
                      ? "both of you opened dms"
                      : align.theirDmOn
                        ? "they opened dms. your move."
                        : "they will see your profile when you open dms."}
                  </div>
                  <Button
                    type="button"
                    onClick={() => toggleDm(align)}
                    className="rounded-full bg-accent px-5 text-primary-foreground hover:bg-accent/90"
                  >
                    {align.myDmOn ? "dms on" : "turn on dms"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {selected?.canText && (
          <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
            <CardContent className="flex flex-col gap-4 p-5">
              <p className="text-sm font-light text-foreground-secondary">dm mode is open</p>
              <div className="flex max-h-[320px] flex-col gap-4 overflow-y-auto">
                {messages.length === 0 && <p className="text-lg font-light text-foreground-secondary">say something simple first.</p>}
                {messages.map((message) => (
                  <p
                    key={message.id}
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-light leading-6 ${
                      message.mine ? "self-end bg-accent/20 text-foreground" : "self-start surface-secondary text-foreground-secondary"
                    }`}
                  >
                    {message.content}
                  </p>
                ))}
              </div>
              <div className="flex gap-3">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="write gently"
                  className="min-h-12 resize-none rounded-2xl border-border/50 bg-background/60 px-4 py-3 text-sm font-light"
                />
                <Button type="button" size="icon" onClick={sendMessage} disabled={!draft.trim()} className="rounded-full bg-accent text-primary-foreground">
                  <ArrowUp />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </section>
      <BottomNav />
    </main>
  );
}
