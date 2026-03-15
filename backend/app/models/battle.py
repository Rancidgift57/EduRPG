from dataclasses import dataclass
from typing import Optional
import uuid
from datetime import datetime


@dataclass
class BattleSession:
    id: str
    user_id: str
    hero_id: str
    monster_id: str
    player_hp: int
    monster_hp: int
    monster_max_hp: int
    status: str = "active"
    xp_earned: int = 0
    questions_asked: int = 0
    correct_count: int = 0
    started_at: str = ""
    ended_at: Optional[str] = None


@dataclass
class BattleResult:
    action: str
    is_correct: bool
    damage: int
    is_critical: bool
    xp_gained: int
    player_hp: int
    monster_hp: int
    monster_defeated: bool = False
    player_defeated: bool = False
    battle_over: bool = False
    next_question: Optional[dict] = None
    message: str = ""


@dataclass
class BattleStats:
    session_id: str
    result: str
    total_xp: int
    questions_asked: int
    correct_count: int
    accuracy: float
    duration_seconds: int


def row_to_session(row) -> BattleSession:
    return BattleSession(
        id=row[0],
        user_id=row[1],
        hero_id=row[2],
        monster_id=row[3],
        player_hp=row[4],
        monster_hp=row[5],
        monster_max_hp=row[5],
        status=row[6],
        xp_earned=row[7],
        questions_asked=row[8],
        correct_count=row[9],
        started_at=row[10],
        ended_at=row[11],
    )


class BattleRepository:

    def __init__(self, client):
        self.client = client

    def create_session(
        self,
        user_id: str,
        hero_id: str,
        monster_id: str,
        player_hp: int,
        monster_hp: int,
    ) -> BattleSession:
        session_id = str(uuid.uuid4())
        started_at = datetime.utcnow().isoformat()

        self.client.execute(
            """INSERT INTO battle_sessions
               (id, user_id, hero_id, monster_id,
                player_hp, monster_hp, status,
                xp_earned, questions_asked, correct_count, started_at)
               VALUES (?, ?, ?, ?, ?, ?, 'active', 0, 0, 0, ?)""",
            [session_id, user_id, hero_id,
             monster_id, player_hp, monster_hp, started_at]
        )

        return BattleSession(
            id=session_id,
            user_id=user_id,
            hero_id=hero_id,
            monster_id=monster_id,
            player_hp=player_hp,
            monster_hp=monster_hp,
            monster_max_hp=monster_hp,
            started_at=started_at,
        )

    def get_session(self, session_id: str) -> Optional[BattleSession]:
        result = self.client.execute(
            "SELECT * FROM battle_sessions WHERE id = ?",
            [session_id]
        )
        rows = result.rows
        return row_to_session(rows[0]) if rows else None

    def get_active_session(self, user_id: str) -> Optional[BattleSession]:
        result = self.client.execute(
            """SELECT * FROM battle_sessions
               WHERE user_id = ? AND status = 'active'
               ORDER BY started_at DESC LIMIT 1""",
            [user_id]
        )
        rows = result.rows
        return row_to_session(rows[0]) if rows else None

    def update_hp(
        self,
        session_id: str,
        player_hp: int,
        monster_hp: int
    ) -> None:
        self.client.execute(
            """UPDATE battle_sessions
               SET player_hp = ?, monster_hp = ?
               WHERE id = ?""",
            [player_hp, monster_hp, session_id]
        )

    def record_answer(
        self,
        session_id: str,
        is_correct: bool
    ) -> None:
        self.client.execute(
            """UPDATE battle_sessions
               SET questions_asked = questions_asked + 1,
                   correct_count   = correct_count + ?
               WHERE id = ?""",
            [1 if is_correct else 0, session_id]
        )

    def end_session(
        self,
        session_id: str,
        status: str,
        xp_earned: int
    ) -> BattleStats:
        ended_at = datetime.utcnow().isoformat()

        self.client.execute(
            """UPDATE battle_sessions
               SET status = ?, xp_earned = ?, ended_at = ?
               WHERE id = ?""",
            [status, xp_earned, ended_at, session_id]
        )

        session  = self.get_session(session_id)
        accuracy = (
            session.correct_count / session.questions_asked
            if session.questions_asked > 0 else 0.0
        )

        start_dt = datetime.fromisoformat(session.started_at)
        end_dt   = datetime.fromisoformat(ended_at)
        duration = int((end_dt - start_dt).total_seconds())

        return BattleStats(
            session_id=session_id,
            result=status,
            total_xp=xp_earned,
            questions_asked=session.questions_asked,
            correct_count=session.correct_count,
            accuracy=round(accuracy, 2),
            duration_seconds=duration,
        )

    def get_user_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> list[dict]:
        result = self.client.execute(
            """SELECT id, status, xp_earned, questions_asked,
                      correct_count, started_at, ended_at
               FROM battle_sessions
               WHERE user_id = ? AND status != 'active'
               ORDER BY started_at DESC LIMIT ?""",
            [user_id, limit]
        )
        return [
            {
                "session_id":      r[0],
                "result":          r[1],
                "xp_earned":       r[2],
                "questions_asked": r[3],
                "correct_count":   r[4],
                "accuracy": round(r[4] / r[3], 2) if r[3] > 0 else 0,
                "started_at":      r[5],
                "ended_at":        r[6],
            }
            for r in result.rows
        ]