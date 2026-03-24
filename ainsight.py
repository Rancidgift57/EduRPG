from __future__ import annotations

import re
import json
from functools import lru_cache
from typing import Literal

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

# ── App setup ─────────────────────────────────────────────────────────────────
app = FastAPI(title="AI Mentor — HuggingFace Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── HuggingFace model (lazy-loaded once) ──────────────────────────────────────
MODEL_ID = "google/flan-t5-small"   # good balance of quality vs. size
                                     # upgrade to "google/flan-t5-xl" for better results


@lru_cache(maxsize=1)
def get_pipeline():
    """Load the text-generation pipeline exactly once and cache it."""
    print(f"[AI Mentor] Loading model: {MODEL_ID} …")
    device = 0 if torch.cuda.is_available() else -1
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_ID)
    pipe = pipeline(
        "text2text-generation",
        model=model,
        tokenizer=tokenizer,
        device=device,
        max_new_tokens=512,
    )
    print("[AI Mentor] Model ready ✅")
    return pipe


# ── Static knowledge base ─────────────────────────────────────────────────────
# Fallback context injected into prompts so the smaller model stays accurate.
TOPIC_CONTEXT: dict[str, str] = {
    "python-basics": (
        "Python is a high-level interpreted language. Key concepts: variables, "
        "data types (int, str, list, dict), print(), input(), if/else, indentation rules."
    ),
    "python-loops": (
        "Python loops: for loop iterates over sequences; while loop runs while condition is True. "
        "range(), break, continue, enumerate(), nested loops."
    ),
    "python-functions": (
        "Functions in Python: def keyword, parameters, return values, default arguments, "
        "*args, **kwargs, lambda expressions, scope (local vs global)."
    ),
    "python-oop": (
        "Object-Oriented Programming: class, __init__, self, inheritance, encapsulation, "
        "polymorphism, dunder methods, class vs instance attributes."
    ),
    "algebra-basics": (
        "Algebra: variables, expressions, equations, inequalities, linear equations, "
        "PEMDAS order of operations, solving for x, factoring, quadratic formula."
    ),
    "calculus": (
        "Calculus: limits, derivatives (rate of change, power rule, chain rule, product rule), "
        "integrals (area under curve, definite vs indefinite), fundamental theorem of calculus."
    ),
    "physics-mechanics": (
        "Classical mechanics: Newton's laws of motion, kinematics, forces, momentum, "
        "energy conservation, work, power, gravity, projectile motion."
    ),
    "chemistry": (
        "Chemistry basics: periodic table, atomic structure (protons, neutrons, electrons), "
        "chemical bonds (ionic, covalent), reactions, acids/bases, pH scale, stoichiometry."
    ),
    "machine-learning": (
        "Machine learning: supervised vs unsupervised learning, features and labels, "
        "training/test split, overfitting, regression, classification, evaluation metrics."
    ),
    "neural-networks": (
        "Neural networks: neurons, layers (input, hidden, output), activation functions, "
        "forward propagation, backpropagation, gradient descent, weights, biases, deep learning."
    ),
}

DIFFICULTY_MAP: dict[str, Literal["Beginner", "Intermediate", "Advanced"]] = {
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


# ── Request / Response schemas ────────────────────────────────────────────────
class InsightRequest(BaseModel):
    topic: str
    video_title: str


class InsightResponse(BaseModel):
    summary: str
    tricks: list[str]
    analogy: str
    difficulty: str


# ── Prompt builders ───────────────────────────────────────────────────────────
def build_summary_prompt(topic_label: str, video_title: str, context: str) -> str:
    return (
        f"Context: {context}\n\n"
        f"Write a 2-sentence beginner-friendly summary explaining what '{topic_label}' is "
        f"and why it matters. The student is watching: '{video_title}'."
    )


def build_tricks_prompt(topic_label: str, context: str) -> str:
    return (
        f"Context: {context}\n\n"
        f"List 4 short, practical memory tricks or mnemonics to help a student master "
        f"'{topic_label}'. Return as a numbered list."
    )


def build_analogy_prompt(topic_label: str, context: str) -> str:
    return (
        f"Context: {context}\n\n"
        f"Give ONE memorable real-world analogy (1-2 sentences) that makes '{topic_label}' "
        f"easy to understand for a complete beginner."
    )


# ── Helpers ───────────────────────────────────────────────────────────────────
def parse_tricks(raw: str) -> list[str]:
    """Extract numbered list items from model output."""
    lines = raw.strip().splitlines()
    tricks: list[str] = []
    for line in lines:
        line = re.sub(r"^\s*\d+[\.\)]\s*", "", line).strip()
        if line:
            tricks.append(line)
    return tricks[:4] if tricks else [raw.strip()]


def run_prompt(pipe, prompt: str) -> str:
    """Run a single prompt through the pipeline and return text."""
    results = pipe(prompt, max_new_tokens=256, do_sample=False)
    return results[0]["generated_text"].strip()


@app.get("/")
async def root():
    return {"message": "AI Mentor API is running. Visit /health for status."}


# ── Endpoint ──────────────────────────────────────────────────────────────────
@app.post("/insights", response_model=InsightResponse)
async def get_insights(req: InsightRequest) -> InsightResponse:
    topic_key = req.topic
    context = TOPIC_CONTEXT.get(topic_key, f"Topic: {topic_key}")
    difficulty = DIFFICULTY_MAP.get(topic_key, "Intermediate")

    # Derive a human-readable label from the key
    topic_label = topic_key.replace("-", " ").title()

    try:
        pipe = get_pipeline()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"Model not available: {exc}") from exc

    try:
        # Run three targeted prompts — smaller models are more reliable with focused prompts
        summary_raw = run_prompt(pipe, build_summary_prompt(topic_label, req.video_title, context))
        tricks_raw  = run_prompt(pipe, build_tricks_prompt(topic_label, context))
        analogy_raw = run_prompt(pipe, build_analogy_prompt(topic_label, context))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}") from exc

    tricks = parse_tricks(tricks_raw)

    return InsightResponse(
        summary=summary_raw,
        tricks=tricks,
        analogy=analogy_raw,
        difficulty=difficulty,
    )


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_ID, "cuda": torch.cuda.is_available()}


# ── Batch endpoint (optional, for pre-caching all topics) ─────────────────────
@app.post("/insights/batch")
async def get_all_insights():
    """Pre-generate insights for every topic. Useful for warming up the cache."""
    results = {}
    for key in TOPIC_CONTEXT:
        video_title = f"{key.replace('-', ' ').title()} Tutorial"
        req = InsightRequest(topic=key, video_title=video_title)
        results[key] = await get_insights(req)
    return results


# ── Dev entry point ───────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai_mentor:app", host="0.0.0.0", port=8000, reload=True)
