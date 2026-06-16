import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Data & Memory Philosophy",
  description: "How Candid thinks about continuity, memory, and user control.",
};

export default function DataMemoryPage() {
  return (
    <TrustPageShell
      eyebrow="data & memory"
      title="continuity should feel intelligent, not invasive"
      intro="candid's memory layer exists so the experience can deepen over time. the point is better relational continuity, not exhaustive surveillance."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">memory is signal-shaped</h2>
        <p>
          candid gradually retains the parts that help with future coherence: patterns, social rhythm, chemistry
          tendencies, and communication texture. it should not cling to every raw sentence forever.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">continuity scales by depth</h2>
        <p>
          echo, continuity, and resonance change how much context candid can meaningfully hold across time. the idea is
          deeper continuity, not colder optimization or message-count gating.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">user control matters</h2>
        <p>
          memory should be understandable, deletable, and shaped around trust. candid is at its best when it feels
          perceptive without feeling invasive.
        </p>
      </section>
    </TrustPageShell>
  );
}
