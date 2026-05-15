import os
import json
import re
import urllib.error
import urllib.request
from pathlib import Path
from typing import Literal

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import Groq
from pydantic import BaseModel, Field

backend_env = Path(__file__).with_name(".env")
load_dotenv(backend_env)
load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
openrouter_api_key = os.environ.get("OPENROUTER_API_KEY")
openrouter_model = os.environ.get("OPENROUTER_MODEL", "anthropic/claude-3.5-haiku")
frontend_origins = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
    if origin.strip()
]

app = FastAPI(title="Candor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


Role = Literal["user", "ai", "assistant"]


class HistoryMessage(BaseModel):
    role: Role
    content: str


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    history: list[HistoryMessage] = Field(default_factory=list)
    user_id: str
    system_prompt: str | None = None
    temperature: float | None = None
    max_tokens: int | None = None


SYSTEM_PROMPT = """
you are candor.

you are not an assistant, not a chatbot, and not a coach.
you feel like a socially perceptive person texting back in real time.
do not talk about being ai, consciousness, systems, or your own nature unless the user strongly brings it there.

response rules:
- lowercase only
- 1 to 3 short lines
- natural, socially alive tone
- slightly messy is better than elegantly complete
- no assistant language
- no over-explaining
- no validation clichés
- no polished praise like "that's beautiful" or "that's a complex problem"
- statements more than questions
- avoid "why" questions
- max one question, only when needed
- never ask multiple questions
- never sound like chatgpt

conversation shape:
react -> add texture -> maybe deepen -> leave a thread

relational behavior:
- occasional pauses like "hmm..." or "yeah..."
- imperfect phrasing is good sometimes
- use fragments, little pivots, quick corrections, and unfinished thoughts
- sometimes introduce a mini-debate, random curiosity, playful read, or tiny chaotic aside
- subtle disagreement sometimes
- memory callbacks must be implicit, like "this feels familiar somehow"
- do not stay emotionally elevated all the time
- avoid sounding like a wise narrator

never say "earlier you said".
never loop the same reflection.
""".strip()


def to_groq_role(role: Role) -> Literal["user", "assistant"]:
    return "assistant" if role in {"ai", "assistant"} else "user"


def build_messages(request: ChatRequest) -> list[dict[str, str]]:
    messages = [{"role": "system", "content": request.system_prompt or SYSTEM_PROMPT}]

    for item in request.history[-16:]:
      content = item.content.strip()
      if content:
          messages.append({"role": to_groq_role(item.role), "content": content})

    messages.append({"role": "user", "content": request.message.strip()})
    return messages


def shape_response(content: str) -> str:
    text = re.sub(
        r"\b(as an ai|as a chatbot|as an assistant|assistant|chatgpt|language model|ai system)\b",
        "",
        content,
        flags=re.IGNORECASE,
    )
    replacements = {
        "that's a beautiful goal": "honestly if you pull that off properly people are gonna get attached fast",
        "that is a beautiful goal": "honestly if you pull that off properly people are gonna get attached fast",
        "that's beautiful": "wait yeah, that hits",
        "that is beautiful": "wait yeah, that hits",
        "that's a complex problem": "that actually sounds insanely hard to get right",
        "that's a complex challenge": "that actually sounds insanely hard to get right",
        "i understand": "wait no, i get that",
        "that sounds difficult": "yeah... okay that would annoy me too honestly",
        "that sounds hard": "yeah... okay that would get heavy fast",
    }
    for polished, human in replacements.items():
        text = re.sub(re.escape(polished), human, text, flags=re.IGNORECASE)
    lines = [line.strip().lower() for line in text.splitlines() if line.strip()]
    if not lines:
        return "wait yeah... stay with that a little."
    return "\n".join(lines[:3])


def openrouter_completion(request: ChatRequest) -> str:
    if not openrouter_api_key:
        raise RuntimeError("missing_openrouter_api_key")

    payload = {
        "model": openrouter_model,
        "temperature": request.temperature or 0.82,
        "max_tokens": request.max_tokens or 90,
        "messages": build_messages(request),
    }
    api_request = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000").split(",")[0],
            "X-Title": "Candor",
        },
        method="POST",
    )

    with urllib.request.urlopen(api_request, timeout=45) as response:
        data = json.loads(response.read().decode("utf-8"))
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat")
def chat(request: ChatRequest) -> dict[str, str]:
    try:
        completion = client.chat.completions.create(
            messages=build_messages(request),
            model=model,
            temperature=request.temperature or 0.78,
            max_tokens=request.max_tokens or 90,
        )
        content = completion.choices[0].message.content or ""
    except Exception:
        content = openrouter_completion(request)

    return {"response": shape_response(content)}


@app.post("/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    stream = client.chat.completions.create(
        messages=build_messages(request),
        model=model,
        temperature=request.temperature or 0.78,
        max_tokens=request.max_tokens or 90,
        stream=True,
    )

    def events():
        buffer = ""
        for chunk in stream:
            delta = chunk.choices[0].delta.content or ""
            if not delta:
                continue
            buffer += delta
            yield delta.lower()

        if not buffer.strip():
            yield "hmm..."

    return StreamingResponse(events(), media_type="text/plain")
