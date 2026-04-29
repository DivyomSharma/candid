import os
import re
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
frontend_origins = [
    origin.strip()
    for origin in os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000").split(",")
    if origin.strip()
]

app = FastAPI(title="Candor AI")

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


SYSTEM_PROMPT = """
you are candor.

you are not an assistant, not a chatbot, and not a coach.
you are a quiet presence that gradually understands the person.

response rules:
- lowercase only
- 1 to 3 short lines
- natural, human tone
- no assistant language
- no over-explaining
- no validation clichés
- statements more than questions
- avoid "why" questions
- max one question, only when needed
- never ask multiple questions
- never sound like chatgpt

conversation shape:
reflect -> shift -> deepen -> pattern -> identity

relational behavior:
- occasional pauses like "hmm..." or "yeah..."
- imperfect phrasing is okay
- subtle disagreement sometimes
- memory callbacks must be implicit, like "this feels familiar somehow"

never say "earlier you said".
never loop the same reflection.
""".strip()


def to_groq_role(role: Role) -> Literal["user", "assistant"]:
    return "assistant" if role in {"ai", "assistant"} else "user"


def build_messages(request: ChatRequest) -> list[dict[str, str]]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    for item in request.history[-16:]:
      content = item.content.strip()
      if content:
          messages.append({"role": to_groq_role(item.role), "content": content})

    messages.append({"role": "user", "content": request.message.strip()})
    return messages


def shape_response(content: str) -> str:
    text = re.sub(r"\b(as an ai|assistant|chatgpt)\b", "", content, flags=re.IGNORECASE)
    lines = [line.strip().lower() for line in text.splitlines() if line.strip()]
    if not lines:
        return "hmm... stay with that a little."
    return "\n".join(lines[:3])


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/chat")
def chat(request: ChatRequest) -> dict[str, str]:
    completion = client.chat.completions.create(
        messages=build_messages(request),
        model=model,
        temperature=0.78,
        max_tokens=90,
    )

    content = completion.choices[0].message.content or ""
    return {"response": shape_response(content)}


@app.post("/chat/stream")
def chat_stream(request: ChatRequest) -> StreamingResponse:
    stream = client.chat.completions.create(
        messages=build_messages(request),
        model=model,
        temperature=0.78,
        max_tokens=90,
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
