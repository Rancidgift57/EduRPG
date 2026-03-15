import bcrypt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
import uuid

from .config import settings
from .database import get_db

# ─── Setup ────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ─── Schemas ──────────────────────────────────────────────
class TokenData(BaseModel):
    user_id: str
    username: str


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    username: str
    level: int
    xp: int


# ─── Password Helpers (pure bcrypt, no passlib) ───────────
def hash_password(password: str) -> str:
    # Truncate to 72 bytes — bcrypt hard limit
    password_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        plain_bytes   = plain.encode("utf-8")[:72]
        hashed_bytes  = hashed.encode("utf-8")
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except Exception:
        return False


# ─── JWT Helpers ──────────────────────────────────────────
def create_access_token(user_id: str, username: str) -> str:
    expire = datetime.utcnow() + timedelta(
        minutes=settings.JWT_EXPIRE_MINUTES
    )
    payload = {
        "sub":      user_id,
        "username": username,
        "exp":      expire,
    }
    return jwt.encode(
        payload,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM
    )


def decode_token(token: str) -> TokenData:
    try:
        payload  = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id:  str = payload.get("sub")
        username: str = payload.get("username")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return TokenData(user_id=user_id, username=username)

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ─── Dependency — get current user ───────────────────────
def get_current_user(
    token: str = Depends(oauth2_scheme),
    conn=Depends(get_db)
) -> dict:
    token_data = decode_token(token)

    result = conn.execute(
        "SELECT * FROM users WHERE id = ? AND is_active = 1",
        [token_data.user_id]
    )
    rows = result.rows
    if not rows:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or deactivated"
        )

    user = rows[0]
    return {
        "id":       user[0],
        "username": user[1],
        "email":    user[2],
        "xp":       user[4],
        "level":    user[5],
        "streak":   user[6],
    }