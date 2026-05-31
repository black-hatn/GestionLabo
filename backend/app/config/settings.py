from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Laboratoire Examens API"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = True

    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480   # 8 heures
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/laboratoire_examens"
    DATABASE_URL_SQLITE: str = "sqlite:///./laboratoire_examens.db"
    USE_SQLITE_DEV: bool = True

    CORS_ORIGINS: list[str] = Field(default_factory=lambda: ["http://localhost:3000"])


@lru_cache
def get_settings() -> Settings:
    return Settings()
