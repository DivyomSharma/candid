"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Check, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CandorPersonalProfile } from "@/lib/candor/personal-profile";

type ChatMessage = {
  id: string;
  role: "candor" | "user";
  text: string;
  field?: keyof CandorPersonalProfile | "shelf_book" | "shelf_film" | "cover_url";
};

const QUESTIONS = [
  { text: "What's a book you keep coming back to?", field: "shelf_book" as const, key: "shelf_book" },
  { text: "Any film that shaped how you see things?", field: "shelf_film" as const, key: "shelf_film" },
  { text: "Where do you live?", field: "city" as const, key: "city" },
  { text: "What do you do for work?", field: "occupation" as const, key: "occupation" },
  { text: "Upload a cover photo for your room (or paste an image URL)", field: "cover_url" as const, key: "cover_url" },
];

export function PersonalProfileEditor({ profile, profileV4, onSaved }: any) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [draft, setDraft] = useState<CandorPersonalProfile>(profile || {});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: "intro",
        role: "candor",
        text: "Let's update your room. Your previous answers are pre-filled below. Change them, or hit send to keep them.",
      },
      {
        id: "q0",
        role: "candor",
        text: QUESTIONS[0].text,
        field: QUESTIONS[0].field,
      },
    ]);
    
    // Prefill first question if possible
    const currentQ = QUESTIONS[0];
    if (currentQ.field === "city" && draft.city) setInputValue(draft.city);
    else if (currentQ.field === "occupation" && draft.occupation) setInputValue(draft.occupation);
    // for shelf items we'd need to extract from profileV4, but let's leave blank if not simple
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, inputValue]);

  const handleSend = () => {
    const currentQ = QUESTIONS[currentQuestionIndex];
    
    const displayValue = !inputValue.trim() ? "Skipped" : inputValue;
    
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: "user" as const, text: displayValue },
    ];

    // Optimistically update draft
    const updatedDraft = { ...draft };
    if (inputValue.trim()) {
      if (currentQ.field === "city" || currentQ.field === "occupation") {
        updatedDraft[currentQ.field] = inputValue;
      }
    }
    setDraft(updatedDraft);

    setMessages(newMessages);
    setInputValue("");
    
    setTimeout(() => {
      nextQuestion(newMessages, updatedDraft);
    }, 600);
  };

  const nextQuestion = (currentMsgs: ChatMessage[], currentDraft: CandorPersonalProfile) => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < QUESTIONS.length) {
      const nextQ = QUESTIONS[nextIndex];
      setMessages([
        ...currentMsgs,
        {
          id: `q${nextIndex}`,
          role: "candor",
          text: nextQ.text,
          field: nextQ.field,
        },
      ]);
      setCurrentQuestionIndex(nextIndex);
      
      // Prefill next question
      if (nextQ.field === "city" && currentDraft.city) setInputValue(currentDraft.city);
      else if (nextQ.field === "occupation" && currentDraft.occupation) setInputValue(currentDraft.occupation);
      else setInputValue("");

    } else {
      setMessages([
        ...currentMsgs,
        {
          id: "done",
          role: "candor",
          text: "That's everything. I'll save these updates now.",
        },
      ]);
      setTimeout(() => {
        handleSave(currentDraft);
      }, 1500);
    }
  };

  const handleImageUploadMock = () => {
    const mockImages = [
      "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&q=80"
    ];
    setInputValue(mockImages[Math.floor(Math.random() * mockImages.length)]);
  };

  const handleSave = async (finalDraft: CandorPersonalProfile) => {
    await fetch("/api/candor/me/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: finalDraft }),
    });
    onSaved(finalDraft, profileV4);
  };

  const currentQ = QUESTIONS[currentQuestionIndex];

  return (
    <div className="flex h-[80vh] flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-white/5 p-4">
        <Sparkles className="h-4 w-4 text-accent" />
        <h3 className="text-sm font-light text-foreground-secondary">Improve with Candor</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="flex flex-col gap-4 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm font-light leading-relaxed",
                  msg.role === "candor"
                    ? "self-start rounded-tl-none border border-white/5 bg-white/5 text-foreground-secondary"
                    : "self-end rounded-tr-none bg-accent text-primary-foreground"
                )}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="border-t border-white/5 bg-background p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          {currentQ?.field === "cover_url" && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleImageUploadMock}
              className="shrink-0 rounded-full bg-white/5 border-white/10 hover:bg-white/10"
              title="Upload Image"
            >
              <ImageIcon className="h-4 w-4 text-foreground-secondary" />
            </Button>
          )}
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer..."
              className="h-12 w-full rounded-full border-white/10 bg-white/5 pl-4 pr-12 text-sm font-light text-foreground focus-visible:ring-accent"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-accent/20 text-accent transition-colors hover:bg-accent/40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
