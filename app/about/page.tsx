import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "About",
  description: "What Candor is trying to build through continuity, chemistry, and conversation.",
};

export default function AboutPage() {
  return (
    <TrustPageShell
      eyebrow="about candor"
      title="a quieter way of understanding people"
      intro="candor starts before profile performance. it learns through conversation, pacing, contradictions, curiosity, and the little relational patterns that usually get flattened by swipes and forms."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">understanding before connection</h2>
        <p>
          most products begin with display. candor begins with rhythm. it pays attention to how someone moves through
          conversation, what opens them up, what they dodge, what they get playful about, and what kind of chemistry
          feels natural over time.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">not built like a prompt box</h2>
        <p>
          candor is not trying to feel like a productivity tool wearing a softer tone. it is designed around social
          realism, continuity, and the way human connection actually deepens through repeated contact.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">human connection still matters</h2>
        <p>
          candor is not meant to replace people. it is meant to help people understand themselves more clearly,
          communicate with more honesty, and move toward better human compatibility with less performance and more
          signal.
        </p>
      </section>
    </TrustPageShell>
  );
}
