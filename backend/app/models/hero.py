from dataclasses import dataclass
from typing import Optional
import uuid


@dataclass
class Hero:
    id: str
    name: str
    subject: str
    attack_power: int
    defense: int
    max_hp: int
    skill_name: Optional[str]
    skill_effect: Optional[str]
    sprite_key: Optional[str]
    unlock_level: int


def row_to_hero(row) -> Hero:
    return Hero(
        id=row[0],
        name=row[1],
        subject=row[2],
        attack_power=row[3],
        defense=row[4],
        max_hp=row[5],
        skill_name=row[6],
        skill_effect=row[7],
        sprite_key=row[8],
        unlock_level=row[9],
    )


class HeroRepository:

    def __init__(self, client):
        self.client = client

    def get_all(self) -> list[Hero]:
        result = self.client.execute(
            "SELECT * FROM heroes ORDER BY unlock_level ASC"
        )
        return [row_to_hero(r) for r in result.rows]

    def get_by_id(self, hero_id: str) -> Optional[Hero]:
        result = self.client.execute(
            "SELECT * FROM heroes WHERE id = ?",
            [hero_id]
        )
        rows = result.rows
        return row_to_hero(rows[0]) if rows else None

    def get_by_subject(self, subject: str) -> Optional[Hero]:
        result = self.client.execute(
            "SELECT * FROM heroes WHERE subject = ? LIMIT 1",
            [subject]
        )
        rows = result.rows
        return row_to_hero(rows[0]) if rows else None

    def get_active_hero(self, user_id: str) -> Optional[Hero]:
        result = self.client.execute(
            """SELECT h.* FROM heroes h
               JOIN user_heroes uh ON h.id = uh.hero_id
               WHERE uh.user_id = ? AND uh.is_active = 1
               LIMIT 1""",
            [user_id]
        )
        rows = result.rows
        return row_to_hero(rows[0]) if rows else None

    def get_user_heroes(self, user_id: str) -> list[dict]:
        result = self.client.execute(
            """SELECT h.*, uh.is_active, uh.times_used
               FROM heroes h
               JOIN user_heroes uh ON h.id = uh.hero_id
               WHERE uh.user_id = ?""",
            [user_id]
        )
        return [
            {
                "id":           r[0],
                "name":         r[1],
                "subject":      r[2],
                "attack_power": r[3],
                "defense":      r[4],
                "max_hp":       r[5],
                "skill_name":   r[6],
                "sprite_key":   r[8],
                "unlock_level": r[9],
                "is_active":    r[10],
                "times_used":   r[11],
            }
            for r in result.rows
        ]

    def unlock_hero(self, user_id: str, hero_id: str) -> None:
        self.client.execute(
            """INSERT OR IGNORE INTO user_heroes
               (user_id, hero_id, is_active, times_used)
               VALUES (?, ?, 0, 0)""",
            [user_id, hero_id]
        )

    def set_active_hero(self, user_id: str, hero_id: str) -> None:
        self.client.execute(
            "UPDATE user_heroes SET is_active = 0 WHERE user_id = ?",
            [user_id]
        )
        self.client.execute(
            """UPDATE user_heroes SET is_active = 1
               WHERE user_id = ? AND hero_id = ?""",
            [user_id, hero_id]
        )

    def increment_usage(self, user_id: str, hero_id: str) -> None:
        self.client.execute(
            """UPDATE user_heroes
               SET times_used = times_used + 1
               WHERE user_id = ? AND hero_id = ?""",
            [user_id, hero_id]
        )

    def seed_default_heroes(self) -> None:
        result = self.client.execute(
            "SELECT COUNT(*) FROM heroes"
        )
        count = result.rows[0][0]
        if count > 0:
            return

        default_heroes = [
            (str(uuid.uuid4()), "Samurai", "Mathematics",
             25, 12, 110, "double_strike",
             "Deal 2x damage on correct answer", "samurai", 1),
            (str(uuid.uuid4()), "Wizard", "Programming",
             30, 8, 90, "hint_spell",
             "Reveal one wrong option", "wizard", 1),
            (str(uuid.uuid4()), "Ninja", "Science",
             22, 15, 100, "shadow_dodge",
             "Skip one wrong-answer penalty", "ninja", 5),
            (str(uuid.uuid4()), "Knight", "History",
             18, 20, 130, "iron_shield",
             "Reduce monster attack by 50%", "knight", 8),
            (str(uuid.uuid4()), "Robot", "AI Technology",
             28, 10, 95, "data_scan",
             "Show topic hint before question", "robot", 12),
        ]

        for h in default_heroes:
            self.client.execute(
                """INSERT INTO heroes
                   (id, name, subject, attack_power, defense, max_hp,
                    skill_name, skill_effect, sprite_key, unlock_level)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                list(h)
            )

        print(f"Seeded {len(default_heroes)} heroes!")