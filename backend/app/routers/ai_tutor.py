from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..database import get_db
from ..auth import get_current_user
from ..ai.gemini_tutor import GeminiTutorService

router  = APIRouter(prefix="/ai", tags=["AI Tutor"])
tutor   = GeminiTutorService()


# ─── Schemas ──────────────────────────────────────────────
class ExplainRequest(BaseModel):
    question:       str
    student_answer: str
    correct_answer: str
    subject:        str
    user_level:     int = 1


class HintRequest(BaseModel):
    question: str
    subject:  str


class GenerateQuizRequest(BaseModel):
    topic:      str
    difficulty: int = 2
    count:      int = 5


class SimplifyRequest(BaseModel):
    concept: str
    subject: str


# ─── Explain Wrong Answer ─────────────────────────────────
@router.post("/explain")
async def explain_answer(
    req: ExplainRequest,
    current_user=Depends(get_current_user)
):
    try:
        explanation = await tutor.explain_wrong_answer(
            question=req.question,
            student_answer=req.student_answer,
            correct_answer=req.correct_answer,
            subject=req.subject,
            user_level=req.user_level
        )
        return {"explanation": explanation}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Tutor error: {str(e)}"
        )


# ─── Get Hint ─────────────────────────────────────────────
@router.post("/hint")
async def get_hint(
    req: HintRequest,
    current_user=Depends(get_current_user)
):
    try:
        hint = await tutor.get_hint(req.question, req.subject)
        return {"hint": hint}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Tutor error: {str(e)}"
        )


# ─── Generate Quiz Questions ──────────────────────────────
@router.post("/generate-quiz")
async def generate_quiz(
    req: GenerateQuizRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    try:
        questions = await tutor.generate_quiz_questions(
            topic=req.topic,
            difficulty=req.difficulty,
            count=req.count
        )

        # Save generated questions to Turso DB
        import uuid, json
        saved = []
        for q in questions:
            q_id = str(uuid.uuid4())
            conn.execute(
                """INSERT INTO questions
                   (id, topic, subject, body, type,
                    explanation, difficulty, options_json, correct_index)
                   VALUES (?, ?, ?, ?, 'mcq', ?, ?, ?, ?)""",
                [
                    q_id,
                    req.topic,
                    req.topic,            # subject same as topic for AI generated
                    q["question"],
                    q.get("explanation", ""),
                    req.difficulty,
                    json.dumps(q["options"]),
                    q["correct_index"],
                ]
            )
            saved.append({
                "id":            q_id,
                "body":          q["question"],
                "options":       q["options"],
                "correct_index": q["correct_index"],
                "explanation":   q.get("explanation", ""),
            })

        conn.commit()

        return {
            "message":   f"Generated and saved {len(saved)} questions",
            "questions": saved
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz generation error: {str(e)}"
        )


# ─── Simplify Concept ─────────────────────────────────────
@router.post("/simplify")
async def simplify_concept(
    req: SimplifyRequest,
    current_user=Depends(get_current_user)
):
    try:
        simplified = await tutor.simplify_concept(
            req.concept, req.subject
        )
        return {"explanation": simplified}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI Tutor error: {str(e)}"
        )


# ─── Health Check (no auth needed) ───────────────────────
@router.get("/status")
async def ai_status():
    try:
        # Quick test call to Gemini
        response = await tutor.get_hint(
            "What is a variable?", "Programming"
        )
        return {
            "status": "online",
            "model":  "gemini-1.5-flash",
            "test":   response[:50] + "..."
        }
    except Exception as e:
        return {
            "status": "error",
            "detail": str(e)
        }