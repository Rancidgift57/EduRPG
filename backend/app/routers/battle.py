from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
import random
import json
import math

from ..database import get_db
from ..auth import get_current_user
from ..models.hero    import HeroRepository
from ..models.monster import MonsterRepository
from ..models.battle  import BattleRepository
from ..models.user    import UserRepository

router = APIRouter(prefix="/battle", tags=["Battle"])

# ─── Schemas ──────────────────────────────────────────────
class StartBattleRequest(BaseModel):
    topic: str
    hero_id: Optional[str] = None

class AnswerRequest(BaseModel):
    session_id: str
    selected_index: int
    question_id: Optional[str] = None
    skill: Optional[str] = None

# ─── XP Table ─────────────────────────────────────────────
XP_SOURCES = {
    "correct_answer": 10,
    "monster_defeat": 75,
    "boss_defeat":   200,
}

CRIT_CHANCE = 0.15

# ─── Helpers ──────────────────────────────────────────────
def calc_hero_damage(attack_power: int, skill: Optional[str] = None):
    is_crit = random.random() < CRIT_CHANCE
    damage  = attack_power
    if skill == "double_strike":
        damage *= 2
    if is_crit:
        damage = int(damage * 1.5)
    return damage, is_crit

def calc_monster_damage(attack_power: int, defense: int, skill: Optional[str] = None):
    reduction = defense / 200
    if skill == "iron_shield":
        reduction += 0.5
    return max(1, int(attack_power * (1 - reduction)))

def get_question(conn, topic: str, difficulty: int = 1) -> Optional[dict]:
    # ✅ Use .rows instead of .fetchone()
    result = conn.execute(
        """SELECT id, body, options_json, correct_index, explanation
           FROM questions
           WHERE topic = ? AND difficulty <= ?
           ORDER BY RANDOM() LIMIT 1""",
        [topic, difficulty]
    )
    if not result.rows:
        # Fallback — try any question for this topic ignoring difficulty
        result = conn.execute(
            """SELECT id, body, options_json, correct_index, explanation
               FROM questions
               WHERE topic = ?
               ORDER BY RANDOM() LIMIT 1""",
            [topic]
        )
    if not result.rows:
        return None

    row = result.rows[0]
    options = json.loads(row[2]) if isinstance(row[2], str) else row[2]
    return {
        "id":            row[0],
        "body":          row[1],
        "options":       options,
        "correct_index": row[3],
        "explanation":   row[4] or "",
    }

def get_monster_topic(conn, monster_id: str) -> str:
    result = conn.execute(
        "SELECT topic FROM monsters WHERE id = ?",
        [monster_id]
    )
    return result.rows[0][0] if result.rows else "python-basics"

# ─── Start Battle ─────────────────────────────────────────
@router.post("/start")
def start_battle(
    data: StartBattleRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    user_repo    = UserRepository(conn)
    hero_repo    = HeroRepository(conn)
    monster_repo = MonsterRepository(conn)
    battle_repo  = BattleRepository(conn)

    user = user_repo.get_by_id(current_user["id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Get hero
    hero = (
        hero_repo.get_by_id(data.hero_id)
        if data.hero_id
        else hero_repo.get_active_hero(current_user["id"])
    )
    if not hero:
        raise HTTPException(
            status_code=400,
            detail="No hero selected. Please select a hero first."
        )

    # Spawn monster
    monster = monster_repo.spawn_instance(data.topic, user.level)

    # Create session
    session = battle_repo.create_session(
        user_id=current_user["id"],
        hero_id=hero.id,
        monster_id=monster.monster_id,
        player_hp=hero.max_hp,
        monster_hp=monster.current_hp,
    )

    # Get first question
    question = get_question(conn, data.topic, user.level)

    return {
        "session_id": session.id,
        "hero": {
            "id":           hero.id,
            "name":         hero.name,
            "max_hp":       hero.max_hp,
            "attack_power": hero.attack_power,
            "defense":      hero.defense,
            "skill_name":   hero.skill_name,
            "sprite_key":   hero.sprite_key,
        },
        "monster": {
            "name":       monster.name,
            "max_hp":     monster.max_hp,
            "current_hp": monster.current_hp,
            "sprite_key": monster.sprite_key,
            "is_boss":    monster.is_boss,
        },
        "question":   question,
        "player_hp":  hero.max_hp,
        "monster_hp": monster.current_hp,
    }



@router.get("/question")
def get_question_endpoint(
    topic: str,
    difficulty: int = 1,
    conn=Depends(get_db)
):
    """Get a random question for a topic — used by frontend fallback"""
    question = get_question(conn, topic, difficulty)
    if not question:
        raise HTTPException(
            status_code=404,
            detail=f"No questions found for topic: {topic}. "
                   "Run AI quiz generation first at POST /ai/generate-quiz"
        )
    return question


# ─── Submit Answer ────────────────────────────────────────
@router.post("/answer")
def submit_answer(
    data: AnswerRequest,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    battle_repo = BattleRepository(conn)
    hero_repo   = HeroRepository(conn)
    user_repo   = UserRepository(conn)

    session = battle_repo.get_session(data.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Battle session not found")
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Battle already ended")
    if session.user_id != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not your battle")

    hero = hero_repo.get_by_id(session.hero_id)
    if not hero:
        raise HTTPException(status_code=404, detail="Hero not found")

    topic = get_monster_topic(conn, session.monster_id)

    # Validate answer against question_id if provided
    is_correct  = False
    explanation = ""

    if data.question_id:
        # ✅ Use .rows instead of .fetchone()
        result = conn.execute(
            "SELECT correct_index, explanation FROM questions WHERE id = ?",
            [data.question_id]
        )
        if result.rows:
            row         = result.rows[0]
            is_correct  = data.selected_index == row[0]
            explanation = row[1] or ""
    else:
        # Fallback — get any question for topic to validate
        result = conn.execute(
            """SELECT correct_index, explanation FROM questions
               WHERE topic = ? ORDER BY RANDOM() LIMIT 1""",
            [topic]
        )
        if result.rows:
            row         = result.rows[0]
            is_correct  = data.selected_index == row[0]
            explanation = row[1] or ""

    # Record answer
    battle_repo.record_answer(data.session_id, is_correct)

    player_hp  = session.player_hp
    monster_hp = session.monster_hp
    xp_gained  = 0
    is_crit    = False
    damage     = 0
    action     = ""

    if is_correct:
        damage, is_crit = calc_hero_damage(hero.attack_power, data.skill)
        monster_hp = max(0, monster_hp - damage)
        xp_gained  = XP_SOURCES["correct_answer"]
        if is_crit:
            xp_gained += 5
        action = "hero_attack"
    else:
        damage    = calc_monster_damage(hero.attack_power, hero.defense, data.skill)
        player_hp = max(0, player_hp - damage)
        action    = "monster_attack"

    battle_repo.update_hp(data.session_id, player_hp, monster_hp)

    monster_defeated = monster_hp <= 0
    player_defeated  = player_hp <= 0
    battle_over      = monster_defeated or player_defeated

    if battle_over:
        result_str = "victory" if monster_defeated else "defeat"

        if monster_defeated:
            # ✅ Use .rows instead of .fetchone()
            m_result = conn.execute(
                "SELECT xp_reward, is_boss FROM monsters WHERE id = ?",
                [session.monster_id]
            )
            if m_result.rows:
                xp_gained += m_result.rows[0][0]
                if m_result.rows[0][1]:
                    xp_gained += XP_SOURCES["boss_defeat"]
                else:
                    xp_gained += XP_SOURCES["monster_defeat"]

        stats = battle_repo.end_session(data.session_id, result_str, xp_gained)

        # Award XP
        user = user_repo.get_by_id(current_user["id"])
        new_xp    = user.xp + xp_gained
        new_level = max(1, int(math.sqrt(new_xp / 100)))
        leveled_up = new_level > user.level
        user_repo.update_xp_and_level(current_user["id"], new_xp, new_level)
        user_repo.add_xp_log(current_user["id"], xp_gained,
            "monster_defeat" if monster_defeated else "battle_loss")

        hero_repo.increment_usage(current_user["id"], hero.id)

        return {
            "action":           action,
            "is_correct":       is_correct,
            "damage":           damage,
            "is_critical":      is_crit,
            "xp_gained":        xp_gained,
            "player_hp":        player_hp,
            "monster_hp":       monster_hp,
            "monster_defeated": monster_defeated,
            "player_defeated":  player_defeated,
            "battle_over":      True,
            "result":           result_str,
            "stats": {
                "total_xp":        stats.total_xp,
                "questions_asked": stats.questions_asked,
                "correct_count":   stats.correct_count,
                "accuracy":        stats.accuracy,
            },
            "leveled_up":  leveled_up,
            "new_level":   new_level,
            "explanation": explanation if not is_correct else "",
        }

    # Battle continues — next question
    next_question = get_question(conn, topic)

    return {
        "action":        action,
        "is_correct":    is_correct,
        "damage":        damage,
        "is_critical":   is_crit,
        "xp_gained":     xp_gained,
        "player_hp":     player_hp,
        "monster_hp":    monster_hp,
        "battle_over":   False,
        "explanation":   explanation if not is_correct else "",
        "next_question": next_question,
    }

# ─── Get Battle State ─────────────────────────────────────
@router.get("/state/{session_id}")
def get_battle_state(
    session_id: str,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    battle_repo = BattleRepository(conn)
    session = battle_repo.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id":      session.id,
        "player_hp":       session.player_hp,
        "monster_hp":      session.monster_hp,
        "status":          session.status,
        "xp_earned":       session.xp_earned,
        "questions_asked": session.questions_asked,
        "correct_count":   session.correct_count,
    }

# ─── Battle History ───────────────────────────────────────
@router.get("/history")
def get_battle_history(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    battle_repo = BattleRepository(conn)
    return battle_repo.get_user_history(current_user["id"])

# ─── Forfeit ──────────────────────────────────────────────
@router.post("/forfeit/{session_id}")
def forfeit_battle(
    session_id: str,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    battle_repo = BattleRepository(conn)
    session = battle_repo.get_session(session_id)

    if not session or session.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "active":
        raise HTTPException(status_code=400, detail="Battle already ended")

    stats = battle_repo.end_session(session_id, "defeat", 0)
    return {
        "message": "Battle forfeited",
        "stats": {
            "questions_asked": stats.questions_asked,
            "correct_count":   stats.correct_count,
            "accuracy":        stats.accuracy,
        }
    }