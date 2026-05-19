import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const alignTiers = [
  {
    name: "distant",
    description: "the coldest, quietest signal. still exploratory.",
    glow: "rgba(255,255,255,0)",
    bg: "rgba(0,0,0,0.1)",
    border: "rgba(255,255,255,0.1)"
  },
  {
    name: "familiar",
    description: "slightly warmer. pacing begins to make sense.",
    glow: "rgba(255,255,255,0.05)",
    bg: "rgba(255,255,255,0.03)",
    border: "rgba(255,255,255,0.15)"
  },
  {
    name: "natural flow",
    description: "ease appears. conversation starts to feel unforced.",
    glow: "rgba(var(--accent-rgb),0.15)",
    bg: "rgba(var(--accent-rgb),0.05)",
    border: "rgba(var(--accent-rgb),0.3)"
  },
  {
    name: "magnetic",
    description: "a stronger emotional pull. the chemistry is clearer.",
    glow: "rgba(var(--accent-rgb),0.3)",
    bg: "rgba(var(--accent-rgb),0.1)",
    border: "rgba(var(--accent-rgb),0.5)"
  },
  {
    name: "candid",
    description: "the warmest, rarest state. entirely open.",
    glow: "rgba(var(--accent-rgb),0.6)",
    bg: "rgba(var(--accent-rgb),0.15)",
    border: "rgba(var(--accent-rgb),0.8)"
  }
];

export default function MatchReveal() {
  const [activeTier, setActiveTier] = useState(0);

  return (
    <section className="py-32 px-6 overflow-hidden relative">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-foreground-secondary text-xs tracking-[0.2em] uppercase mb-16"
        >
          alignment progression
        </motion.p>

        <div className="flex w-full justify-between items-center relative h-16 md:h-24">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-border/30 -translate-y-1/2 -z-10" />
          
          {alignTiers.map((tier, i) => (
            <div 
              key={tier.name} 
              className="relative flex flex-col items-center justify-center cursor-pointer group"
              onMouseEnter={() => setActiveTier(i)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-500 ease-out z-10"
                style={{ 
                  backgroundColor: i === activeTier ? 'hsl(var(--accent))' : tier.bg,
                  boxShadow: i === activeTier ? \`0 0 20px 4px \${tier.glow}\` : 'none',
                  border: \`1px solid \${tier.border}\`
                }}
              />
              <div 
                className={\`absolute top-6 md:top-8 text-xs font-light tracking-wide transition-all duration-500 \${
                  i === activeTier ? "text-foreground" : "text-foreground-secondary/40"
                }\`}
              >
                {tier.name}
              </div>
            </div>
          ))}
        </div>

        <div className="h-32 mt-16 md:mt-24 w-full flex items-center justify-center text-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeTier}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-lg md:text-xl font-light text-foreground/90 max-w-md"
            >
              {alignTiers[activeTier].description}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
