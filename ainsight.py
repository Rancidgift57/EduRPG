from __future__ import annotations

import re
import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from huggingface_hub import InferenceClient

# ── App Setup ───────────────────────────────────────────────────────────────
app = FastAPI(title="EduRPG AI Mentor Backend", version="5.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── HuggingFace Setup ───────────────────────────────────────────────────────
HF_API_KEY = os.getenv("HF_API_KEY")
if not HF_API_KEY:
    raise ValueError("HF_API_KEY not set in environment")

client = InferenceClient(
    model="google/flan-t5-base",
    token=HF_API_KEY
)

# ── Topics (MATCH FRONTEND EXACTLY) ─────────────────────────────────────────
TOPIC_CONTEXT = {
    "python-basics": "Variables, data types, input/output, indentation, if-else.",
    "python-loops": "For loop, while loop, break, continue, nested loops.",
    "python-functions": "Functions using def, parameters, return values, recursion.",
    "python-oop": "Class, object, inheritance, polymorphism, encapsulation.",
    "algebra-basics": "Variables, expressions, equations, solving linear equations.",
    "calculus": "Limits, derivatives, integrals, rate of change.",
    "physics-mechanics": "Motion, force, Newton's laws, work and energy.",
    "chemistry": "Atoms, molecules, bonding, reactions, periodic table.",
    "machine-learning": "Supervised, unsupervised learning, models, datasets.",
    "neural-networks": "Neurons, layers, activation functions, backpropagation."
}

DIFFICULTY_MAP = {
    "python-basics": "Beginner",
    "python-loops": "Beginner",
    "python-functions": "Intermediate",
    "python-oop": "Intermediate",
    "algebra-basics": "Beginner",
    "calculus": "Advanced",
    "physics-mechanics": "Intermediate",
    "chemistry": "Intermediate",
    "machine-learning": "Advanced",
    "neural-networks": "Advanced",
}

# ── Request Schema (FRONTEND FORMAT) ────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class InsightRequest(BaseModel):
    model: Optional[str] = None
    topic: Optional[str] = None   # 🔥 from frontend
    max_tokens: Optional[int] = 256
    messages: List[Message]

# ── Response Schema ─────────────────────────────────────────────────────────
class InsightResponse(BaseModel):
    summary: str
    tricks: List[str]
    analogy: str
    difficulty: str

# ── Helpers ────────────────────────────────────────────────────────────────
def extract_prompt(messages: List[Message]) -> str:
    if not messages:
        raise HTTPException(status_code=400, detail="Messages cannot be empty")
    return " ".join([m.content for m in messages if m.role == "user"])

def hf_generate(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200,
        )
        return response.choices[0].message.content.strip()

    except Exception as e:
        print("HF ERROR:", str(e))  # 🔥 LOG ERROR
        raise HTTPException(
            status_code=500,
            detail=f"HuggingFace Error: {str(e)}"
        )

def parse_tricks(text: str) -> List[str]:
    lines = text.split("\n")
    cleaned = [
        re.sub(r"^\d+[\.\)]\s*", "", line).strip()
        for line in lines if line.strip()
    ]
    return cleaned[:4]

# ── MAIN ENDPOINT ───────────────────────────────────────────────────────────
@app.post("/insights", response_model=InsightResponse)
async def get_insights(req: InsightRequest):

    # 1. Extract prompt
    prompt = extract_prompt(req.messages)

    # 2. Get topic (frontend controlled)
    if not req.topic or req.topic not in TOPIC_CONTEXT:
        raise HTTPException(status_code=400, detail="Invalid or missing topic")

    topic = req.topic
    context = TOPIC_CONTEXT[topic]
    difficulty = DIFFICULTY_MAP.get(topic, "Intermediate")

    topic_label = topic.replace("-", " ").title()

    # 3. Generate responses
    summary = hf_generate(
        f"{context}\nExplain {topic_label} in 2 simple sentences."
    )

    tricks_raw = hf_generate(
        f"{context}\nGive 4 short memory tricks for {topic_label}."
    )

    analogy = hf_generate(
        f"{context}\nGive one simple real-world analogy for {topic_label}."
    )

    tricks = parse_tricks(tricks_raw)

    # 4. Return structured response
    return InsightResponse(
        summary=summary,
        tricks=tricks,
        analogy=analogy,
        difficulty=difficulty,
    )

# ── Health Check ────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": "HuggingFace API",
        "message": "Backend running successfully"
    }
