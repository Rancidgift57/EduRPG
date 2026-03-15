from dataclasses import dataclass
from typing import Optional
from datetime import datetime
import uuid


@dataclass
class User:
    id: str
    username: str
    email: str
    password_hash: str
    xp: int = 0
    level: int = 1
    streak: int = 0
    last_login: Optional[str] = None
    created_at: str = ""
    is_active: int = 1


@dataclass
class UserPublic:
    id: str
    username: str
    email: str
    xp: int
    level: int
    streak: int
    last_login: Optional[str]
    created_at: str


# ─── Helper: result row → User ────────────────────────────
def row_to_user(row) -> User:
    return User(
        id=row[0],
        username=row[1],
        email=row[2],
        password_hash=row[3],
        xp=row[4],
        level=row[5],
        streak=row[6],
        last_login=row[7],
        created_at=row[8],
        is_active=row[9],
    )


class UserRepository:

    def __init__(self, client):
        self.client = client

    def get_by_id(self, user_id: str) -> Optional[User]:
        result = self.client.execute(
            "SELECT * FROM users WHERE id = ?",
            [user_id]
        )
        rows = result.rows
        return row_to_user(rows[0]) if rows else None

    def get_by_email(self, email: str) -> Optional[User]:
        result = self.client.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        )
        rows = result.rows
        return row_to_user(rows[0]) if rows else None

    def get_by_username(self, username: str) -> Optional[User]:
        result = self.client.execute(
            "SELECT * FROM users WHERE username = ?",
            [username]
        )
        rows = result.rows
        return row_to_user(rows[0]) if rows else None

    def create(
        self,
        username: str,
        email: str,
        password_hash: str
    ) -> User:
        user_id    = str(uuid.uuid4())
        created_at = datetime.utcnow().isoformat()

        self.client.execute(
            """INSERT INTO users
               (id, username, email, password_hash,
                xp, level, streak, created_at, is_active)
               VALUES (?, ?, ?, ?, 0, 1, 0, ?, 1)""",
            [user_id, username, email, password_hash, created_at]
        )

        return User(
            id=user_id,
            username=username,
            email=email,
            password_hash=password_hash,
            created_at=created_at,
        )

    def update_xp_and_level(
        self,
        user_id: str,
        xp: int,
        level: int
    ) -> None:
        self.client.execute(
            "UPDATE users SET xp = ?, level = ? WHERE id = ?",
            [xp, level, user_id]
        )

    def update_streak(
        self,
        user_id: str,
        streak: int,
        last_login: str
    ) -> None:
        self.client.execute(
            "UPDATE users SET streak = ?, last_login = ? WHERE id = ?",
            [streak, last_login, user_id]
        )

    def get_top_by_xp(self, limit: int = 10) -> list[User]:
        result = self.client.execute(
            """SELECT * FROM users
               WHERE is_active = 1
               ORDER BY xp DESC LIMIT ?""",
            [limit]
        )
        return [row_to_user(r) for r in result.rows]

    def add_xp_log(
        self,
        user_id: str,
        amount: int,
        source: str
    ) -> None:
        log_id     = str(uuid.uuid4())
        earned_at  = datetime.utcnow().isoformat()
        self.client.execute(
            """INSERT INTO xp_log
               (id, user_id, amount, source, earned_at)
               VALUES (?, ?, ?, ?, ?)""",
            [log_id, user_id, amount, source, earned_at]
        )

    def get_xp_log(self, user_id: str) -> list[dict]:
        result = self.client.execute(
            """SELECT amount, source, earned_at
               FROM xp_log
               WHERE user_id = ?
               ORDER BY earned_at DESC LIMIT 20""",
            [user_id]
        )
        return [
            {
                "amount":    r[0],
                "source":    r[1],
                "earned_at": r[2]
            }
            for r in result.rows
        ]