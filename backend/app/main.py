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
Base.metadata.create_all(bind=engine)

# Migrations idempotentes (ADD COLUMN si absent, etc.)
try:
    import migrate as _migrate
    _migrate.run()
except Exception as _mig_exc:
    logger.warning("[STARTUP] migrate.run() échoué (non bloquant): %s", _mig_exc)

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


@app.get("/debug/test-db")
def debug_test_db():
    """Endpoint de diagnostic — teste la connexion DB et les tables. À retirer après debug."""
    import traceback as tb_module
    results = {}
    from app.config.database import SessionLocal
    from sqlalchemy import text, inspect
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
                    results["audit_logs_count"] = db.execute(text("SELECT COUNT(*) FROM audit_logs")).scalar()
                    results["audit_logs_sample"] = [
                        dict(r._mapping) for r in db.execute(text("SELECT id, action, resource_type, status, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 3")).fetchall()
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
