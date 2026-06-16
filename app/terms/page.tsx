import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The core terms for using Candid responsibly.",
};

export default function TermsPage() {
  return (
    <TrustPageShell
      eyebrow="terms"
      title="terms for using candid"
      intro="candid is meant for socially mature, good-faith use. the product works best when users treat it as a place for honest conversation rather than exploitation, abuse, or impersonation."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">good-faith use</h2>
        <p>
          do not use candid to harass, impersonate, manipulate, threaten, stalk, or knowingly distribute harmful or
          deceptive content. relational intelligence is not permission to push boundaries irresponsibly.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">account ownership</h2>
        <p>
          keep your account information accurate where it matters, especially for personal identity basics that are
          user-owned rather than inferred. you remain responsible for activity tied to your account.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">service evolution</h2>
        <p>
          candid may evolve its memory systems, routing, compatibility layers, or continuity features as the product
          improves, but it should not quietly turn into a manipulative or explicitly sexualized dependency system.
        </p>
      </section>
    </TrustPageShell>
  );
}
