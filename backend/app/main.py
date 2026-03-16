# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .database import create_tables, get_connection
from .routers import auth, heroes, battle, leaderboard, ai_tutor, multiplayer
from .routers.clan import router as clan_router


# ── Startup / Shutdown ────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create all tables on startup
    create_tables()

    # Create answer_attempts table (security — prevents replay attacks)
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS answer_attempts (
            session_id  TEXT NOT NULL,
            question_id TEXT NOT NULL,
            answered_at TEXT NOT NULL,
            PRIMARY KEY (session_id, question_id)
        )
    """)

    # Create clan tables
    from .models.clan import ClanRepository
    ClanRepository(conn).create_tables()

    # Seed heroes and monsters
    from .models.hero    import HeroRepository
    from .models.monster import MonsterRepository
    HeroRepository(conn).seed_default_heroes()
    MonsterRepository(conn).seed_default_monsters()

    # End expired wars
    try:
        ClanRepository(conn).end_expired_wars()
    except Exception:
        pass

    print("✅ All tables created and seeded successfully!")
    yield


# ── FastAPI App ───────────────────────────────────────────────────────
app = FastAPI(
    title="EduRPG API",
    version="3.0.0",
    description="AI-powered gamified education platform with clans and multiplayer",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(heroes.router)
app.include_router(battle.router)
app.include_router(leaderboard.router)
app.include_router(ai_tutor.router)
app.include_router(multiplayer.router)
app.include_router(clan_router)

# ── Health Check ──────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status":  "ok",
        "version": "3.0.0",
        "app":     settings.APP_NAME,
    }

@app.get("/")
def root():
    return {
        "message": "⚔️ EduRPG API v3 — Learn. Battle. Conquer.",
        "docs":    "/docs",
    }
