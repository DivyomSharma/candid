import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Candor treats conversation, continuity, memory, and privacy.",
};

export default function PrivacyPage() {
  return (
    <TrustPageShell
      eyebrow="privacy"
      title="candor remembers understanding, not everything"
      intro="candor is designed to retain useful relational understanding, not to keep endless raw chat archives for their own sake."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">what candor keeps</h2>
        <p>
          candor focuses on patterns, preferences, emotional rhythm, chemistry signals, and continuity that help future
          conversation feel more natural. it is not built around permanent transcript hoarding.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">what stays temporary</h2>
        <p>
          raw conversation history should be treated as temporary operational context. the long-term layer is distilled
          understanding, not a permanent replay of everything you have ever said.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">what candor does not do</h2>
        <p>
          candor is not built to sell personal relational data, engineer manipulative attachment loops, or store more
          than the product actually needs to remain socially coherent.
        </p>
      </section>
    </TrustPageShell>
  );
}
