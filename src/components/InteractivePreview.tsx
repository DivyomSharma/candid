import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const CHIPS = [
  { id: "quiet", label: "quiet signal" },
  { id: "side", label: "side pick" },
  { id: "thread", label: "late-night thread" },
  { id: "loop", label: "open loop" },
];

const SCENARIOS: Record<string, { prompt: string; quickReplies: string[]; reply: string }> = {
  quiet: {
    prompt: "someone cancels plans.\n\nwhat hits first?",
    quickReplies: ["relief", "disappointment", "i pretend not to care"],
    reply: "your answer opens nearby rhythms first. not matches. just people who carry that moment similarly.",
  },
  side: {
    prompt: "chaos or stability?\n\nwhich one makes you feel more alive?",
    quickReplies: ["a little chaos", "stability, always", "depends who with"],
    reply: "candid keeps that as texture. early chemistry should feel curious, not final.",
  },
  thread: {
    prompt: "what kind of silence\nfeels comfortable to you?",
    quickReplies: ["shared silence", "after laughing", "when nobody fills it"],
    reply: "someone paused on an answer like this tonight. the room gets a little more alive after you answer first.",
  },
  loop: {
    prompt: "send something small.\n\nnot a message. a signal.",
    quickReplies: ["this feels like you", "you'd hate this", "thought of your take"],
    reply: "ambient intimacy works best when it does not demand a full conversation every time.",
  },
};

function useTypingEffect(text: string, speed = 24) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) return;
    setDisplayed("");
    let i = 0;
    const interval = window.setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) window.clearInterval(interval);
    }, speed);
    return () => window.clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

export default function InteractivePreview() {
  const [selected, setSelected] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const scenario = selected ? SCENARIOS[selected] : null;
  const typedReply = useTypingEffect(showReply ? scenario?.reply ?? "" : "");

  const handleChipSelect = (id: string) => {
    setSelected(id);
    setUserInput("");
    setSubmitted(false);
    setShowReply(false);
    window.setTimeout(() => inputRef.current?.focus(), 120);
  };

  const submit = (reply: string) => {
    if (!reply.trim()) return;
    setUserInput(reply);
    setSubmitted(true);
    window.setTimeout(() => setShowReply(true), 720);
  };

  const reset = () => {
    setSelected(null);
    setUserInput("");
    setSubmitted(false);
    setShowReply(false);
  };

  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-12 text-center"
        >
          <p className="mb-3 text-sm uppercase tracking-widest text-foreground-secondary">social spark</p>
          <p className="text-sm font-light text-foreground-secondary/50">answer first, then the room opens</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-10 flex flex-wrap justify-center gap-2.5"
        >
          {CHIPS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleChipSelect(id)}
              className={`rounded-full border px-4 py-2 text-sm font-light transition-all duration-300 ${
                selected === id
                  ? "border-accent/40 bg-accent/25 text-foreground"
                  : "surface-secondary border-border/30 text-foreground-secondary hover:border-accent/30 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {scenario ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="surface space-y-6 rounded-3xl p-7 soft-shadow md:p-9"
            >
              <div>
                <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-accent/70">Candid</p>
                <div className="surface-secondary whitespace-pre-line rounded-2xl rounded-tl-sm px-5 py-4 text-sm font-light leading-relaxed text-foreground-secondary">
                  {scenario.prompt}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {scenario.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => submit(reply)}
                          className="surface-secondary rounded-full border border-border/40 px-3.5 py-1.5 text-xs font-light text-foreground-secondary transition-all duration-200 hover:border-accent/40 hover:text-foreground"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(event) => setUserInput(event.target.value)}
                        onKeyDown={(event) => event.key === "Enter" && submit(userInput)}
                        placeholder="say what comes naturally..."
                        className="min-w-0 flex-1 border-b border-border/30 bg-transparent pb-1.5 text-sm font-light text-foreground outline-none placeholder:text-foreground-secondary/35 transition-colors duration-300 focus:border-accent/40"
                      />
                      <button
                        type="button"
                        onClick={() => submit(userInput)}
                        disabled={!userInput.trim()}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/30 bg-accent/20 text-accent transition-colors hover:bg-accent/30 disabled:opacity-30"
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="response-thread" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    <div className="flex flex-col items-end">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-accent/70">You</p>
                      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-accent/20 px-4 py-2.5 text-sm font-light text-foreground">
                        {userInput}
                      </div>
                    </div>

                    <div className="flex flex-col items-start">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-widest text-accent/70">Candid</p>
                      <div className="surface-secondary max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm font-light leading-relaxed text-foreground-secondary">
                        {typedReply}
                        {typedReply.length < (scenario?.reply.length ?? 0) ? (
                          <span className="ml-0.5 inline-block h-3.5 w-0.5 animate-pulse bg-foreground-secondary/40 align-middle" />
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {showReply ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <a
                href="#waitlist"
                className="inline-block rounded-full bg-accent px-8 py-3.5 text-sm font-medium tracking-wide text-primary-foreground soft-shadow transition-transform duration-300 hover:scale-105"
              >
                enter candid
              </a>
              <button onClick={reset} className="text-xs font-light text-foreground-secondary/40 transition-colors hover:text-foreground-secondary/70">
                try another signal
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </section>
  );
}
