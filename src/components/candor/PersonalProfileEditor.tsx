"use client";

import { useEffect, useState } from "react";
import { Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CandorPersonalProfile } from "@/lib/candor/personal-profile";

const emptyProfile: CandorPersonalProfile = {
  username: null,
  displayName: null,
  dob: null,
  genderIdentity: null,
  city: null,
  relationshipPreference: null,
};

export function PersonalProfileEditor({
  profile,
  onSaved,
}: {
  profile: CandorPersonalProfile | null;
  onSaved: (profile: CandorPersonalProfile) => void;
}) {
  const [draft, setDraft] = useState<CandorPersonalProfile>(profile ?? emptyProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");

  useEffect(() => {
    setDraft(profile ?? emptyProfile);
  }, [profile]);

  const update = (key: keyof CandorPersonalProfile, value: string) => {
    setDraft((current) => ({ ...current, [key]: value || null }));
    setSaveState("idle");
  };

  const save = async () => {
    setIsSaving(true);
    setSaveState("idle");

    const response = await fetch("/api/candor/me/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: draft }),
    });

    setIsSaving(false);

    if (!response.ok) {
      setSaveState("error");
      return;
    }

    const data = (await response.json()) as { profile: CandorPersonalProfile };
    onSaved(data.profile);
    setDraft(data.profile);
    setSaveState("saved");
  };

  return (
    <Card className="surface mb-6 border-border/50 bg-card/45 backdrop-blur-sm">
      <CardHeader className="p-5 pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-light tracking-wide">
          <UserRound className="h-4 w-4 text-accent" />
          your details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 pt-3">
        <p className="text-sm font-light leading-6 text-foreground-secondary">
          edit only the things that are actually yours. candor&apos;s reads and inferred signals stay separate.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="username">
            <Input
              value={draft.username ?? ""}
              onChange={(event) => update("username", event.target.value)}
              placeholder="username"
              className="rounded-2xl border-border/50 bg-background/40"
            />
          </Field>
          <Field label="display name">
            <Input
              value={draft.displayName ?? ""}
              onChange={(event) => update("displayName", event.target.value)}
              placeholder="your name"
              className="rounded-2xl border-border/50 bg-background/40"
            />
          </Field>
          <Field label="date of birth">
            <Input
              type="date"
              value={draft.dob ?? ""}
              onChange={(event) => update("dob", event.target.value)}
              className="rounded-2xl border-border/50 bg-background/40"
            />
          </Field>
          <Field label="gender identity">
            <Select value={draft.genderIdentity ?? ""} onValueChange={(value) => update("genderIdentity", value)}>
              <SelectTrigger className="rounded-2xl border-border/50 bg-background/40">
                <SelectValue placeholder="choose if you want to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="man">man</SelectItem>
                <SelectItem value="woman">woman</SelectItem>
                <SelectItem value="non-binary">non-binary</SelectItem>
                <SelectItem value="trans man">trans man</SelectItem>
                <SelectItem value="trans woman">trans woman</SelectItem>
                <SelectItem value="genderfluid">genderfluid</SelectItem>
                <SelectItem value="prefer not to say">prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="city">
            <Input
              value={draft.city ?? ""}
              onChange={(event) => update("city", event.target.value)}
              placeholder="city, country"
              className="rounded-2xl border-border/50 bg-background/40"
            />
          </Field>
          <Field label="relationship preference">
            <Input
              value={draft.relationshipPreference ?? ""}
              onChange={(event) => update("relationshipPreference", event.target.value)}
              placeholder="optional"
              className="rounded-2xl border-border/50 bg-background/40"
            />
          </Field>
        </div>

        <div className="flex items-center justify-between gap-4">
          <p
            className={cn(
              "text-xs font-light",
              saveState === "error" ? "text-destructive" : "text-foreground-secondary",
            )}
          >
            {saveState === "saved"
              ? "saved."
              : saveState === "error"
                ? "could not save that yet."
                : "this updates your personal profile, not candor's inferred read."}
          </p>
          <Button
            type="button"
            onClick={save}
            disabled={isSaving}
            className="rounded-full bg-accent text-primary-foreground hover:bg-accent/90"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "saving..." : "save details"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-light uppercase tracking-[0.18em] text-foreground-secondary">{label}</span>
      {children}
    </label>
  );
}
