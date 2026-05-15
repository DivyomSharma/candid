"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type MemorySnapshot = {
  counts: {
    messages: number;
    memories: number;
    facts: number;
    initiatives: number;
  };
  memories: Array<{ id: string; kind: string; content: string }>;
  facts: Array<{ id: string; kind: string; key: string; value: unknown; confidence: number }>;
};

export function MemoryControls() {
  const [snapshot, setSnapshot] = useState<MemorySnapshot | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const refresh = () => {
    fetch("/api/candor/me/memory")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: MemorySnapshot | null) => setSnapshot(data));
  };

  useEffect(() => {
    refresh();
  }, []);

  const runAction = async (body: Record<string, unknown>) => {
    setIsBusy(true);
    const response = await fetch("/api/candor/me/memory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) {
      setSnapshot((await response.json()) as MemorySnapshot);
    }
    setIsBusy(false);
  };

  if (!snapshot) return null;

  return (
    <Card className="surface border-border/50 bg-card/45 backdrop-blur-sm">
      <CardContent className="grid gap-6 p-5">
        <div>
          <h2 className="text-xl font-light">memory controls</h2>
          <p className="mt-2 text-sm font-light leading-6 text-foreground-secondary">
            candor keeps understanding, not a permanent transcript. you can remove pieces whenever they feel wrong or too much.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm font-light text-foreground-secondary md:grid-cols-4">
          <MemoryCount label="messages" value={snapshot.counts.messages} />
          <MemoryCount label="memories" value={snapshot.counts.memories} />
          <MemoryCount label="facts" value={snapshot.counts.facts} />
          <MemoryCount label="initiatives" value={snapshot.counts.initiatives} />
        </div>

        <div className="grid gap-3">
          {[...snapshot.memories.slice(0, 5).map((memory) => ({ ...memory, type: "event" })), ...snapshot.facts.slice(0, 3).map((fact) => ({
            id: fact.id,
            kind: fact.kind,
            content: `${fact.key}: ${formatValue(fact.value)}`,
            type: "fact",
          }))].map((item) => (
            <div key={`${item.kind}-${item.id}`} className="flex items-start justify-between gap-3 border-t border-border/35 pt-3">
              <div>
                <p className="text-xs font-light uppercase tracking-[0.18em] text-accent/75">{item.kind}</p>
                <p className="mt-1 text-sm font-light leading-6 text-foreground-secondary">{item.content}</p>
              </div>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => runAction({ action: item.type === "fact" ? "delete_fact" : "delete_event", id: item.id })}
                className="rounded-full border border-border/45 p-2 text-foreground-secondary transition-colors hover:border-accent/40 hover:text-foreground"
                aria-label="delete memory"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 border-t border-border/35 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => runAction({ action: "pause_initiatives", paused: true })}
            className="rounded-full border-border/50 bg-background/50 px-4 font-light backdrop-blur-md hover:bg-accent/10"
          >
            pause messages first
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => runAction({ action: "clear_relational" })}
            className="rounded-full border-border/50 bg-background/50 px-4 font-light backdrop-blur-md hover:bg-accent/10"
          >
            clear understanding
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => runAction({ action: "clear_all" })}
            className="rounded-full border-border/50 bg-background/50 px-4 font-light backdrop-blur-md hover:bg-accent/10"
          >
            clear everything
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function MemoryCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/30 p-3">
      <p className="text-2xl font-light text-foreground">{value}</p>
      <p className="mt-1">{label}</p>
    </div>
  );
}

function formatValue(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value && typeof value === "object") return Object.values(value as Record<string, unknown>).join(", ");
  return "unknown";
}
