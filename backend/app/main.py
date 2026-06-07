from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config.database import Base, engine
from app.api.v1.router import api_router
# Import all models so SQLAlchemy registers them before create_all
from app.models import password_reset_token as _  # noqa: F401
from app.config.settings import get_settings
from app.middleware.security import SecurityHeadersMiddleware
import logging
import traceback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crée les tables manquantes sans toucher aux tables existantes.
# Nécessaire si la DB a été recréée (Render free tier expire après 90j).
# Alembic gère les migrations incrémentales, mais ne crée pas les tables initiales.
Base.metadata.create_all(bind=engine)

_settings = get_settings()

app = FastAPI(
    title="Laboratoire Examens API",
    description="API pour gérer les examens de laboratoire",
    version="1.0.0"
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Expose le traceback complet pour faciliter le debug en production."""
    tb = traceback.format_exc()
    logger.error("[500] %s %s\n%s", request.method, request.url.path, tb)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": tb},
    )


@app.on_event("startup")
def migrate_legacy_roles():
    """Corrige les rôles 'USER' hérités (valeur obsolète) en 'DOCTOR' pour éviter LookupError."""
    try:
        from sqlalchemy import text
        from app.config.database import SessionLocal
        with SessionLocal() as db:
            result = db.execute(
                text("UPDATE users SET role='DOCTOR' WHERE role='USER'")
            )
            if result.rowcount:
                db.commit()
                logger.info(
                    "[STARTUP] %d utilisateur(s) avec rôle 'USER' migré(s) vers 'DOCTOR'",
                    result.rowcount
                )
    except Exception as exc:
        logger.warning("[STARTUP] Migration rôles échouée (non bloquante): %s", exc)


@app.get("/")
def root():
    return {"message": "Bienvenue à l'API Laboratoire Examens", "docs": "/docs", "redoc": "/redoc"}


@app.get("/health")
def health():
    return {"status": "OK"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
