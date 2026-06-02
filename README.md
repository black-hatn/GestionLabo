# NovaBio Lab Platform

[![Statut](https://img.shields.io/badge/statut-en%20production-brightgreen)](https://novabio-labo.vercel.app)
[![Frontend](https://img.shields.io/badge/frontend-Vercel-black)](https://novabio-labo.vercel.app)
[![Backend](https://img.shields.io/badge/backend-Render-46E3B7)](https://gestionlabo.onrender.com)
[![Licence](https://img.shields.io/badge/licence-MIT-blue)](LICENSE)

Plateforme complète de gestion de laboratoire médical, développée avec Next.js 14 et FastAPI. Permet de gérer les patients, les demandes d'examens, les résultats biologiques, la facturation et les paiements — avec un système de rôles et un journal d'audit.

**Lien production :** https://novabio-labo.vercel.app

---

## Fonctionnalités

### Gestion médicale
- **Patients** — Création, recherche, historique complet des dossiers
- **Catalogue d'analyses** — Référentiel des examens avec valeurs de référence
- **Demandes d'examens** — Suivi du cycle de vie (en attente → prélevé → analysé → validé)
- **Résultats biologiques** — Saisie, validation et détection automatique des résultats critiques
- **Facturation** — Génération de factures PDF, suivi des paiements
- **Analytique** — Tableau de bord avec indicateurs clés et séries temporelles

### Sécurité
- Authentification JWT (access token + refresh token)
- Double authentification par email (OTP)
- Contrôle d'accès par rôle (RBAC) — 5 rôles distincts
- Journal d'audit complet sur toutes les actions sensibles
- CORS, rate limiting, protection OWASP

### Interface
- Thème clair / sombre (persisté localement)
- Responsive — adapté desktop et tablette
- Recherche globale dans la barre de navigation
- Notifications en temps réel pour les résultats critiques

---

## Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| `ADMIN` | Accès complet — gestion des utilisateurs, journal d'audit, configuration |
| `RECEPTIONIST` | Patients, demandes d'examens, facturation |
| `COLLECTOR` | Patients, demandes d'examens (prélèvements) |
| `LAB_TECH` | Demandes d'examens, saisie des résultats |
| `DOCTOR` | Consultation des résultats et dossiers patients |

---

## Stack technique

**Frontend**
- [Next.js 14](https://nextjs.org) — App Router, TypeScript
- [Tailwind CSS](https://tailwindcss.com) — avec variables CSS pour le thème
- [Zustand](https://zustand-demo.pmnd.rs) — état global (auth, toast)
- [TanStack Query](https://tanstack.com/query) — gestion des requêtes et cache
- [next-themes](https://github.com/pacocoursey/next-themes) — thème clair/sombre
- [Recharts](https://recharts.org) — graphiques analytiques
- [@react-pdf/renderer](https://react-pdf.org) — génération de PDF côté client

**Backend**
- [FastAPI](https://fastapi.tiangolo.com) — Python 3.11+
- [SQLAlchemy 2.0](https://www.sqlalchemy.org) — ORM async
- [Alembic](https://alembic.sqlalchemy.org) — migrations de base de données
- [PostgreSQL](https://www.postgresql.org) — base de données (hébergée sur [Neon](https://neon.tech))
- [Pydantic v2](https://docs.pydantic.dev) — validation des données
- [Python-jose](https://github.com/mpdavis/python-jose) + [Passlib](https://passlib.readthedocs.io) — authentification JWT

**Déploiement**
- Frontend → [Vercel](https://vercel.com) (déploiement automatique depuis GitHub)
- Backend → [Render](https://render.com) (plan gratuit)
- Base de données → [Neon](https://neon.tech) (PostgreSQL serverless)

---

## Architecture

```
┌──────────────────────┐        ┌──────────────────────┐        ┌──────────────────┐
│   Frontend (Vercel)  │◄──────►│   Backend (Render)   │◄──────►│   DB (Neon)      │
│   Next.js 14 / TS    │  REST  │   FastAPI / Python   │  SQL   │   PostgreSQL      │
│   novabio-labo.vercel│        │   gestionlabo.onrender│        │   neon.tech       │
└──────────────────────┘        └──────────────────────┘        └──────────────────┘
```

```
laboratoire-examens/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Routes FastAPI (auth, patients, exams, results…)
│   │   ├── models/             # Modèles SQLAlchemy
│   │   ├── schemas/            # Schémas Pydantic
│   │   ├── services/           # Logique métier
│   │   └── utils/              # Email, PDF, 2FA
│   ├── alembic/                # Migrations DB
│   └── requirements.txt
└── frontend/
    ├── app/                    # Pages Next.js (App Router)
    │   └── dashboard/          # Tableau de bord (patients, examens, résultats…)
    ├── components/             # Composants réutilisables
    ├── lib/                    # Stores Zustand, utilitaires, permissions
    ├── services/api/           # Clients API (axios)
    └── public/
```

---

## Installation locale

### Prérequis

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (ou compte [Neon](https://neon.tech) gratuit)

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate
pip install -r requirements.txt

# Créer le fichier de configuration
cp .env.example .env
# Renseigner DATABASE_URL, SECRET_KEY, SMTP_*, etc.

# Appliquer les migrations
alembic upgrade head

# Créer le compte administrateur
curl -X POST http://localhost:8000/api/v1/auth/seed

# Lancer le serveur
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install

# Créer le fichier de configuration
cp .env.local.example .env.local
# Renseigner NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Lancer le serveur de développement
npm run dev
```

### Accès local

| Service | URL |
|---------|-----|
| Application | http://localhost:3000 |
| API Backend | http://localhost:8000 |
| Documentation API (Swagger) | http://localhost:8000/docs |

---

## Variables d'environnement

### Backend (`.env`)

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL | `postgresql+asyncpg://user:pass@host/db` |
| `SECRET_KEY` | Clé secrète JWT | chaîne aléatoire 64 caractères |
| `ADMIN_EMAIL` | Email admin initial | `admin@exemple.com` |
| `ADMIN_PASSWORD` | Mot de passe admin | mot de passe fort |
| `SMTP_HOST` | Serveur email | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | adresse Gmail |
| `SMTP_PASSWORD` | Mot de passe SMTP | mot de passe d'application |
| `CORS_ORIGINS` | Origines autorisées | `https://novabio-labo.vercel.app` |

### Frontend (`.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | URL de base de l'API backend |

---

## Commandes utiles

**Backend**
```bash
# Tests
pytest
pytest --cov=app

# Qualité du code
flake8 app/
black app/

# Nouvelle migration
alembic revision --autogenerate -m "description"
alembic upgrade head
```

**Frontend**
```bash
npm run dev        # Développement
npm run build      # Build production
npm run lint       # Vérification ESLint
npm run type-check # Vérification TypeScript
```

---

## Déploiement

Le déploiement est entièrement automatisé depuis GitHub :

- Chaque `push` sur `main` déclenche un build Vercel (frontend)
- Le backend est déployé manuellement sur Render via l'interface web ou l'API

> **Note :** Le backend Render (plan gratuit) se met en veille après 15 minutes d'inactivité. Un cron Vercel ping le backend quotidiennement pour limiter les démarrages à froid.

---

## Auteur

**Nouradine Zakaria Mahamat**

---

*Développé dans le cadre du cours de Génie Logiciel.*
