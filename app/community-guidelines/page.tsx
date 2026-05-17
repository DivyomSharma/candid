import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "The social expectations around using Candor.",
};

export default function CommunityGuidelinesPage() {
  return (
    <TrustPageShell
      eyebrow="community"
      title="community guidelines"
      intro="candor is built around candor. the best use of it is direct, curious, socially aware, and respectful even when the conversation gets playful or tense."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">bring honesty, not cruelty</h2>
        <p>
          teasing is fine. humiliation is not. challenge is fine. dehumanization is not. candor should have tension
          sometimes, but not contempt.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">respect boundaries</h2>
        <p>
          more intimate or revealing energy should feel earned. do not force confessional pressure, explicit sexual
          content, or manipulative emotional games into the experience.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">keep it human</h2>
        <p>
          the product is meant to support clarity, chemistry, and real connection. use it in ways that move people
          toward better communication, not worse.
        </p>
      </section>
    </TrustPageShell>
  );
}
