import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Safety & Ethics",
  description: "Candor's positioning on trust, safety, and emotionally mature interaction.",
};

export default function SafetyPage() {
  return (
    <TrustPageShell
      eyebrow="safety & ethics"
      title="social spark without manipulation"
      intro="candor is meant to feel alive, playful, and sometimes emotionally charged. it is not meant to become exploitative, dependency-driven, or explicit for its own sake."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">what candor supports</h2>
        <p>
          healthy curiosity, emotional honesty, better communication, stronger compatibility understanding, and more
          believable social rhythm.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">what candor avoids</h2>
        <p>
          manipulative attachment engineering, explicit sexual roleplay as the product identity, coercive emotional
          pressure, and loops designed to keep someone dependent rather than clear-headed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">why the line matters</h2>
        <p>
          candor should feel premium because it understands relational nuance, not because it pushes people into blurred
          emotional dependency. trust is part of the product, not a disclaimer added later.
        </p>
      </section>
    </TrustPageShell>
  );
}
