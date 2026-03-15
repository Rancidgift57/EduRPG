from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from ..database import get_db
from ..auth import (
    hash_password, verify_password,
    create_access_token, get_current_user
)
from ..models.user import UserRepository

router = APIRouter(prefix="/auth", tags=["Auth"])


class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


# ─── Register ─────────────────────────────────────────────
@router.post("/register")
def register(data: RegisterRequest, conn=Depends(get_db)):
    repo = UserRepository(conn)

    if repo.get_by_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    if repo.get_by_username(data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    user = repo.create(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password)
    )

    token = create_access_token(user.id, user.username)

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user_id":      user.id,
        "username":     user.username,
        "level":        user.level,
        "xp":           user.xp,
    }


# ─── Login ────────────────────────────────────────────────
@router.post("/login")
def login(data: LoginRequest, conn=Depends(get_db)):
    repo = UserRepository(conn)
    user = repo.get_by_email(data.email)

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Update streak
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    streak = user.streak

    if user.last_login:
        last_dt = datetime.fromisoformat(user.last_login)
        diff = (now.date() - last_dt.date()).days
        if diff == 1:
            streak += 1
        elif diff > 1:
            streak = 1

    repo.update_streak(user.id, streak, now.isoformat())

    token = create_access_token(user.id, user.username)

    return {
        "access_token": token,
        "token_type":   "bearer",
        "user_id":      user.id,
        "username":     user.username,
        "level":        user.level,
        "xp":           user.xp,
        "streak":       streak,
    }


# ─── Get Current User ─────────────────────────────────────
@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user


# ─── Get User Profile ─────────────────────────────────────
@router.get("/profile/{user_id}")
def get_profile(user_id: str, conn=Depends(get_db)):
    repo = UserRepository(conn)
    user = repo.get_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return {
        "id":         user.id,
        "username":   user.username,
        "xp":         user.xp,
        "level":      user.level,
        "streak":     user.streak,
        "created_at": user.created_at,
    }


# ─── Get XP Log ───────────────────────────────────────────
@router.get("/xp-log")
def get_xp_log(
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    repo = UserRepository(conn)
    return repo.get_xp_log(current_user["id"])