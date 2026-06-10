import logging
import traceback
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.config.database import Base, engine
from app.config.settings import get_settings
from app.middleware.security import SecurityHeadersMiddleware

# Import all models so SQLAlchemy registers them before create_all
from app.models import password_reset_token as _  # noqa: F401

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Migrations idempotentes (ADD COLUMN si absent, etc.)
try:
    import migrate as _migrate

    _migrate.run()
except Exception as _mig_exc:
    logger.warning("[STARTUP] migrate.run() échoué (non bloquant): %s", _mig_exc)

_settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Cycle de vie de l'application FastAPI."""
    # Crée les tables manquantes sans toucher aux tables existantes.
    Base.metadata.create_all(bind=engine)

    # Corrige les rôles 'USER' hérités (valeur obsolète) en 'DOCTOR' pour éviter LookupError.
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
                    result.rowcount,
                )
    except Exception as exc:
        logger.warning("[STARTUP] Migration rôles échouée (non bloquante): %s", exc)
    yield


app = FastAPI(
    title="Laboratoire Examens API",
    description="API pour gérer les examens de laboratoire",
    version="1.0.0",
    lifespan=lifespan,
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
    """Handler global d'exceptions non gérées.
    En production : retourne un message générique pour ne pas exposer la structure interne.
    En développement : inclut le traceback pour faciliter le debug.
    """
    tb = traceback.format_exc()
    logger.error("[500] %s %s\n%s", request.method, request.url.path, tb)
    if _settings.ENVIRONMENT == "production":
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Erreur interne du serveur. Veuillez contacter l'administrateur."
            },
        )
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": tb},
    )


@app.get("/")
def root():
    return {
        "message": "Bienvenue à l'API Laboratoire Examens",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health():
    return {"status": "OK"}


@app.get("/debug/test-db")
def debug_test_db(
    current_user: object = Depends(
        __import__("app.api.deps", fromlist=["require_roles"]).require_roles(
            __import__("app.models.user", fromlist=["UserRole"]).UserRole.ADMIN
        )
    ),
):
    """Endpoint de diagnostic — ADMIN uniquement, désactivé en production."""
    if _settings.ENVIRONMENT == "production":
        from fastapi import HTTPException

        raise HTTPException(
            status_code=403, detail="Endpoint de diagnostic désactivé en production"
        )
    import traceback as tb_module

    results = {}
    from sqlalchemy import inspect, text

    from app.config.database import SessionLocal

    try:
        with SessionLocal() as db:
            # 1. Test connexion
            db.execute(text("SELECT 1"))
            results["connexion"] = "OK"
            # 2. Liste des tables
            inspector = inspect(engine)
            results["tables"] = inspector.get_table_names()
            # 3. Test COUNT factures
            try:
                count = db.execute(text("SELECT COUNT(*) FROM invoices")).scalar()
                results["factures_count"] = count
            except Exception as e:
                results["factures_error"] = str(e)
            # 4. Colonnes de invoices et audit_logs
            if "invoices" in results.get("tables", []):
                results["invoices_columns"] = [
                    c["name"] for c in inspector.get_columns("invoices")
                ]
            if "audit_logs" in results.get("tables", []):
                results["audit_logs_columns"] = [
                    c["name"] for c in inspector.get_columns("audit_logs")
                ]
                try:
                    results["audit_logs_count"] = db.execute(
                        text("SELECT COUNT(*) FROM audit_logs")
                    ).scalar()
                    results["audit_logs_sample"] = [
                        dict(r._mapping)
                        for r in db.execute(
                            text(
                                "SELECT id, action, resource_type, status, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 3"
                            )
                        ).fetchall()
                    ]
                except Exception as e:
                    results["audit_logs_error"] = str(e)
            # 5. Test COUNT patients
            try:
                count = db.execute(text("SELECT COUNT(*) FROM patients")).scalar()
                results["patients_count"] = count
            except Exception as e:
                results["patients_error"] = str(e)
    except Exception as e:
        results["connexion_error"] = str(e)
        results["traceback"] = tb_module.format_exc()
    return results


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
