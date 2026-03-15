from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import json, random

from ..database import get_db
from ..auth import get_current_user
from ..models.multiplayer import MultiplayerRepository
from ..models.user import UserRepository

router = APIRouter(prefix="/multiplayer", tags=["Multiplayer"])


# ─── Schemas ──────────────────────────────────────────────
class FindOpponentRequest(BaseModel):
    topic: str


class CreateBattleRequest(BaseModel):
    defender_id: str
    topic: str
    questions_for_defender: list   # List of question IDs chosen for opponent


class SubmitAnswersRequest(BaseModel):
    battle_id: str
    answers: list                  # [{question_id, selected_index}]
    questions_for_opponent: list   # Questions chosen for opponent


class DefenderAnswersRequest(BaseModel):
    battle_id: str
    answers: list


# ─── Find Opponent ────────────────────────────────────────
@router.post("/find-opponent")
def find_opponent(
    data: FindOpponentRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = MultiplayerRepository(conn)
    ranking = repo.get_or_create_ranking(current_user["id"])
    opp     = repo.find_opponent(current_user["id"], ranking.trophies)

    if not opp:
        raise HTTPException(status_code=404, detail="No opponents found")

    # Get questions for this topic
    result = conn.execute(
        """SELECT id, body, options_json, correct_index
           FROM questions WHERE topic = ?
           ORDER BY RANDOM() LIMIT 15""",
        [data.topic]
    )

    questions = [
        {
            "id": r[0], "body": r[1],
            "options": json.loads(r[2]),
            "correct_index": r[3],
        }
        for r in result.rows
    ]

    return {
        "opponent":  opp,
        "questions": questions,   # Choose 5 to send to opponent
        "my_ranking": {
            "trophies": ranking.trophies,
            "league":   ranking.league,
        }
    }


# ─── Start Battle (Attacker sends questions) ─────────────
@router.post("/start-battle")
def start_battle(
    data: CreateBattleRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    if len(data.questions_for_defender) < 3:
        raise HTTPException(
            status_code=400,
            detail="Must select at least 3 questions for opponent"
        )

    repo   = MultiplayerRepository(conn)
    battle = repo.create_battle(
        attacker_id=current_user["id"],
        defender_id=data.defender_id,
        questions_for_defender=data.questions_for_defender,
    )

    return {
        "battle_id": battle.id,
        "message":   "Battle started! Now answer YOUR questions.",
        "status":    battle.status,
    }


# ─── Attacker submits their answers ──────────────────────
@router.post("/submit-attack")
def submit_attack(
    data: SubmitAnswersRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo   = MultiplayerRepository(conn)
    battle = repo.get_battle(data.battle_id)

    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    if battle.attacker_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not your battle")
    if battle.status != "pending":
        raise HTTPException(status_code=400, detail="Already submitted")

    # Calculate attacker score
    score = _calculate_score(data.answers, conn)

    repo.submit_attacker_answers(
        battle_id=data.battle_id,
        answers=data.answers,
        score=score,
        defender_questions=data.questions_for_opponent,
    )

    return {
        "score":   score,
        "message": "Attack submitted! Waiting for opponent to respond.",
        "battle_id": data.battle_id,
    }


# ─── Defender answers ─────────────────────────────────────
@router.post("/submit-defense")
def submit_defense(
    data: DefenderAnswersRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo   = MultiplayerRepository(conn)
    battle = repo.get_battle(data.battle_id)

    if not battle:
        raise HTTPException(status_code=404, detail="Battle not found")
    if battle.defender_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not your battle")
    if battle.status != "attacker_done":
        raise HTTPException(status_code=400, detail="Not your turn")

    score  = _calculate_score(data.answers, conn)
    result = repo.submit_defender_answers(
        battle_id=data.battle_id,
        answers=data.answers,
        score=score,
    )

    # Award XP for participating
    user_repo = UserRepository(conn)
    xp_gain   = 50 if result["winner_id"] == current_user["id"] else 20
    user      = user_repo.get_by_id(current_user["id"])
    import math
    new_xp    = user.xp + xp_gain
    new_level = max(1, int(math.sqrt(new_xp / 100)))
    user_repo.update_xp_and_level(current_user["id"], new_xp, new_level)

    return {
        **result,
        "your_score":  score,
        "xp_gained":   xp_gain,
        "is_winner":   result["winner_id"] == current_user["id"],
    }


# ─── Get my battles ───────────────────────────────────────
@router.get("/my-battles")
def my_battles(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo = MultiplayerRepository(conn)
    return repo.get_my_battles(current_user["id"])


# ─── Get pending defenses (inbox) ────────────────────────
@router.get("/inbox")
def get_inbox(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo     = MultiplayerRepository(conn)
    pending  = repo.get_pending_defenses(current_user["id"])
    ranking  = repo.get_or_create_ranking(current_user["id"])
    return {
        "pending_battles": pending,
        "count":           len(pending),
        "ranking":         {
            "trophies":  ranking.trophies,
            "league":    ranking.league,
            "wins":      ranking.wins,
            "losses":    ranking.losses,
            "win_streak": ranking.win_streak,
        }
    }


# ─── Trophy leaderboard ───────────────────────────────────
@router.get("/leaderboard")
def trophy_leaderboard(conn=Depends(get_db)):
    repo = MultiplayerRepository(conn)
    return repo.get_leaderboard(50)


# ─── My ranking ───────────────────────────────────────────
@router.get("/my-ranking")
def my_ranking(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo    = MultiplayerRepository(conn)
    ranking = repo.get_or_create_ranking(current_user["id"])
    return {
        "trophies":    ranking.trophies,
        "league":      ranking.league,
        "wins":        ranking.wins,
        "losses":      ranking.losses,
        "attack_wins": ranking.attack_wins,
        "defense_wins": ranking.defense_wins,
        "win_streak":  ranking.win_streak,
    }


# ─── Helper ───────────────────────────────────────────────
def _calculate_score(answers: list, conn) -> int:
    score = 0
    for ans in answers:
        result = conn.execute(
            "SELECT correct_index FROM questions WHERE id = ?",
            [ans["question_id"]]
        )
        if result.rows:
            if result.rows[0][0] == ans["selected_index"]:
                score += 1
    return score