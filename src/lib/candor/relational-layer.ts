export const RELATIONAL_STATES = [
  "open, not seeking",
  "curious, slowly",
  "emotionally available",
  "observing for now",
  "here for conversation first",
  "open to resonance",
] as const;

export const TONIGHTS_THREADS = [
  "what kind of silence feels comfortable to you?",
  "someone cancels plans. relief or disappointment?",
  "what instantly makes you feel understood?",
  "do you disappear when overwhelmed or get louder?",
  "what kind of apology actually works on you?",
  "what feels intimate without being intense?",
] as const;

export const CHEMISTRY_GAMES = [
  {
    title: "chaos vs stability",
    a: "i need a little chaos",
    b: "stability is underrated",
  },
  {
    title: "emergency contact energy",
    a: "i would handle it calmly",
    b: "i would make it memorable",
  },
  {
    title: "late-night personality",
    a: "honest and soft",
    b: "slightly unhinged but sincere",
  },
  {
    title: "toxic comfort habit",
    a: "replaying old messages",
    b: "pretending i am fine",
  },
] as const;

export const MICRO_SIGNALS = [
  "this felt like your kind of thought",
  "heard this and thought of your take",
  "this reminded me of your energy",
  "you'd either love or hate this",
  "this feels very you somehow",
] as const;

export const SOCIAL_GRAVITY_SIGNALS = [
  "someone paused on your answer tonight.",
  "a familiar rhythm appeared again.",
  "someone reread your thread.",
  "your pacing overlaps with someone unexpectedly.",
  "someone's answer moved near yours without matching it.",
] as const;

export const WEEKLY_REFLECTIONS = [
  "you seemed more emotionally open this week.",
  "you respond faster when conversations feel playful.",
  "you keep gravitating toward emotionally steady people.",
  "your energy shifts late at night.",
] as const;
