from __future__ import annotations

import re
import os
from typing import List, Optional, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import InferenceClient

# ── App setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="AI Mentor — HuggingFace API Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── HuggingFace API Setup ────────────────────────────────────────────────────
HF_API_KEY = os.getenv("HF_API_KEY")  # set this in Render

if not HF_API_KEY:
    raise ValueError("HF_API_KEY not set")

client = InferenceClient(
    model="google/flan-t5-small",
    token=HF_API_KEY
)

# ── Static knowledge base ────────────────────────────────────────────────────
TOPIC_CONTEXT = {
    "python-basics": "Python basics: variables, data types, if/else, loops.",
    "python-loops": "Loops: for, while, break, continue.",
    "python-functions": "Functions: def, return, args, kwargs.",
    "python-oop": "OOP: class, objects, inheritance.",
    "machine-learning": "ML: supervised, unsupervised, models.",
}

DIFFICULTY_MAP: dict[str, Literal["Beginner", "Intermediate", "Advanced"]] = {
    "python-basics": "Beginner",
    "python-loops": "Beginner",
    "python-functions": "Intermediate",
    "python-oop": "Intermediate",
    "machine-learning": "Advanced",
}

# ── Request schema (matches your frontend) ───────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class InsightRequest(BaseModel):
    model: Optional[str] = None
    max_tokens: Optional[int] = 256
    messages: List[Message]

# ── Response schema ──────────────────────────────────────────────────────────
class InsightResponse(BaseModel):
    summary: str
    tricks: list[str]
    analogy: str
    difficulty: str

# ── Helpers ─────────────────────────────────────────────────────────────────
def extract_prompt(messages: List[Message]) -> str:
    return " ".join([m.content for m in messages if m.role == "user"])

def detect_topic(prompt: str) -> str:
    prompt = prompt.lower()
    for key in TOPIC_CONTEXT:
        if key.replace("-", " ") in prompt:
            return key
    return "python-basics"

def hf_generate(prompt: str) -> str:
    try:
        response = client.text_generation(
            prompt,
            max_new_tokens=200
        )
        return response.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def parse_tricks(text: str) -> list[str]:
    lines = text.split("\n")
    return [re.sub(r"^\d+[\.\)]\s*", "", l).strip() for l in lines if l.strip()][:4]

# ── Endpoint ────────────────────────────────────────────────────────────────
@app.post("/insights", response_model=InsightResponse)
async def get_insights(req: InsightRequest):

    prompt = extract_prompt(req.messages)
    topic = detect_topic(prompt)

    context = TOPIC_CONTEXT.get(topic, "")
    difficulty = DIFFICULTY_MAP.get(topic, "Intermediate")

    topic_label = topic.replace("-", " ").title()

    try:
        summary = hf_generate(
            f"{context}\nExplain {topic_label} simply in 2 sentences."
        )

        tricks_raw = hf_generate(
            f"{context}\nGive 4 short memory tricks for {topic_label}."
        )

        analogy = hf_generate(
            f"{context}\nGive one simple real-world analogy for {topic_label}."
        )

        tricks = parse_tricks(tricks_raw)

        return InsightResponse(
            summary=summary,
            tricks=tricks,
            analogy=analogy,
            difficulty=difficulty,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── Health ──────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "model": "flan-t5-small (HF API)"}
