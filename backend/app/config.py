from __future__ import annotations
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/giftcards"

    secret_key: str = "change-me-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    encryption_key: str = "change-me-generate-with-fernet"

    anthropic_api_key: str = ""

    environment: str = "development"
    cors_origins: List[str] = ["http://localhost:8081", "http://localhost:3000", "exp://localhost:8081"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
