import { motion } from "framer-motion";

const sections = [
  {
    title: "not built for prompts",
    body: "most ai waits for instructions. candor is built around the thread between messages: rhythm, timing, humor, pacing, and what keeps coming back.",
  },
  {
    title: "remembers understanding, not everything",
    body: "raw conversation is temporary. candor keeps the useful shape: patterns, preferences, emotional context, social tendencies, and what seems to make conversation open.",
  },
  {
    title: "conversations evolve",
    body: "the point is not one perfect answer. candor changes as it learns your pace, your tolerance for teasing, your depth, and the kinds of moments that make you more yourself.",
  },
  {
    title: "chemistry, not productivity",
    body: "candor is intentionally bad at pretending to be a task app. it is tuned for texture, curiosity, timing, social realism, and the small odd turns that make conversation feel alive.",
  },
  {
    title: "no forced vulnerability",
    body: "early conversations stay lighter on purpose. no emotional interrogation, no endless questions, no fake-soft empathy. candor should earn depth instead of demanding it.",
  },
  {
    title: "different people, different rhythm",
    body: "analytical, reserved, chaotic, grounded, founder-brained, internet-native, older, extroverted, private. candor should adapt its energy instead of forcing one personality onto everyone.",
  },
  {
    title: "human connection still matters",
    body: "candor is not built to trap people inside itself. memory should be inspectable, deletable, and bounded. the system should support real connection, not replace it.",
  },
];

export default function CandorPhilosophySection() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="mb-14 max-w-2xl"
        >
          <p className="mb-5 text-sm font-light uppercase tracking-widest text-foreground-secondary">
            what candor is trying to be
          </p>
          <h2 className="text-3xl font-light leading-tight md:text-5xl">
            a living social thread, not another blank prompt box.
          </h2>
        </motion.div>

        <div className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((section, index) => (
            <motion.article
              key={section.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, delay: index * 0.04 }}
              className="border-t border-border/40 pt-5"
            >
              <h3 className="mb-3 text-lg font-light text-foreground">{section.title}</h3>
              <p className="text-sm font-light leading-7 text-foreground-secondary">{section.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
