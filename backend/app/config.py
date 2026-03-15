from pydantic_settings import BaseSettings
from typing import Optional, List


class Settings(BaseSettings):

    # Database
    TURSO_DATABASE_URL: str
    TURSO_AUTH_TOKEN: str

    # AI
    HUGGINGFACE_API_KEY: str

    # Auth
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 10080

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]

    # App
    APP_NAME: str = "EduRPG"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = True

    # Redis
    REDIS_URL: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()