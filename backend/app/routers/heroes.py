from fastapi import APIRouter, Depends, HTTPException, status
from ..database import get_db
from ..auth import get_current_user
from ..models.hero import HeroRepository
from ..models.user import UserRepository

router = APIRouter(prefix="/heroes", tags=["Heroes"])


# ─── Get All Heroes ───────────────────────────────────────
@router.get("/")
def get_all_heroes(conn=Depends(get_db)):
    repo = HeroRepository(conn)
    heroes = repo.get_all()
    return [
        {
            "id":           h.id,
            "name":         h.name,
            "subject":      h.subject,
            "attack_power": h.attack_power,
            "defense":      h.defense,
            "max_hp":       h.max_hp,
            "skill_name":   h.skill_name,
            "skill_effect": h.skill_effect,
            "sprite_key":   h.sprite_key,
            "unlock_level": h.unlock_level,
        }
        for h in heroes
    ]


# ─── Get My Unlocked Heroes ───────────────────────────────
@router.get("/my-heroes")
def get_my_heroes(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo = HeroRepository(conn)
    return repo.get_user_heroes(current_user["id"])


# ─── Get Active Hero ──────────────────────────────────────
@router.get("/active")
def get_active_hero(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo = HeroRepository(conn)
    hero = repo.get_active_hero(current_user["id"])

    if not hero:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active hero selected"
        )

    return {
        "id":           hero.id,
        "name":         hero.name,
        "subject":      hero.subject,
        "attack_power": hero.attack_power,
        "defense":      hero.defense,
        "max_hp":       hero.max_hp,
        "skill_name":   hero.skill_name,
        "sprite_key":   hero.sprite_key,
    }


# ─── Select / Switch Hero ─────────────────────────────────
@router.post("/select/{hero_id}")
def select_hero(
    hero_id: str,
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    hero_repo = HeroRepository(conn)
    user_repo = UserRepository(conn)

    # Check hero exists
    hero = hero_repo.get_by_id(hero_id)
    if not hero:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero not found"
        )

    # Check user level meets requirement
    user = user_repo.get_by_id(current_user["id"])
    if user.level < hero.unlock_level:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Reach Level {hero.unlock_level} to unlock {hero.name}"
        )

    # Unlock if not already unlocked
    hero_repo.unlock_hero(current_user["id"], hero_id)

    # Set as active
    hero_repo.set_active_hero(current_user["id"], hero_id)

    return {
        "message":  f"{hero.name} is now your active hero!",
        "hero_id":  hero_id,
        "hero_name": hero.name,
    }


# ─── Get Hero by Subject ──────────────────────────────────
@router.get("/subject/{subject}")
def get_hero_by_subject(subject: str, conn=Depends(get_db)):
    repo = HeroRepository(conn)
    hero = repo.get_by_subject(subject)

    if not hero:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No hero found for subject: {subject}"
        )

    return {
        "id":           hero.id,
        "name":         hero.name,
        "subject":      hero.subject,
        "attack_power": hero.attack_power,
        "defense":      hero.defense,
        "max_hp":       hero.max_hp,
        "skill_name":   hero.skill_name,
        "sprite_key":   hero.sprite_key,
    }


# ─── Seed Default Heroes ──────────────────────────────────
@router.post("/seed")
def seed_heroes(conn=Depends(get_db)):
    repo = HeroRepository(conn)
    repo.seed_default_heroes()
    return {"message": "Heroes seeded successfully!"}