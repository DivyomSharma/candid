import type { Metadata } from "next";
import TrustPageShell from "@/components/TrustPageShell";

export const metadata: Metadata = {
  title: "Support",
  description: "How to reach the Candor team for support, privacy, or continuity issues.",
};

export default function SupportPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? process.env.SUPPORT_EMAIL ?? null;

  return (
    <TrustPageShell
      eyebrow="support"
      title="support, privacy, and memory requests"
      intro="candor should be reachable when something feels wrong, unclear, or too sticky. support includes technical issues, privacy questions, and continuity or memory concerns."
    >
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">what support should cover</h2>
        <p>
          failed conversations, account issues, profile corrections, unwanted memory carryover, deletion requests, and
          questions about how continuity works.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">how to reach out</h2>
        <p>
          {supportEmail ? (
            <>
              the current support contact for this deployment is{" "}
              <a className="text-foreground underline underline-offset-4" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
              .
            </>
          ) : (
            "use the support contact configured for this deployment to report product, privacy, or memory concerns."
          )}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">privacy-sensitive requests</h2>
        <p>
          if your request is about memory deletion, continuity reset, or stored personal data, it should be treated as
          higher priority than normal product feedback.
        </p>
      </section>
    </TrustPageShell>
  );
}
