import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "ai" | "user";
  text: string;
  cursive?: boolean;
}

const conversation: Message[] = [
  { role: "ai", text: "What makes you feel truly understood?" },
  { role: "user", text: "When someone remembers the small things I mention." },
  { role: "ai", text: "That's beautiful. The details matter to you." },
  { role: "ai", text: "What do you wish people asked you more often?" },
  { role: "user", text: "How I'm really feeling — not just how my day was." },
  { role: "ai", text: "understood.", cursive: true },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-foreground-secondary/40"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default function ChatDemo() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showTyping, setShowTyping] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 }
    );
    const el = document.getElementById("chat-demo");
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || visibleCount >= conversation.length) return;

    setShowTyping(true);
    const delay = conversation[visibleCount].role === "ai" ? 1800 : 1200;
    const timer = setTimeout(() => {
      setShowTyping(false);
      setVisibleCount((c) => c + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [started, visibleCount]);

  return (
    <section id="chat-demo" className="py-24 md:py-32 px-6">
      <div className="max-w-lg mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center text-foreground-secondary text-sm tracking-widest uppercase mb-12"
        >
          How it feels
        </motion.p>

        <div className="surface rounded-3xl p-6 md:p-8 soft-shadow space-y-3 min-h-[340px]">
          <AnimatePresence>
            {conversation.slice(0, visibleCount).map((msg, i) => {
              const isUser = msg.role === "user";
              // Only show label if first message or different sender from previous
              const showLabel = i === 0 || conversation[i - 1].role !== msg.role;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                >
                  {showLabel && (
                    <div className={`flex items-center gap-1.5 mb-1 px-1 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Curly arrow accent */}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="hsl(var(--accent))"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ transform: isUser ? "scaleX(-1)" : "none" }}
                      >
                        <path d="M4 17c0-7 6-10 12-10" />
                        <path d="M12 7l4 0l0 4" />
                      </svg>
                      <span className="text-[11px] font-medium tracking-wide uppercase text-accent">
                        {isUser ? "You" : "Candor AI"}
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? "bg-accent/20 text-foreground"
                        : "surface-secondary text-foreground-secondary"
                    } ${msg.cursive ? "font-cursive text-lg text-accent" : ""}`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {showTyping && visibleCount < conversation.length && (
            <div className={`flex ${conversation[visibleCount].role === "user" ? "justify-end" : "justify-start"}`}>
              <div className="surface-secondary rounded-2xl">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
