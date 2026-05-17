import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Memory Controls",
  description: "How continuity and memory should be controlled inside Candor.",
};

export default function MemoryControlsPage() {
  return (
    <TrustPageShell
      eyebrow="memory controls"
      title="continuity should stay in your control"
      intro="candor works best when users understand what is being retained, why it matters, and how to reset or soften that continuity if they want to."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">core expectations</h2>
        <p>
          users should be able to review and edit personal identity details they own directly, and they should be able
          to clear or reset continuity when the relational read no longer feels right.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">what should stay separate</h2>
        <p>
          user-entered profile facts are different from candor's inferred reads. the first category should be plainly
          editable. the second should stay observational, soft, and revisable over time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">how memory should feel</h2>
        <p>
          not sticky in a creepy way. not erased so aggressively that candor becomes shallow. just enough control that
          continuity remains a choice, not a trap.
        </p>
      </section>
    </TrustPageShell>
  );
}
