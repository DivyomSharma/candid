import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Candid treats conversation, continuity, memory, and privacy.",
};

export default function PrivacyPage() {
  return (
    <TrustPageShell
      eyebrow="privacy"
      title="candid remembers understanding, not everything"
      intro="candid is designed to retain useful relational understanding, not to keep endless raw chat archives for their own sake."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">what candid keeps</h2>
        <p>
          candid focuses on patterns, preferences, emotional rhythm, chemistry signals, and continuity that help future
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
        <h2 className="text-lg font-medium text-foreground">what candid does not do</h2>
        <p>
          candid is not built to sell personal relational data, engineer manipulative attachment loops, or store more
          than the product actually needs to remain socially coherent.
        </p>
      </section>
    </TrustPageShell>
  );
}
