from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import Base, engine
from app.api.v1.router import api_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Créer toutes les tables au démarrage
try:
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Tables créées avec succès")
except Exception as e:
    logger.error(f"❌ Erreur création tables: {e}")

app = FastAPI(
    title="Laboratoire Examens API",
    description="API pour gérer les examens de laboratoire",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Bienvenue à l'API Laboratoire Examens", "docs": "/docs", "redoc": "/redoc"}

@app.get("/health")
def health():
    return {"status": "OK"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
