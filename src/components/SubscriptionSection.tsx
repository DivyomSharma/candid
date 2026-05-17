import { motion } from "framer-motion";
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from "@/lib/subscription";

type TierCardProps = {
  tier: SubscriptionTier;
  featured?: boolean;
  delay: number;
};

function tierSignal(tier: SubscriptionTier) {
  if (tier === "resonance") {
    return "holds the longest continuity, the deepest chemistry read, and the strongest contextual memory.";
  }

  if (tier === "continuity") {
    return "carries more rhythm, richer initiative instinct, stronger align precision, and a more nuanced sense of your social energy.";
  }

  return "keeps the first emotional signal alive, with lighter continuity, exploratory aligns, and an early sense of your conversational identity.";
}

function TierCard({ tier, featured, delay }: TierCardProps) {
  const meta = SUBSCRIPTION_TIERS[tier];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay }}
      className={`relative rounded-3xl p-7 md:p-8 overflow-hidden ${
        featured ? "surface soft-shadow ring-1 ring-accent/20" : "surface soft-shadow"
      }`}
    >
      {featured ? (
        <div
          className="absolute inset-0 -z-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 30%, hsl(var(--glow) / 0.2), transparent)`,
          }}
        />
      ) : null}

      <div className="relative z-10">
        <p className="text-lg font-light text-foreground mb-1">{meta.label}</p>
        <p className="text-xs font-light text-foreground-secondary/50 italic mb-5">
          {meta.meaning}
        </p>
        <p className="text-sm font-light text-foreground-secondary leading-7 mb-5">
          {meta.description}
        </p>
        <p className="text-sm font-light text-foreground-secondary/80 leading-7">
          {tierSignal(tier)}
        </p>
      </div>
    </motion.article>
  );
}

export default function SubscriptionSection() {
  return (
    <section className="py-28 md:py-36 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-light uppercase tracking-widest text-foreground-secondary mb-5">
            depth, not message counts
          </p>
          <h2 className="text-3xl md:text-5xl font-light leading-tight">
            understanding scales with continuity.
          </h2>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          <TierCard tier="echo" delay={0.05} />
          <TierCard tier="continuity" featured delay={0.12} />
          <TierCard tier="resonance" delay={0.19} />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="text-center mt-12 text-sm font-light text-foreground-secondary/60 max-w-xl mx-auto leading-7"
        >
          candor is not selling more ai. it is selling deeper relational continuity, clearer chemistry, and a more mature understanding of how connection actually unfolds.
        </motion.p>
      </div>
    </section>
  );
}
