import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHIPS = [
  { id: "relationship", label: "a relationship situation" },
  { id: "bothering", label: "something that's been bothering me" },
  { id: "thinking", label: "something i've been thinking about" },
  { id: "talk", label: "just talk" },
];

const SCENARIOS: Record<string, { prompt: string; quickReplies: string[]; aiReply: string }> = {
  relationship: {
    prompt: `imagine this\n\nyou're excited about something\nand the person you care about barely reacts\n\nwhat stays with you more?`,
    quickReplies: ["the silence after", "that i expected more", "the look on their face"],
    aiReply: "that kind of reaction stays with you. it's not really about the moment — it's about what it made you wonder.",
  },
  bothering: {
    prompt: `there's something\nyou keep returning to\neven when you try to move on\n\nwhat does it feel like\nwhen it comes back?`,
    quickReplies: ["like i never really let go", "a dull weight", "it just appears uninvited"],
    aiReply: "the things that keep coming back usually have something left to say. you don't need to resolve it right now.",
  },
  thinking: {
    prompt: `sometimes a thought lands\nand you can't quite explain it\nto anyone around you\n\nhow long have you been\ncarrying this one?`,
    quickReplies: ["weeks, maybe more", "longer than i'd admit", "it started small then grew"],
    aiReply: "some thoughts need a different kind of space to be heard. this might be one of them.",
  },
  talk: {
    prompt: `no agenda\nno performance\n\njust — how are you\nactually doing\nright now?`,
    quickReplies: ["honestly? a bit tired", "better than i show", "i'm not sure"],
    aiReply: "that's enough. you don't have to know how you're doing to be here.",
  },
};

function useTypingEffect(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return { displayed, done };
}

export default function InteractivePreview() {
  const [selected, setSelected] = useState<string | null>(null);
  const [userInput, setUserInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const scenario = selected ? SCENARIOS[selected] : null;
  const { displayed: aiText } = useTypingEffect(showAI ? scenario?.aiReply ?? "" : "", 24);

  const handleChipSelect = (id: string) => {
    setSelected(id);
    setUserInput("");
    setSubmitted(false);
    setShowAI(false);
  };

  const handleQuickReply = (reply: string) => {
    setUserInput(reply);
    setSubmitted(true);
    setTimeout(() => setShowAI(true), 900);
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;
    setSubmitted(true);
    setTimeout(() => setShowAI(true), 900);
  };

  const handleReset = () => {
    setSelected(null);
    setUserInput("");
    setSubmitted(false);
    setShowAI(false);
  };

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="max-w-lg mx-auto">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <p className="text-foreground-secondary text-sm tracking-widest uppercase mb-3">
            start with something real
          </p>
          <p className="text-foreground-secondary/50 text-sm font-light">
            you don't need a profile to begin
          </p>
        </motion.div>

        {/* Chips */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap gap-2.5 justify-center mb-10"
        >
          {CHIPS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleChipSelect(id)}
              className={`px-4 py-2 rounded-full text-sm font-light transition-all duration-300 border ${
                selected === id
                  ? "bg-accent/25 border-accent/40 text-foreground"
                  : "surface-secondary border-border/30 text-foreground-secondary hover:border-accent/30 hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {/* Scenario Card */}
        <AnimatePresence mode="wait">
          {scenario && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="surface rounded-3xl p-7 md:p-9 soft-shadow space-y-6"
            >
              {/* Candor scenario prompt */}
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 mb-3">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 17c0-7 6-10 12-10" /><path d="M12 7l4 0l0 4" />
                  </svg>
                  <span className="text-[10px] font-medium tracking-widest uppercase text-accent/70">Candor</span>
                </div>
                <div className="surface-secondary rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-foreground-secondary font-light leading-relaxed whitespace-pre-line">
                  {scenario.prompt}
                </div>
              </div>

              {/* User Input area */}
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3"
                  >
                    {/* Quick replies */}
                    <div className="flex flex-wrap gap-2">
                      {scenario.quickReplies.map((reply) => (
                        <button
                          key={reply}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3.5 py-1.5 rounded-full text-xs font-light border border-border/40 text-foreground-secondary hover:border-accent/40 hover:text-foreground transition-all duration-200 surface-secondary"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>

                    {/* Free text */}
                    <div className="flex gap-2 items-center">
                      <input
                        ref={inputRef}
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        placeholder="say what comes naturally…"
                        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground-secondary/35 font-light outline-none border-b border-border/30 pb-1.5 focus:border-accent/40 transition-colors duration-300"
                      />
                      {userInput.trim() && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={handleSubmit}
                          className="w-7 h-7 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent hover:bg-accent/30 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="response-thread"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-3"
                  >
                    {/* User bubble */}
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1.5 mb-1 flex-row-reverse">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "scaleX(-1)" }}>
                          <path d="M4 17c0-7 6-10 12-10" /><path d="M12 7l4 0l0 4" />
                        </svg>
                        <span className="text-[10px] font-medium tracking-widest uppercase text-accent/70">You</span>
                      </div>
                      <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm bg-accent/20 text-sm text-foreground font-light">
                        {userInput}
                      </div>
                    </div>

                    {/* Candor typing / reply */}
                    {showAI && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex flex-col items-start"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 17c0-7 6-10 12-10" /><path d="M12 7l4 0l0 4" />
                          </svg>
                          <span className="text-[10px] font-medium tracking-widest uppercase text-accent/70">Candor</span>
                        </div>
                        <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-tl-sm surface-secondary text-sm text-foreground-secondary font-light leading-relaxed">
                          {aiText}
                          {aiText.length < (scenario?.aiReply.length ?? 0) && (
                            <span className="inline-block w-0.5 h-3.5 bg-foreground-secondary/40 ml-0.5 animate-pulse align-middle" />
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Typing dots before Candor reply appears */}
                    {!showAI && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-1.5 px-4 py-3 surface-secondary rounded-2xl rounded-tl-sm w-fit"
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-foreground-secondary/40"
                            animate={{ opacity: [0.3, 0.8, 0.3] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA — shown after AI replies or reset */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <a
                href="#waitlist"
                className="inline-block px-8 py-3.5 rounded-full bg-accent text-primary-foreground font-medium text-sm tracking-wide hover:scale-105 transition-transform duration-300 soft-shadow"
              >
                get early access
              </a>
              <button
                onClick={handleReset}
                className="text-xs text-foreground-secondary/40 hover:text-foreground-secondary/70 transition-colors font-light"
              >
                try a different topic
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
