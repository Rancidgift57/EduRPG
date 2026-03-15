from dataclasses import dataclass
from typing import Optional
import uuid
import math


@dataclass
class Monster:
    id: str
    name: str
    topic: str
    subject: str
    difficulty: int
    max_hp: int
    attack_power: int
    xp_reward: int
    sprite_key: Optional[str]
    is_boss: int


@dataclass
class MonsterInstance:
    monster_id: str
    name: str
    topic: str
    current_hp: int
    max_hp: int
    attack_power: int
    xp_reward: int
    sprite_key: Optional[str]
    is_boss: bool


def row_to_monster(row) -> Monster:
    return Monster(
        id=row[0],
        name=row[1],
        topic=row[2],
        subject=row[3],
        difficulty=row[4],
        max_hp=row[5],
        attack_power=row[6],
        xp_reward=row[7],
        sprite_key=row[8],
        is_boss=row[9],
    )


class MonsterRepository:

    def __init__(self, client):
        self.client = client

    def get_all(self) -> list[Monster]:
        result = self.client.execute(
            "SELECT * FROM monsters ORDER BY difficulty ASC"
        )
        return [row_to_monster(r) for r in result.rows]

    def get_by_id(self, monster_id: str) -> Optional[Monster]:
        result = self.client.execute(
            "SELECT * FROM monsters WHERE id = ?",
            [monster_id]
        )
        rows = result.rows
        return row_to_monster(rows[0]) if rows else None

    def get_by_topic(self, topic: str) -> Optional[Monster]:
        result = self.client.execute(
            """SELECT * FROM monsters
               WHERE topic = ? AND is_boss = 0 LIMIT 1""",
            [topic]
        )
        rows = result.rows
        return row_to_monster(rows[0]) if rows else None

    def get_boss_for_topic(self, topic: str) -> Optional[Monster]:
        result = self.client.execute(
            """SELECT * FROM monsters
               WHERE topic = ? AND is_boss = 1 LIMIT 1""",
            [topic]
        )
        rows = result.rows
        return row_to_monster(rows[0]) if rows else None

    def spawn_instance(
        self,
        topic: str,
        user_level: int
    ) -> MonsterInstance:
        monster = self.get_by_topic(topic)

        if not monster:
            # Fallback to any non-boss monster
            result = self.client.execute(
                "SELECT * FROM monsters WHERE is_boss = 0 LIMIT 1"
            )
            rows = result.rows
            if not rows:
                raise Exception("No monsters in database")
            monster = row_to_monster(rows[0])

        scale      = 1 + (user_level * 0.08)
        scaled_hp  = math.ceil(monster.max_hp * scale)
        scaled_atk = math.ceil(monster.attack_power * (1 + user_level * 0.05))

        return MonsterInstance(
            monster_id=monster.id,
            name=monster.name,
            topic=monster.topic,
            current_hp=scaled_hp,
            max_hp=scaled_hp,
            attack_power=scaled_atk,
            xp_reward=monster.xp_reward,
            sprite_key=monster.sprite_key,
            is_boss=bool(monster.is_boss),
        )

    def seed_default_monsters(self) -> None:
        result = self.client.execute(
            "SELECT COUNT(*) FROM monsters"
        )
        count = result.rows[0][0]
        if count > 0:
            return

        default_monsters = [
            (str(uuid.uuid4()), "Variable Viper",   "python-basics",
             "Programming",   1, 60,  8,  30, "variable_viper",   0),
            (str(uuid.uuid4()), "Loop Serpent",      "python-loops",
             "Programming",   2, 90,  12, 50, "loop_serpent",     0),
            (str(uuid.uuid4()), "Function Phantom",  "python-functions",
             "Programming",   2, 85,  11, 45, "function_phantom", 0),
            (str(uuid.uuid4()), "OOP Overlord",      "python-oop",
             "Programming",   4, 180, 22, 150,"oop_overlord",     1),
            (str(uuid.uuid4()), "Algebra Beast",     "algebra-basics",
             "Mathematics",   2, 80,  11, 45, "algebra_beast",    0),
            (str(uuid.uuid4()), "Calculus Titan",    "calculus",
             "Mathematics",   5, 200, 28, 200,"calculus_titan",   1),
            (str(uuid.uuid4()), "Physics Golem",     "physics-mechanics",
             "Science",       2, 85,  12, 50, "physics_golem",    0),
            (str(uuid.uuid4()), "Chemistry Dragon",  "chemistry",
             "Science",       3, 120, 16, 90, "chemistry_dragon", 0),
            (str(uuid.uuid4()), "Data Demon",        "machine-learning",
             "AI Technology", 3, 130, 17, 100,"data_demon",       0),
            (str(uuid.uuid4()), "Neural Nightmare",  "neural-networks",
             "AI Technology", 4, 160, 21, 130,"neural_nightmare", 1),
        ]

        for m in default_monsters:
            self.client.execute(
                """INSERT INTO monsters
                   (id, name, topic, subject, difficulty,
                    max_hp, attack_power, xp_reward, sprite_key, is_boss)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                list(m)
            )

        print(f"Seeded {len(default_monsters)} monsters!")