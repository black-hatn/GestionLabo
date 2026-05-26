"""Point d'entrée FastAPI"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.config.database import engine, Base
from app.api.routes import auth, patient, examen, demande, resultat, medecin

# Créer les tables
Base.metadata.create_all(bind=engine)

# Créer l'application
app = FastAPI(
    title="Gestion des examens de laboratoire",
    description="API pour la gestion des examens de laboratoire",
    version="1.0.0"
)

# Ajouter CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(auth.router)
app.include_router(patient.router)
app.include_router(examen.router)
app.include_router(demande.router)
app.include_router(resultat.router)
app.include_router(medecin.router)


@app.get("/")
def read_root():
    """Route de bienvenue"""
    return {"message": "Bienvenue sur l'API Laboratoire"}


@app.get("/health")
def health_check():
    """Health check"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )
