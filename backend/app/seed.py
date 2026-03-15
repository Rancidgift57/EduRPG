from .database import get_connection, create_tables
from .models.hero import HeroRepository
from .models.monster import MonsterRepository


def seed():
    client = get_connection()

    try:
        create_tables()
        hero_repo    = HeroRepository(client)
        monster_repo = MonsterRepository(client)

        hero_repo.seed_default_heroes()
        monster_repo.seed_default_monsters()

        print("Seeding complete!")

    finally:
        client.close()


if __name__ == "__main__":
    seed()