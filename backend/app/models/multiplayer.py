from dataclasses import dataclass
from typing import Optional
import uuid
from datetime import datetime, timedelta


@dataclass
class MultiplayerBattle:
    id: str
    attacker_id: str          # Player who initiated
    defender_id: str          # Player being attacked
    attacker_questions: str   # JSON — questions A chose for B
    defender_questions: str   # JSON — questions B chose for A
    attacker_answers: str     # JSON — A's answers to B's questions
    defender_answers: str     # JSON — B's answers to A's questions
    attacker_score: int
    defender_score: int
    status: str               # pending/attacker_done/defender_done/completed
    winner_id: Optional[str]
    trophies_wagered: int
    created_at: str
    expires_at: str           # 24hr window


@dataclass
class PlayerRanking:
    user_id: str
    trophies: int
    league: str               # Bronze/Silver/Gold/Diamond/Legend
    wins: int
    losses: int
    attack_wins: int
    defense_wins: int
    win_streak: int


LEAGUE_THRESHOLDS = {
    "Bronze":   (0, 499),
    "Silver":   (500, 999),
    "Gold":     (1000, 1999),
    "Diamond":  (2000, 2999),
    "Legend":   (3000, 999999),
}

LEAGUE_EMOJIS = {
    "Bronze":  "🥉",
    "Silver":  "🥈",
    "Gold":    "🥇",
    "Diamond": "💎",
    "Legend":  "👑",
}

TROPHY_REWARDS = {
    "win":  30,
    "loss": -15,
    "draw": 5,
}


def get_league(trophies: int) -> str:
    for league, (low, high) in LEAGUE_THRESHOLDS.items():
        if low <= trophies <= high:
            return league
    return "Legend"


def row_to_battle(row) -> MultiplayerBattle:
    return MultiplayerBattle(
        id=row[0], attacker_id=row[1], defender_id=row[2],
        attacker_questions=row[3], defender_questions=row[4],
        attacker_answers=row[5], defender_answers=row[6],
        attacker_score=row[7], defender_score=row[8],
        status=row[9], winner_id=row[10],
        trophies_wagered=row[11],
        created_at=row[12], expires_at=row[13],
    )


def row_to_ranking(row) -> PlayerRanking:
    return PlayerRanking(
        user_id=row[0], trophies=row[1], league=row[2],
        wins=row[3], losses=row[4], attack_wins=row[5],
        defense_wins=row[6], win_streak=row[7],
    )


class MultiplayerRepository:

    def __init__(self, client):
        self.client = client

    def create_tables(self):
        self.client.execute("""
            CREATE TABLE IF NOT EXISTS multiplayer_battles (
                id                  TEXT PRIMARY KEY,
                attacker_id         TEXT NOT NULL,
                defender_id         TEXT NOT NULL,
                attacker_questions  TEXT DEFAULT '[]',
                defender_questions  TEXT DEFAULT '[]',
                attacker_answers    TEXT DEFAULT '[]',
                defender_answers    TEXT DEFAULT '[]',
                attacker_score      INTEGER DEFAULT 0,
                defender_score      INTEGER DEFAULT 0,
                status              TEXT DEFAULT 'pending',
                winner_id           TEXT,
                trophies_wagered    INTEGER DEFAULT 20,
                created_at          TEXT NOT NULL,
                expires_at          TEXT NOT NULL
            )
        """)
        self.client.execute("""
            CREATE TABLE IF NOT EXISTS player_rankings (
                user_id     TEXT PRIMARY KEY,
                trophies    INTEGER DEFAULT 100,
                league      TEXT DEFAULT 'Bronze',
                wins        INTEGER DEFAULT 0,
                losses      INTEGER DEFAULT 0,
                attack_wins INTEGER DEFAULT 0,
                defense_wins INTEGER DEFAULT 0,
                win_streak  INTEGER DEFAULT 0
            )
        """)
        self.client.execute("""
            CREATE TABLE IF NOT EXISTS battle_invites (
                id          TEXT PRIMARY KEY,
                from_user   TEXT NOT NULL,
                to_user     TEXT NOT NULL,
                topic       TEXT NOT NULL,
                status      TEXT DEFAULT 'pending',
                created_at  TEXT NOT NULL
            )
        """)

    def get_or_create_ranking(self, user_id: str) -> PlayerRanking:
        result = self.client.execute(
            "SELECT * FROM player_rankings WHERE user_id = ?",
            [user_id]
        )
        if result.rows:
            return row_to_ranking(result.rows[0])
        # Create default ranking
        self.client.execute(
            """INSERT INTO player_rankings
               (user_id, trophies, league, wins, losses,
                attack_wins, defense_wins, win_streak)
               VALUES (?, 100, 'Bronze', 0, 0, 0, 0, 0)""",
            [user_id]
        )
        return PlayerRanking(user_id=user_id, trophies=100,
            league="Bronze", wins=0, losses=0,
            attack_wins=0, defense_wins=0, win_streak=0)

    def find_opponent(self, user_id: str, trophies: int) -> Optional[dict]:
        """Find opponent within ±200 trophies"""
        result = self.client.execute(
            """SELECT pr.user_id, pr.trophies, pr.league,
                      u.username, u.level
               FROM player_rankings pr
               JOIN users u ON pr.user_id = u.id
               WHERE pr.user_id != ?
               AND pr.trophies BETWEEN ? AND ?
               AND u.is_active = 1
               ORDER BY ABS(pr.trophies - ?) ASC
               LIMIT 5""",
            [user_id, trophies - 200, trophies + 200, trophies]
        )
        if not result.rows:
            # Widen search
            result = self.client.execute(
                """SELECT pr.user_id, pr.trophies, pr.league,
                          u.username, u.level
                   FROM player_rankings pr
                   JOIN users u ON pr.user_id = u.id
                   WHERE pr.user_id != ?
                   AND u.is_active = 1
                   ORDER BY ABS(pr.trophies - ?) ASC
                   LIMIT 5""",
                [user_id, trophies]
            )
        if not result.rows:
            return None
        import random
        row = random.choice(result.rows[:3] if len(result.rows) >= 3 else result.rows)
        return {
            "user_id":  row[0], "trophies": row[1],
            "league":   row[2], "username": row[3], "level": row[4],
        }

    def create_battle(
        self,
        attacker_id: str,
        defender_id: str,
        questions_for_defender: list,
        trophies_wagered: int = 20
    ) -> MultiplayerBattle:
        import json
        battle_id  = str(uuid.uuid4())
        now        = datetime.utcnow()
        expires_at = (now + timedelta(hours=24)).isoformat()

        self.client.execute(
            """INSERT INTO multiplayer_battles
               (id, attacker_id, defender_id, attacker_questions,
                defender_questions, attacker_answers, defender_answers,
                attacker_score, defender_score, status,
                trophies_wagered, created_at, expires_at)
               VALUES (?, ?, ?, ?, '[]', '[]', '[]', 0, 0,
                       'pending', ?, ?, ?)""",
            [battle_id, attacker_id, defender_id,
             json.dumps(questions_for_defender),
             trophies_wagered, now.isoformat(), expires_at]
        )
        result = self.client.execute(
            "SELECT * FROM multiplayer_battles WHERE id = ?",
            [battle_id]
        )
        return row_to_battle(result.rows[0])

    def submit_attacker_answers(
        self,
        battle_id: str,
        answers: list,
        score: int,
        defender_questions: list
    ) -> None:
        import json
        self.client.execute(
            """UPDATE multiplayer_battles
               SET attacker_answers = ?, attacker_score = ?,
                   defender_questions = ?, status = 'attacker_done'
               WHERE id = ?""",
            [json.dumps(answers), score,
             json.dumps(defender_questions), battle_id]
        )

    def submit_defender_answers(
        self,
        battle_id: str,
        answers: list,
        score: int
    ) -> dict:
        import json
        self.client.execute(
            """UPDATE multiplayer_battles
               SET defender_answers = ?, defender_score = ?,
                   status = 'calculating'
               WHERE id = ?""",
            [json.dumps(answers), score, battle_id]
        )
        result = self.client.execute(
            "SELECT * FROM multiplayer_battles WHERE id = ?",
            [battle_id]
        )
        battle = row_to_battle(result.rows[0])

        # Determine winner
        if battle.attacker_score > battle.defender_score:
            winner_id = battle.attacker_id
        elif battle.defender_score > battle.attacker_score:
            winner_id = battle.defender_id
        else:
            winner_id = None  # draw

        self.client.execute(
            """UPDATE multiplayer_battles
               SET winner_id = ?, status = 'completed'
               WHERE id = ?""",
            [winner_id, battle_id]
        )

        # Update rankings
        self._update_rankings(battle, winner_id)

        return {
            "winner_id":       winner_id,
            "attacker_score":  battle.attacker_score,
            "defender_score":  score,
            "trophies_wagered": battle.trophies_wagered,
        }

    def _update_rankings(
        self,
        battle: MultiplayerBattle,
        winner_id: Optional[str]
    ) -> None:
        w = battle.trophies_wagered

        if winner_id == battle.attacker_id:
            self._add_trophies(battle.attacker_id, w, "attack")
            self._add_trophies(battle.defender_id, -w, "loss")
        elif winner_id == battle.defender_id:
            self._add_trophies(battle.defender_id, w, "defense")
            self._add_trophies(battle.attacker_id, -w, "loss")
        else:
            # draw — small gain both sides
            self._add_trophies(battle.attacker_id, 5, "draw")
            self._add_trophies(battle.defender_id, 5, "draw")

    def _add_trophies(
        self,
        user_id: str,
        delta: int,
        result_type: str
    ) -> None:
        ranking = self.get_or_create_ranking(user_id)
        new_trophies = max(0, ranking.trophies + delta)
        new_league   = get_league(new_trophies)

        if result_type in ("attack", "defense"):
            self.client.execute(
                f"""UPDATE player_rankings
                    SET trophies = ?, league = ?, wins = wins + 1,
                        {'attack_wins' if result_type == 'attack' else 'defense_wins'}
                        = {'attack_wins' if result_type == 'attack' else 'defense_wins'} + 1,
                        win_streak = win_streak + 1
                    WHERE user_id = ?""",
                [new_trophies, new_league, user_id]
            )
        else:
            self.client.execute(
                """UPDATE player_rankings
                   SET trophies = ?, league = ?,
                       losses = losses + 1, win_streak = 0
                   WHERE user_id = ?""",
                [new_trophies, new_league, user_id]
            )

    def get_my_battles(self, user_id: str) -> list[dict]:
        import json
        result = self.client.execute(
            """SELECT mb.*, 
                      ua.username as attacker_name,
                      ud.username as defender_name
               FROM multiplayer_battles mb
               JOIN users ua ON mb.attacker_id = ua.id
               JOIN users ud ON mb.defender_id = ud.id
               WHERE (mb.attacker_id = ? OR mb.defender_id = ?)
               AND mb.status != 'expired'
               ORDER BY mb.created_at DESC LIMIT 20""",
            [user_id, user_id]
        )
        battles = []
        for r in result.rows:
            battles.append({
                "id": r[0], "attacker_id": r[1],
                "defender_id": r[2], "status": r[9],
                "attacker_score": r[7], "defender_score": r[8],
                "winner_id": r[10], "trophies_wagered": r[11],
                "created_at": r[12], "expires_at": r[13],
                "attacker_name": r[14], "defender_name": r[15],
                "my_role": "attacker" if r[1] == user_id else "defender",
                "questions_for_me": json.loads(
                    r[4] if r[1] == user_id else r[3]
                ),
            })
        return battles

    def get_battle(self, battle_id: str) -> Optional[MultiplayerBattle]:
        result = self.client.execute(
            "SELECT * FROM multiplayer_battles WHERE id = ?",
            [battle_id]
        )
        return row_to_battle(result.rows[0]) if result.rows else None

    def get_pending_defenses(self, user_id: str) -> list:
        result = self.client.execute(
            """SELECT mb.*, u.username as attacker_name
               FROM multiplayer_battles mb
               JOIN users u ON mb.attacker_id = u.id
               WHERE mb.defender_id = ?
               AND mb.status = 'attacker_done'
               ORDER BY mb.created_at DESC""",
            [user_id]
        )

        import json
        battles = []

        for r in result.rows:
            question_ids = json.loads(r[3]) if r[3] else []

            battles.append({
                "id": r[0],
                "attacker_id": r[1],
                "questions": question_ids,
                "trophies_wagered": r[11],
                "expires_at": r[13],
                "attacker_name": r[14],
            })

        return battles   

    def get_leaderboard(self, limit: int = 50) -> list[dict]:
        result = self.client.execute(
            """SELECT pr.*, u.username, u.level
               FROM player_rankings pr
               JOIN users u ON pr.user_id = u.id
               ORDER BY pr.trophies DESC LIMIT ?""",
            [limit]
        )
        return [
            {
                "rank": i + 1,
                "user_id": r[0], "trophies": r[1],
                "league": r[2], "wins": r[3],
                "losses": r[4], "win_streak": r[7],
                "username": r[8], "level": r[9],
            }
            for i, r in enumerate(result.rows)
        ]
