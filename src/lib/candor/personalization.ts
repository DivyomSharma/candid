import type { CandorMemory } from "@/lib/candor/types";

export type CandorHomeCardKind =
  | "continue"
  | "signal"
  | "align"
  | "reflection"
  | "community"
  | "soundtrack"
  | "movie"
  | "memory"
  | "open_loop"
  | "thought"
  | "recommendation"
  | "tonight"
  | "input"
  | "visual_memory"
  | "mood_collage"
  | "random_object"
  | "art"
  | "environment"
  | "reading";

export type CandorHomeCardSpec = {
  kind: CandorHomeCardKind;
  size: "small" | "medium" | "large" | "tall" | "wide";
  priority: number;
  spanClass?: string;
};

export type CandorAdaptiveHome = {
  hasSufficientData: boolean;
  cards: CandorHomeCardSpec[];
  heroPrompt: string;
  reflectionLabel: string;
  reflectionLine: string;
  community: {
    label: string;
    line: string;
    detail: string;
  };
  surprise: {
    label: string;
    line: string;
    detail: string;
  };
  soundtrack: {
    title: string;
    artist: string;
    note: string;
    coverUrl?: string;
  };
  movie: {
    title: string;
    note: string;
    context: string;
    posterUrl?: string;
  };
  recommendation: {
    label: string;
    line: string;
    detail: string;
  };
  openLoop: {
    label: string;
    line: string;
  } | null;
  visualMemory: {
    line: string;
    imageUrl: string;
  };
  moodCollage: {
    images: string[];
  };
  randomObject: {
    type: "polaroid" | "cassette" | "ticket";
    imageUrl: string;
    text: string;
  };
  environment: {
    location: string;
    time: string;
    condition: string;
    imageUrl: string;
  };
  reading: {
    title: string;
    author: string;
    quote: string;
    coverUrl: string;
  };
};

const HERO_PROMPTS = [
  "what feels unfinished tonight?",
  "what's quietly staying with you?",
  "where's your head tonight?",
  "what keeps returning?",
  "what's louder than usual tonight?",
  "what did today leave behind?",
  "what feels different tonight?",
];

const REFLECTION_LABELS = ["this week", "lately", "recently", "small thing"];

const GENERIC_COMMUNITY = [
  {
    label: "tonight on candor",
    line: "people keep defending voice notes over calls.",
    detail: "apparently hearing someone pause changes everything.",
  },
  {
    label: "people tonight keep talking about",
    line: "late trains, old homes, rain, and goodbyes.",
    detail: "the room feels softer than usual.",
  },
  {
    label: "someone wrote",
    line: "\"i still reread old chats.\"",
    detail: "no context. somehow enough context.",
  },
  {
    label: "shared mood",
    line: "nostalgia, but with better boundaries.",
    detail: "a strange little weather system.",
  },
];


const TOPIC_SOUNDTRACKS: Record<string, { title: string; artist: string; note: string; coverUrl?: string }> = {
  movies: { title: "Holocene", artist: "Bon Iver", note: "this feels like your kind of silence." },
  music: { title: "Nights", artist: "Frank Ocean", note: "this one holds two moods at once." },
  design: { title: "A Walk", artist: "Tycho", note: "precise, spacious, a little obsessive." },
  startups: { title: "Intro", artist: "The xx", note: "quiet focus without pretending to be calm." },
  psychology: { title: "Motion Sickness", artist: "Phoebe Bridgers", note: "for the nights that overthink back." },
  philosophy: { title: "Everything in Its Right Place", artist: "Radiohead", note: "structured enough to drift inside." },
  books: { title: "Mystery of Love", artist: "Sufjan Stevens", note: "soft enough to read alongside." },
  games: { title: "Wait", artist: "M83", note: "a bit cinematic, a bit unreal." },
};

const TOPIC_MOVIES: Record<string, { title: string; note: string; context: string; posterUrl?: string }> = {
  movies: { title: "Past Lives", note: "because unfinished conversations seem to stay with you.", context: "tonight's movie", posterUrl: "https://image.tmdb.org/t/p/w1280/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg" },
  music: { title: "Inside Llewyn Davis", note: "for the beautiful kind of emotional drift.", context: "tonight's movie", posterUrl: "https://image.tmdb.org/t/p/w1280/wZcpaEKfQeC6EihJXXoM4xP0Khu.jpg" },
  design: { title: "Columbus", note: "stillness, architecture, and people circling what matters.", context: "quiet recommendation", posterUrl: "https://image.tmdb.org/t/p/w1280/pZ0q0Z1m37FzRz9Sps1X6TfXmP6.jpg" },
  startups: { title: "The Social Network", note: "ambition with sharper edges than people admit.", context: "builder mood", posterUrl: "https://image.tmdb.org/t/p/w1280/n0ybibhJtQ5icDqTp8eRytcZIix.jpg" },
  psychology: { title: "Aftersun", note: "because subtext seems to matter more to you than plot.", context: "quiet recommendation", posterUrl: "https://image.tmdb.org/t/p/w1280/v28T5F1IygM8vXWZIycvkSml42.jpg" },
  philosophy: { title: "Before Sunrise", note: "all conversation, all atmosphere, no wasted motion.", context: "late-night recommendation", posterUrl: "https://image.tmdb.org/t/p/w1280/c1zejehiwEikA5y0IqZtLqA2G7B.jpg" },
  books: { title: "Paterson", note: "for the days when ordinary detail starts feeling sacred.", context: "quiet recommendation", posterUrl: "https://image.tmdb.org/t/p/w1280/jH1C0fLgXg14jJ5c5d0x1WcE2n1.jpg" },
  games: { title: "Her", note: "soft sci-fi for emotionally literate screen people.", context: "late-night recommendation", posterUrl: "https://image.tmdb.org/t/p/w1280/1qtiXGFlBv1HpaV8t9iYwA4E8O7.jpg" },
};

const TOPIC_READING: Record<string, { title: string; author: string; quote: string; coverUrl: string }> = {
  movies: { title: "Making Movies", author: "Sidney Lumet", quote: "All good work is personal. It must be.", coverUrl: "https://covers.openlibrary.org/b/id/8302307-L.jpg" },
  music: { title: "Just Kids", author: "Patti Smith", quote: "Where does it all lead? What will become of us? These were our young questions...", coverUrl: "https://covers.openlibrary.org/b/id/8233379-L.jpg" },
  design: { title: "The Shape of Design", author: "Frank Chimero", quote: "Design is not about making things pretty, but about making them make sense.", coverUrl: "https://covers.openlibrary.org/b/id/10574160-L.jpg" },
  startups: { title: "The Creative Act", author: "Rick Rubin", quote: "The object isn't to make art, it's to be in that wonderful state which makes art inevitable.", coverUrl: "https://covers.openlibrary.org/b/id/13214589-L.jpg" },
  psychology: { title: "Man's Search for Meaning", author: "Viktor E. Frankl", quote: "Between stimulus and response there is a space. In that space is our power to choose our response.", coverUrl: "https://covers.openlibrary.org/b/id/10531580-L.jpg" },
  philosophy: { title: "Meditations", author: "Marcus Aurelius", quote: "You have power over your mind - not outside events. Realize this, and you will find strength.", coverUrl: "https://covers.openlibrary.org/b/id/8044737-L.jpg" },
  books: { title: "On Earth We're Briefly Gorgeous", author: "Ocean Vuong", quote: "Sometimes I feel like my life is just a series of rooms.", coverUrl: "https://covers.openlibrary.org/b/id/10188612-L.jpg" },
  games: { title: "Tomorrow, and Tomorrow, and Tomorrow", author: "Gabrielle Zevin", quote: "To play requires trust and love. What is a game but a world where everything makes sense?", coverUrl: "https://covers.openlibrary.org/b/id/12838384-L.jpg" },
};

const TOPIC_RECOMMENDATIONS: Record<string, { label: string; line: string; detail: string }> = {
  movies: { label: "late trains & films", line: "indie films seem to shape your rhythm lately.", detail: "they stay with you longer than the plot." },
  music: { label: "heavy rotation", line: "soundtracks that feel like walking alone at night.", detail: "music isn't background for you, it's architecture." },
  design: { label: "quiet spaces", line: "you notice the negative space in conversations.", detail: "you prefer things to feel intentional, not loud." },
  startups: { label: "late night coffee", line: "the builder energy stays on past midnight.", detail: "you respect ambition when it has a quiet focus." },
  psychology: { label: "unspoken words", line: "you tend to read the subtext first.", detail: "motives matter to you more than what people say." },
  philosophy: { label: "open loops", line: "some thoughts you don't really want to close.", detail: "you're okay with ambiguity if it feels true." },
  books: { label: "margin notes", line: "dog-eared pages and sentences that hit too close.", detail: "you read to find a name for the feeling." },
};

export function buildAdaptiveHome(memory: CandorMemory | null, seedInput?: string) {
  const now = new Date();
  const hour = now.getHours();
  const topTopics = topTopicsFromMemory(memory);
  const primaryTopic = topTopics[0];
  const secondaryTopic = topTopics[1];
  
  const hasSufficientData = (memory?.turnCount ?? 0) >= 10;
  const safeMemoryFallback = memory?.notes?.[0] ?? memory?.softSpots?.[0] ?? "you hold onto the small details.";
  const reflectionLine = sanitizeReflection(memory?.lifeThemes?.[0] ?? safeMemoryFallback);
  const soundtrack = TOPIC_SOUNDTRACKS[primaryTopic] ?? fallbackSoundtrack(hour);
  const movie = TOPIC_MOVIES[primaryTopic] ?? fallbackMovie(hour);
  const recommendation = TOPIC_RECOMMENDATIONS[primaryTopic] ?? {
    label: "for your wall",
    line: "the wall should slowly start looking more like you.",
    detail: "not louder. just more specific.",
  };
  const community = adaptCommunity(primaryTopic, secondaryTopic, hour, now);
  const surprise = adaptSurprise(primaryTopic, secondaryTopic, now);
  const openLoop = deriveOpenLoop(memory);
  
  // V3 Visual Assets (Placeholders)
  const visualMemory = {
    line: "you keep finding quiet corners in loud places.",
    imageUrl: "https://images.unsplash.com/photo-1542466500-dccb2789cbbb?auto=format&fit=crop&q=80", // tokyo alley night
  };
  const moodCollage = {
    images: [
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80", // coffee
      "https://images.unsplash.com/photo-1516280440502-60292bb0a04d?auto=format&fit=crop&q=80", // rain window
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80", // headphones
    ]
  };
  const randomObject = {
    type: "polaroid" as const,
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80", // circuit/tech/abstract
    text: "late night building",
  };
  const environment = {
    location: "Raining in Seattle",
    time: "11:42 PM",
    condition: "rain",
    imageUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80", // moody rain window
  };
  const reading = TOPIC_READING[primaryTopic] ?? fallbackReading(hour);

  const seedKey = `${seedInput ?? ""}|${primaryTopic}|${secondaryTopic}|${hour}|${memory?.turnCount ?? 0}`;
  const cards = composeHomeCards({
    hasOpenLoop: Boolean(openLoop),
    hasTopic: Boolean(primaryTopic),
    hour,
    memory,
    seedKey,
  });

  return {
    hasSufficientData,
    cards,
    heroPrompt: HERO_PROMPTS[Math.floor(now.getTime() / (1000 * 60 * 60 * 3)) % HERO_PROMPTS.length],
    reflectionLabel: REFLECTION_LABELS[seed(now, 2) % REFLECTION_LABELS.length],
    reflectionLine,
    community,
    surprise,
    soundtrack,
    movie,
    recommendation,
    openLoop,
    visualMemory,
    moodCollage,
    randomObject,
    environment,
    reading,
  } satisfies CandorAdaptiveHome;
}

function composeHomeCards(input: {
  hasOpenLoop: boolean;
  hasTopic: boolean;
  hour: number;
  memory: CandorMemory | null;
  seedKey: string;
}) {
  const cards: CandorHomeCardSpec[] = [
    { kind: "continue", size: "medium", priority: 100, spanClass: "min-h-[120px]" },
    { kind: "signal", size: "large", priority: 98, spanClass: "min-h-[280px]" },
    { kind: "visual_memory", size: "tall", priority: 95, spanClass: "aspect-[3/4]" },
    { kind: "align", size: "medium", priority: 92, spanClass: "min-h-[220px]" },
    { kind: "tonight", size: "small", priority: 88, spanClass: "min-h-[140px]" },
    { kind: "mood_collage", size: "wide", priority: 87, spanClass: "aspect-square" },
    { kind: "reflection", size: "small", priority: 84, spanClass: "min-h-[100px]" },
  ];

  if (input.hasTopic) {
    cards.push({ kind: "soundtrack", size: "medium", priority: 86, spanClass: "aspect-square" });
    cards.push({ kind: "movie", size: "tall", priority: 76, spanClass: "aspect-[2/3]" });
    cards.push({ kind: "recommendation", size: "small", priority: 74, spanClass: "min-h-[140px]" });
  } else {
    cards.push({ kind: "memory", size: "small", priority: 75, spanClass: "min-h-[120px]" });
    cards.push({ kind: "thought", size: "small", priority: 72, spanClass: "min-h-[120px]" });
    cards.push({ kind: "random_object", size: "small", priority: 71, spanClass: "aspect-square" });
  }

  // Add the new cards into the flow
  cards.push({ kind: "environment", size: "medium", priority: 85, spanClass: "min-h-[240px]" });
  cards.push({ kind: "reading", size: "large", priority: 82, spanClass: "min-h-[280px]" });

  if (input.hasOpenLoop) {
    cards.push({ kind: "open_loop", size: "small", priority: 90, spanClass: "min-h-[140px]" });
  } else {
    cards.push({ kind: "thought", size: "small", priority: 70, spanClass: "min-h-[100px]" });
  }

  if ((input.memory?.turnCount ?? 0) >= 8) {
    cards.push({ kind: "memory", size: "small", priority: 80, spanClass: "min-h-[100px]" });
  }

  return cards.sort((a, b) => {
    const delta = b.priority - a.priority;
    if (delta !== 0) return delta;
    return stableHash(`${input.seedKey}|${a.kind}`) - stableHash(`${input.seedKey}|${b.kind}`);
  });
}

function adaptCommunity(primaryTopic: string | undefined, secondaryTopic: string | undefined, hour: number, now: Date) {
  if (primaryTopic === "movies") {
    return {
      label: "tonight on candor",
      line: "people keep arguing about endings that hurt for the right reasons.",
      detail: "the film side of the room is unusually awake.",
    };
  }
  if (primaryTopic === "music") {
    return {
      label: "tonight on candor",
      line: "people keep trading songs they only send after midnight.",
      detail: "apparently some tracks should arrive with context.",
    };
  }
  if (primaryTopic === "startups") {
    return {
      label: "tonight on candor",
      line: "people are debating whether ambition is attractive or just exhausting.",
      detail: "builder energy is high, certainty is not.",
    };
  }
  if (primaryTopic === "books" || primaryTopic === "philosophy") {
    return {
      label: "people tonight keep talking about",
      line: "margin notes, old paperbacks, and the books that changed them too early.",
      detail: "the room feels quieter, but not less full.",
    };
  }
  return GENERIC_COMMUNITY[seed(now, 3) % GENERIC_COMMUNITY.length];
}

function adaptSurprise(primaryTopic: string | undefined, secondaryTopic: string | undefined, now: Date) {
  if (primaryTopic === "movies") {
    return { label: "tiny opinion", line: "first-watch honesty matters more than perfect taste.", detail: "especially with films you half-defend." };
  }
  if (primaryTopic === "movies" || secondaryTopic === "movies") {
    return { label: "tiny opinion", line: "movie recommendations are a love language.", detail: "especially when they come with one weird warning." };
  }
  if (primaryTopic === "startups") {
    return { label: "small confession", line: "ambition is louder than you let on.", detail: "builders always recognize other builders." };
  }
  return { label: "memory", line: "you keep circling back to people who feel calm.", detail: "candor noticed the pattern, quietly." };
}

function deriveOpenLoop(memory: CandorMemory | null) {
  const loops = memory?.profileV4?.openLoops;
  if (!loops) return null;

  if (loops.thinkingAbout) return { label: "unfinished", line: loops.thinkingAbout };
  if (loops.recommending) return { label: "still recommending", line: loops.recommending };
  if (loops.defending) return { label: "still defending", line: loops.defending };
  return null;
}

function topTopicsFromMemory(memory: CandorMemory | null) {
  if (!memory) return [];
  return Object.entries(memory.interactionProfile.interestSignals ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);
}

function fallbackSoundtrack(hour: number) {
  if (hour >= 22 || hour < 4) {
    return { title: "Holocene", artist: "Bon Iver", note: "this fits the quieter part of the night.", coverUrl: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80" };
  }
  if (hour < 12) {
    return { title: "Bloom", artist: "The Paper Kites", note: "something gentle enough to start with.", coverUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80" };
  }
  return { title: "Nude", artist: "Radiohead", note: "for the hours that feel suspended.", coverUrl: "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?auto=format&fit=crop&q=80" };
}

function fallbackMovie(hour: number) {
  if (hour >= 22 || hour < 4) {
    return { title: "Past Lives", note: "for the part of the night that keeps circling back.", context: "late-night recommendation", posterUrl: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?auto=format&fit=crop&q=80" };
  }
  return { title: "Columbus", note: "quiet enough to let the details do the work.", context: "quiet recommendation", posterUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80" };
}

function fallbackReading(hour: number) {
  if (hour >= 22 || hour < 4) {
    return { title: "Bluets", author: "Maggie Nelson", quote: "Suppose I were to begin by saying that I had fallen in love with a color.", coverUrl: "https://covers.openlibrary.org/b/id/6429584-L.jpg" };
  }
  return { title: "The Creative Act", author: "Rick Rubin", quote: "The object isn't to make art, it's to be in that wonderful state which makes art inevitable.", coverUrl: "https://covers.openlibrary.org/b/id/13214589-L.jpg" };
}

function sanitizeReflection(line: string) {
  const clean = line.trim().replace(/^["']|["']$/g, "");
  if (!clean) return "you sound lighter after midnight.";
  const lower = clean.charAt(0).toLowerCase() + clean.slice(1);
  return lower.endsWith(".") ? lower : `${lower}.`;
}

function seed(date: Date, offset: number) {
  return Math.floor(date.getTime() / (1000 * 60 * 60 * 3)) + offset;
}

function stableHash(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}
