# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import create_tables
from .routers import auth, heroes, battle, leaderboard, ai_tutor


from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="EduRPG API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(heroes.router)
app.include_router(battle.router)
app.include_router(leaderboard.router)
app.include_router(ai_tutor.router)

from .routers import multiplayer

app.include_router(multiplayer.router)

# Also run multiplayer table creation on startup
@app.on_event("startup")
def startup():
    create_tables()
    from .database import get_connection
    from .models.hero    import HeroRepository
    from .models.monster import MonsterRepository
    from .models.multiplayer import MultiplayerRepository
    conn = get_connection()
    HeroRepository(conn).seed_default_heroes()
    MonsterRepository(conn).seed_default_monsters()
    MultiplayerRepository(conn).create_tables()   # ← add this
    conn.close()

@app.get("/")
def checkapi():
    return{
        "Status":"working"
    }

@app.get("/health")
def health():
    return {
        "status":   "ok",
        "version":  "2.0.0",
        "database": "Turso",
        "ai":       "Gemini"
    }
