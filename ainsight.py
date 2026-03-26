from __future__ import annotations
import re
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI  # <--- New Import

# ── App Setup ───────────────────────────────────────────────────────────────
app = FastAPI(title="EduRPG AI Mentor Backend", version="5.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── HuggingFace Router Setup ────────────────────────────────────────────────
HF_TOKEN = os.getenv("HF_API_KEY") # Ensure this matches your env var name
if not HF_TOKEN:
    raise ValueError("HF_API_KEY (HF_TOKEN) not set in environment")

# Initialize the client using the HF Router URL
client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=HF_TOKEN,
)

# Use a high-performance model available on the router
MODEL_ID = "meta-llama/Llama-3.1-8B-Instruct:cerebras"

# ── Knowledge Base ──────────────────────────────────────────────────────────
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

# ── Schemas ─────────────────────────────────────────────────────────────────
class Message(BaseModel):
    role: str
    content: str

class InsightRequest(BaseModel):
    model: Optional[str] = None
    topic: str  # Required for your logic
    messages: List[Message]

class InsightResponse(BaseModel):
    summary: str
    tricks: List[str]
    analogy: str
    difficulty: str

# ── Core Logic ──────────────────────────────────────────────────────────────
def hf_chat_generate(prompt: str) -> str:
    """Uses the new OpenAI-compatible HF Router."""
    try:
        completion = client.chat.completions.create(
            model=MODEL_ID,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"HF Router Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Provider Error: {str(e)}")

def parse_tricks(text: str) -> List[str]:
    # Improved regex to handle various list formats from LLMs
    items = re.split(r'\n|(?<=\d\.)', text)
    cleaned = [re.sub(r'^\d+[\.\)]\s*', '', item).strip() for item in items if item.strip()]
    return cleaned[:4]

# ── Main Endpoint ───────────────────────────────────────────────────────────
@app.post("/insights", response_model=InsightResponse)
async def get_insights(req: InsightRequest):
    if req.topic not in TOPIC_CONTEXT:
        raise HTTPException(status_code=400, detail="Topic context not found")

    topic_label = req.topic.replace("-", " ").title()
    context = TOPIC_CONTEXT[req.topic]

    # Generate 3 specific components
    summary = hf_chat_generate(f"Context: {context}. Explain {topic_label} in 2 simple sentences for a student.")
    tricks_raw = hf_chat_generate(f"Context: {context}. Give exactly 4 short, numbered memory mnemonics for {topic_label}.")
    analogy = hf_chat_generate(f"Context: {context}. Give one real-world analogy for {topic_label} starting with 'It is like...'")

    return InsightResponse(
        summary=summary,
        tricks=parse_tricks(tricks_raw),
        analogy=analogy,
        difficulty=DIFFICULTY_MAP.get(req.topic, "Intermediate"),
    )

@app.get("/health")
async def health():
    return {"status": "ok", "provider": "HF Router (Cerebras)"}
