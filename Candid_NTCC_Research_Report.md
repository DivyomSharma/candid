# A Conversation-Driven AI System for Behavioral Understanding and Human-Centric Social Connection

**Abstract**
Social discovery applications today rely heavily on visual cues and static profiles. This research project, titled Candid, explores an alternative approach. We developed a web-based AI platform that uses continuous dialogue to assess compatibility between users. Rather than asking individuals to fill out forms or swipe on photos, the system relies on Large Language Models (LLMs) to hold natural conversations. Over time, the AI extracts behavioral patterns, emotional states, and communication preferences. These insights are converted into vector embeddings and stored in a semantic database. By comparing these mathematical representations, Candid matches individuals based on psychological alignment instead of surface-level traits. This report covers the software architecture, the specific methods used to build the contextual memory engine, and the design decisions made to keep the user interface minimal and distraction-free. The end goal of this capstone is to demonstrate how machine learning can facilitate more deliberate and meaningful social connections online.

**Keywords**
Conversational AI, Large Language Models, Semantic Memory, Recommendation Systems, Social Computing, Retrieval-Augmented Generation, Human-Computer Interaction.

---

## 1. Introduction

### A. Problem Statement
People spend more time on social networks than ever before, yet self-reported loneliness continues to climb. Most apps built for making connections—whether for dating or friendship—are structured around a swipe mechanic. Users quickly scroll through pictures, reducing complex individuals to a split-second visual judgment. The result is often a feeling of burnout and interaction fatigue. These systems are optimized to keep people engaging with the app itself, rather than helping them log off and form lasting human bonds.

### B. Motivation
The idea behind Candid came from observing how people actually build relationships off-screen. Real connections take time. They rely on shared context, ongoing dialogue, and understanding how the other person thinks. We wanted to find out if that slow, organic process could be translated into software. The core motivation is straightforward: build a tool where users feel completely understood by the system before they are ever introduced to someone else. 

### C. Limitations of Existing Systems
When analyzing current platforms, a few structural flaws become obvious:
1. **Heavy focus on visuals:** Matching depends almost entirely on physical appearance, leaving no room for compatibility based on intellect or lifestyle.
2. **Rigid profiles:** Users are forced to summarize their entire personality into a short bio and a few preset tags. People usually write what they think the algorithm or other users want to see, leading to fake personas.
3. **Engagement loops:** Platforms maximize "time-on-site." They use variable rewards to keep users swiping, treating social discovery like a slot machine rather than a utility.

### D. Why AI is Necessary Here
Generative artificial intelligence offers a way out of this trap. Instead of making users check boxes about their hobbies, an LLM can just talk to them. Through regular chat, the AI can figure out what a person values and how they express themselves. This moves the AI from being a passive sorting algorithm behind the scenes to an active mediator that sits between the user and the wider network.

### E. Research Objectives
1. Build a web application that profiles users implicitly through natural language processing.
2. Setup a semantic memory system using vector databases to remember past conversations.
3. Design a user interface that actively reduces cognitive load and looks completely different from modern gamified apps.
4. Implement a matching engine that calculates compatibility based on inferred behavioral traits rather than manual inputs.

---

## 2. Literature Review

The gap between digital connection and actual human fulfillment has been studied for decades. Sherry Turkle’s book *Alone Together* [1] established early on that being constantly online does not mean we are emotionally supported; in fact, it often makes isolation worse. She followed this up in *Reclaiming Conversation* [2], arguing that quick texts and likes have ruined our ability to sit down and just talk to someone without an agenda. This matches Robert Putnam’s findings in *Bowling Alone* [4], which documented how Americans were pulling away from community groups long before smartphones existed. Candid is essentially an attempt to use technology to reverse that trend, focusing entirely on deep dialogue.

When it comes to how we act online, Erving Goffman’s older theories on "impression management" still hold up perfectly [8]. We constantly tweak our public image. Dan McAdams [7] talks about narrative identity—how we tell stories about our past to figure out who we are. Standard social apps don't let you tell stories; they give you a 150-character limit. Nick Yee’s *The Proteus Paradox* [13] shows how digital spaces force us into specific boxes, and Judith Donath [9] points out that since it costs nothing to lie online, it's hard to tell who is being authentic. By using AI to watch how someone talks over weeks, rather than what they claim on day one, we get a much more honest picture.

On the technical side, recommendation algorithms have historically focused on getting you to click things. Eli Pariser warned us about "filter bubbles" [6], where algorithms just feed you what you already agree with. Paul Resnick’s early work on recommender systems [10] showed how collaborative filtering works for buying books, but applying that same math to human beings gets tricky. It often leads to the persuasive, habit-forming loops described by B.J. Fogg [11] and Nir Eyal in *Hooked* [12]. 

Recent breakthroughs in LLMs, specifically the Transformer models explained by Vaswani et al. [15] and the systems detailed in the GPT-4 Technical Report [14], change the equation. We finally have computers that understand context and nuance. The research gap we are targeting is clear: nobody is using this deep semantic reasoning to fix the underlying matching problems in social apps. We are using LLMs to bypass the swipe.

---

## 3. System Architecture

![Abstract Representation of Candid's Distributed System Architecture](C:\Users\divyo\.gemini\antigravity\brain\57c4a306-f3d9-4e4c-9986-80cadc38ee0c\candid_system_architecture_1781531100356.png)

We broke Candid down into several independent modules to keep the codebase clean and scalable. 

### A. Frontend
The UI was built with Next.js and React using TypeScript. We leaned heavily on Server-Side Rendering (SSR) so the app loads fast. For styling, we used TailwindCSS because it allowed us to rapidly iterate on the minimalist dark mode. Framer Motion handles the small animations that make the chat feel fluid.

### B. Backend and Database
Supabase handles the heavy lifting on the backend. We use PostgreSQL for storing standard user data and tracking who is talking to whom. Supabase Auth manages user logins securely using JSON Web Tokens. Everything talks through Next.js API routes, so the client never touches the database directly.

### C. Conversation Engine
This is the core of the app. It's essentially a wrapper around commercial LLM APIs. We wrote very strict system prompts telling the AI to act like a thoughtful, slightly curious listener. It reads the user's input, checks the sentiment, and replies in real time.

### D. Vector Memory Layer
Standard databases are terrible at remembering the context of a conversation. To fix this, we set up a Retrieval-Augmented Generation (RAG) pipeline. When a user sends messages, the backend chunks the text and converts it into a high-dimensional vector using an embedding model. We store these inside Supabase using the `pgvector` extension. When the AI needs to reply, it searches this vector space to "remember" what the user said three weeks ago.

### E. Background Profiling
We don't do all the psychological analysis in real-time because it would make the chat too slow. Instead, a background job periodically reads the recent vector memories. It runs a separate prompt asking the LLM to summarize the user's communication style, current emotional state, and core values. 

### F. Matching Logic
When it's time to recommend a friend or connection, the system doesn't look at age or location tags. It grabs the user's generated behavioral vector and runs a cosine similarity calculation against other users in the database. The math identifies people who communicate similarly or have complementary psychological traits.

---

## 4. Methodology

Building Candid required a mix of software engineering and behavioral design. 

First, we started with requirement gathering. We looked at why people delete dating apps. The main complaints were always the same: it feels like a job, and the matches are terrible. We mapped out user journeys that explicitly avoided anything that looked like a traditional feed.

For the design phase, we did our mockups in Figma. We chose a dark theme right away. Bright white screens signal "productivity" or "work." Dark, soft gradients feel a lot calmer and easier on the eyes late at night when people are actually looking to chat.

Implementation happened in stages. We built the Next.js shell and wired up Supabase auth first. Then we integrated the basic chat API. The hardest part was getting the vector database working. Tuning the chunk size for the text embeddings took a lot of trial and error; if the chunks were too big, the AI got confused, and if they were too small, it lost the context of the sentence.

Finally, we ran tests. We simulated conversations to see if the RAG pipeline would actually pull up the right memories. We also had to tweak the system prompt heavily. Early on, the AI sounded way too much like an automated customer service bot. We had to force it to ask shorter questions and occasionally stay quiet to let the user lead.

---

## 5. AI Behavioral Understanding

![Visualization of Semantic Embeddings and Behavioral Context Mapping](C:\Users\divyo\.gemini\antigravity\brain\57c4a306-f3d9-4e4c-9986-80cadc38ee0c\candid_behavioral_embeddings_1781531113997.png)

The whole point of Candid is to figure out who a user is without annoying them with a massive questionnaire. We handle this through implicit tracking.

### A. How Memory Works
As a user types, the system is performing entity recognition and topic modeling in the background. If someone mentions, "I'm stressed because my dog is sick," that text gets turned into an array of 1536 floating-point numbers. It goes into the database. A few days later, if the user says, "I'm feeling much better today," the system searches its vectors, finds the previous conversation about the dog, and the AI can reply, "Glad to hear it. Is the dog doing better?" This creates an illusion of actual care and persistence.

### B. Tracking How People Talk
It isn't just about what is said; it's about how it's said. The profiling layer calculates verbosity (how many words they use), lexical diversity (how big their vocabulary is), and emotional valence. If User A types in short, blunt sentences focused on facts, and User B writes long, emotional paragraphs, the system knows they communicate differently. 

### C. Updating the Profile
People change, so the profile has to change too. Older conversation vectors are slowly weighted less than new ones. The system constantly acts as a background observer, tweaking its mathematical idea of who the user is so the matching stays accurate over time.

---

## 6. User Experience Design

![Candid's Minimalist, Dark-Mode Conversational Interface](C:\Users\divyo\.gemini\antigravity\brain\57c4a306-f3d9-4e4c-9986-80cadc38ee0c\candid_ui_mockup_1781531128620.png)

We adopted a "Calm Technology" approach. Most apps scream for your attention; we wanted Candid to get out of the way.

The moment you log in, there are no pictures to swipe on and no metrics telling you how popular you are. The screen is almost entirely taken up by the chat interface. We used glassmorphism effects—frosted glass panels over deep background colors—to make the UI feel modern without being distracting. 

We also use progressive disclosure. The app doesn't show you the complex psychological profile it is building until you explicitly click a button to see it. When the conversation dies down, the system doesn't send a push notification yelling "Come back!" Instead, the AI might drop a quiet, personalized prompt based on a previous chat just to see if you want to reflect on your day.

---

## 7. Implementation Details

We relied on React Server Components (RSC) to keep the app secure. By doing data fetching on the server side, we never expose our database keys or API tokens to the browser. The client-side code is reserved strictly for the UI interactions and handling the text input.

When a user hits send, the text hits an edge function. The function passes the text to OpenAI's embedding API to get the vector. It runs a similarity search in PostgreSQL using the `pgvector` HNSW index. It grabs the top five most relevant past messages, bundles them with the new message, and sends it to the LLM. The LLM's response streams back to the browser using Server-Sent Events, so it looks like it's typing in real-time. 

We added debouncing to the inputs so we don't spam our own API, and we setup service workers so the site functions like a native app on mobile phones.

---

## 8. Results and Expected Outcomes

We expect this architecture to fix a lot of the broken mechanics in social apps.

First, conversations should actually last. Because users are matched based on deep psychological compatibility rather than a nice photo, they have more to talk about right out of the gate. Second, the lack of gamification should drop the anxiety usually associated with these platforms.

However, there are technical limits. LLMs can be slow, and sometimes they hallucinate facts. If the AI hallucinates a memory about the user, it breaks trust immediately. We tried to fix this by lowering the "temperature" setting on the LLM so it acts more predictably, but it remains an ongoing engineering challenge.

---

## 9. Future Scope

There is a lot of room to expand this concept later. 

Voice integration would be the biggest upgrade. If users could talk to the AI out loud, the system could analyze tone of voice and hesitation, adding a completely new layer of emotional data to the embeddings. 

Privacy is also a major concern going forward. Right now, everything lives in a cloud database. A future version could use federated learning, where the AI model downloads to your phone, learns from your texts locally, and never sends your private conversations to a central server. It would only send up the anonymized math required to find a match.

---

## 10. Conclusion

The Candid project proves that you can build a social platform without relying on swipes and static profiles. By utilizing modern LLMs and vector databases, we created a system that actually listens to users and tries to understand them before connecting them with anyone else. 

This research shifts the focus from simply keeping users clicking buttons to actually fostering human empathy. While the math behind the embeddings and the RAG pipeline is complex, the end result for the user is incredibly simple: an app that feels calm, patient, and human-centric.

---

## References

[1] S. Turkle, *Alone Together: Why We Expect More from Technology and Less from Each Other*. Basic Books, 2011.

[2] S. Turkle, *Reclaiming Conversation: The Power of Talk in a Digital Age*. Penguin Press, 2015.

[3] M. Granovetter, "The Strength of Weak Ties," *American Journal of Sociology*, vol. 78, 1973.

[4] R. Putnam, *Bowling Alone: The Collapse and Revival of American Community*. Simon and Schuster, 2000.

[5] B. Wellman and M. Gulia, "Net Surfers Don't Ride Alone: Virtual Communities as Communities," in *Networks in the Global Village*, Westview Press, 1999.

[6] E. Pariser, *The Filter Bubble: What the Internet is Hiding from You*. Penguin Press, 2011.

[7] D. P. McAdams, *The Stories We Live By: Personal Myths and the Making of the Self*. William Morrow & Co, 1993.

[8] E. Goffman, *The Presentation of Self in Everyday Life*. Doubleday, 1959.

[9] J. Donath, "Signals in Social Supernets," *Journal of Computer-Mediated Communication*, vol. 13, 2007.

[10] P. Resnick and H. R. Varian, "Recommender Systems," *Communications of the ACM*, 1997.

[11] B. J. Fogg, *Persuasive Technology: Using Computers to Change What We Think and Do*. Morgan Kaufmann, 2002.

[12] N. Eyal, *Hooked: How to Build Habit-Forming Products*. Portfolio, 2014.

[13] N. Yee, *The Proteus Paradox: How Online Games and Virtual Worlds Change Us*. Yale University Press, 2014.

[14] OpenAI, "GPT-4 Technical Report," *arXiv preprint arXiv:2303.08774*, 2023.

[15] A. Vaswani et al., "Attention Is All You Need," *NIPS*, 2017.
