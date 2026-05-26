# Backend FastAPI — Gestion des examens de laboratoire

## 🚀 Démarrage rapide

### Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration

```bash
cp .env.example .env
# Éditer .env avec tes paramètres (DATABASE_URL, SECRET_KEY, etc.)
```

### Démarrer le serveur

```bash
python -m uvicorn app.main:app --reload
```

L'API sera disponible sur : **http://localhost:8000**

### Documentation interactive

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 📁 Structure

```
app/
├── config/          # Configuration (settings, BD, sécurité)
├── models/          # Modèles SQLAlchemy
├── schemas/         # Schémas Pydantic (validation)
├── services/        # Logique métier
├── repositories/    # Accès données
├── api/routes/      # Endpoints REST
├── middleware/      # Middleware
├── utils/           # Utilitaires
└── main.py          # Point d'entrée
```

## 🔐 Authentification

Pour accéder aux routes protégées, inclure le header :
```
Authorization: Bearer <token>
```

### Login

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifiant":"admin","mot_de_passe":"password"}'
```

Réponse :
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user_id": 1,
  "role": "admin"
}
```

## 📚 Endpoints disponibles

### Auth
- `POST /auth/login` — Se connecter
- `POST /auth/logout` — Se déconnecter

### À implémenter
- CRUD Patients
- CRUD Demandes d'examen
- Gestion Résultats
- Gestion Bulletins
- Gestion Factures
- Statistiques

## ✅ Tests

```bash
pytest tests/ -v --cov
```

## 🔧 Commandes utiles

```bash
# Formater le code
black app/

# Linting
flake8 app/

# Migrations BD
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## 📖 Documentation complète

Voir `../docs/` pour la documentation détaillée.
