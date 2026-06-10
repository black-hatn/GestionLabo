from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "Laboratoire Examens API"
    API_PREFIX: str = "/api/v1"
    DEBUG: bool = False

    SECRET_KEY: str = Field(
        ...
    )  # OBLIGATOIRE — définir dans .env, aucune valeur par défaut
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    DATABASE_URL: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/laboratoire_examens"
    )
    DATABASE_URL_SQLITE: str = "sqlite:///./laboratoire_examens.db"
    USE_SQLITE_DEV: bool = True

    CORS_ORIGINS: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "https://novabio-labo-black-hatns-projects.vercel.app",
            "https://novabio-labo.vercel.app",
        ]
    )

    # ATTENTION : changer ces credentials par défaut avant tout déploiement en production
    ADMIN_EMAIL: str = Field(default="admin@novabiolog.lab")
    ADMIN_PASSWORD: str = Field(default="ChangeMe123!")

    ENVIRONMENT: str = Field(default="development")

    SMTP_HOST: str = Field(default="smtp.gmail.com")
    SMTP_PORT: int = Field(default=587)
    SMTP_USER: Optional[str] = Field(default=None)
    SMTP_PASSWORD: Optional[str] = Field(default=None)
    SMTP_FROM: Optional[str] = Field(default=None)
    SMTP_ENABLED: bool = Field(default=False)


@lru_cache
def get_settings() -> Settings:
    return Settings()
