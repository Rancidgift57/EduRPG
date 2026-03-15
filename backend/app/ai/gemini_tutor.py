# backend/app/ai/gemini_tutor.py
# Renamed to keep imports working — now uses HuggingFace

import requests
import json
import re
from ..config import settings

HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

# Free models that work great for education:
# - mistralai/Mistral-7B-Instruct-v0.3   (best quality, free)
# - microsoft/Phi-3-mini-4k-instruct      (fast, free)
# - HuggingFaceH4/zephyr-7b-beta          (good for chat)
PRIMARY_MODEL   = "mistralai/Mistral-7B-Instruct-v0.3"
FALLBACK_MODEL  = "microsoft/Phi-3-mini-4k-instruct"
FAST_MODEL      = "HuggingFaceH4/zephyr-7b-beta"


class GeminiTutorService:
    """
    Drop-in replacement for Gemini — uses HuggingFace Inference API.
    Free tier: unlimited calls, no credit card needed.
    """

    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json",
        }

    def _call_hf(
        self,
        prompt: str,
        model: str = PRIMARY_MODEL,
        max_tokens: int = 300,
    ) -> str:
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens":  max_tokens,
                "temperature":     0.7,
                "top_p":           0.9,
                "do_sample":       True,
                "return_full_text": False,
            },
        }
        try:
            response = requests.post(
                f"{HF_API_URL}/{model}",
                headers=self.headers,
                json=payload,
                timeout=30,
            )

            if response.status_code == 503:
                # Model loading — retry with fallback
                return self._call_hf(prompt, FALLBACK_MODEL, max_tokens)

            if response.status_code == 429:
                # Rate limited — use fast model
                return self._call_hf(prompt, FAST_MODEL, max_tokens)

            if response.status_code != 200:
                return f"AI tutor temporarily unavailable (status {response.status_code})"

            data = response.json()

            if isinstance(data, list) and data:
                text = data[0].get("generated_text", "")
            elif isinstance(data, dict):
                text = data.get("generated_text", "")
            else:
                text = str(data)

            # Clean up the response
            text = text.strip()
            # Remove prompt echo if model returns it
            if prompt in text:
                text = text.replace(prompt, "").strip()

            return text or "Keep practicing — you'll get it!"

        except requests.Timeout:
            return "AI tutor is thinking... try again in a moment."
        except Exception as e:
            return f"Keep studying — you're doing great!"

    async def explain_wrong_answer(
        self,
        question: str,
        student_answer: str,
        correct_answer: str,
        subject: str,
        user_level: int,
    ) -> str:
        prompt = f"""<s>[INST] You are a friendly tutor for EduRPG learning game.
A Level {user_level} student studying {subject} answered incorrectly.

Question: {question}
Their answer: {student_answer}
Correct answer: {correct_answer}

Explain in 2-3 sentences why they were wrong and give a memory tip.
Be encouraging and simple. [/INST]"""

        return self._call_hf(prompt, max_tokens=150)

    async def get_hint(self, question: str, subject: str) -> str:
        prompt = f"""<s>[INST] Give ONE short hint (1-2 sentences) for this {subject} question.
Do NOT give the answer directly.
Question: {question}
Hint: [/INST]"""

        return self._call_hf(prompt, max_tokens=80)

    async def generate_quiz_questions(
        self,
        topic: str,
        difficulty: int,
        count: int = 5,
    ) -> list[dict]:
        prompt = f"""<s>[INST] Generate {count} multiple choice questions about {topic}.
Difficulty: {difficulty}/5.

Return ONLY valid JSON array, no extra text:
[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_index": 0,
    "explanation": "..."
  }}
]
[/INST]"""

        raw = self._call_hf(prompt, max_tokens=800)

        # Parse JSON safely
        try:
            # Find JSON array in response
            match = re.search(r'\[.*\]', raw, re.DOTALL)
            if match:
                return json.loads(match.group())
        except Exception:
            pass

        # Fallback hardcoded questions if AI fails
        return self._fallback_questions(topic, count)

    async def simplify_concept(self, concept: str, subject: str) -> str:
        prompt = f"""<s>[INST] Explain '{concept}' from {subject} in 2-3 simple sentences.
Use a fun analogy. Write for a student aged 15-22. [/INST]"""

        return self._call_hf(prompt, max_tokens=120)

    def _fallback_questions(self, topic: str, count: int) -> list[dict]:
        """Hardcoded fallback if HF API fails"""
        fallback = {
            "python-basics": [
                {
                    "question": "What is the correct way to print in Python?",
                    "options": ["echo 'hello'", "print('hello')", "console.log('hello')", "System.out.println('hello')"],
                    "correct_index": 1,
                    "explanation": "Python uses the print() function to output text."
                },
                {
                    "question": "Which data type stores True or False?",
                    "options": ["int", "string", "bool", "float"],
                    "correct_index": 2,
                    "explanation": "bool (boolean) stores True or False values."
                },
                {
                    "question": "How do you create a variable x with value 5?",
                    "options": ["var x = 5", "x := 5", "x = 5", "int x = 5"],
                    "correct_index": 2,
                    "explanation": "Python uses simple assignment with = sign."
                },
            ],
            "python-loops": [
                {
                    "question": "What does range(3) produce?",
                    "options": ["[1,2,3]", "[0,1,2]", "[0,1,2,3]", "[1,2]"],
                    "correct_index": 1,
                    "explanation": "range(3) produces 0, 1, 2 — starting from 0, up to but not including 3."
                },
                {
                    "question": "Which keyword exits a loop early?",
                    "options": ["exit", "stop", "break", "end"],
                    "correct_index": 2,
                    "explanation": "break immediately exits the current loop."
                },
            ],
        }

        questions = fallback.get(topic, fallback["python-basics"])
        return questions[:count]