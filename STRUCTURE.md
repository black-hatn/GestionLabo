# Structure complète du projet — Gestion des examens de laboratoire (Vue.js 3)

## 🎯 Vue d'ensemble

Le projet suit une architecture **3-tiers** avec séparation claire entre :
- **Frontend** : Application Vue.js 3 (SPA moderne)
- **Backend** : API REST FastAPI (Python)
- **Database** : PostgreSQL (données relationnelles)

---

## 📁 Structure des dossiers

```
laboratoire-examens/
│
├── 📱 frontend/                        # Application Vue.js 3
│   ├── src/
│   │   ├── main.js                    # Point d'entrée
│   │   ├── App.vue                    # Composant racine
│   │   │
│   │   ├── components/                # Composants réutilisables
│   │   │   ├── common/
│   │   │   │   ├── Navbar.vue         # Barre de navigation
│   │   │   │   ├── Sidebar.vue        # Menu latéral
│   │   │   │   ├── Footer.vue
│   │   │   │   ├── LoadingSpinner.vue
│   │   │   │   └── ErrorDialog.vue
│   │   │   │
│   │   │   ├── patient/
│   │   │   │   ├── PatientCard.vue
│   │   │   │   ├── PatientForm.vue
│   │   │   │   └── PatientSearch.vue
│   │   │   │
│   │   │   ├── demande/
│   │   │   │   ├── DemandeForm.vue
│   │   │   │   ├── ExamenListTile.vue
│   │   │   │   └── DemandeCard.vue
│   │   │   │
│   │   │   ├── resultat/
│   │   │   │   ├── ResultatInput.vue
│   │   │   │   ├── ValidationCard.vue
│   │   │   │   └── ResultatDisplay.vue
│   │   │   │
│   │   │   └── bulletin/
│   │   │       ├── BulletinPreview.vue
│   │   │       └── BulletinDownload.vue
│   │   │
│   │   ├── views/                     # Pages / Écrans
│   │   │   ├── auth/
│   │   │   │   ├── LoginView.vue
│   │   │   │   └── LogoutView.vue
│   │   │   │
│   │   │   ├── home/
│   │   │   │   └── DashboardView.vue  # Tableau de bord par rôle
│   │   │   │
│   │   │   ├── patient/
│   │   │   │   ├── PatientListView.vue
│   │   │   │   ├── PatientDetailView.vue
│   │   │   │   └── PatientCreateView.vue
│   │   │   │
│   │   │   ├── demande/
│   │   │   │   ├── DemandeListView.vue
│   │   │   │   ├── DemandeCreateView.vue
│   │   │   │   └── DemandeDetailView.vue
│   │   │   │
│   │   │   ├── prelevement/
│   │   │   │   └── PrelevementFormView.vue
│   │   │   │
│   │   │   ├── resultat/
│   │   │   │   ├── ResultatSaisieView.vue
│   │   │   │   └── ResultatValidationView.vue
│   │   │   │
│   │   │   ├── bulletin/
│   │   │   │   └── BulletinPreviewView.vue
│   │   │   │
│   │   │   ├── facture/
│   │   │   │   ├── FactureListView.vue
│   │   │   │   └── FactureDetailView.vue
│   │   │   │
│   │   │   ├── statistiques/
│   │   │   │   └── StatsDashboardView.vue
│   │   │   │
│   │   │   └── admin/
│   │   │       ├── UserManagementView.vue
│   │   │       └── CatalogManagementView.vue
│   │   │
│   │   ├── services/                  # Communication API
│   │   │   ├── api.js                 # Client HTTP (axios)
│   │   │   ├── authService.js         # Authentification
│   │   │   ├── patientService.js      # CRUD patients
│   │   │   ├── demandeService.js      # Gestion demandes
│   │   │   ├── examenService.js       # Catalogue examens
│   │   │   ├── resultatService.js     # Gestion résultats
│   │   │   ├── bulletinService.js     # Téléchargement bulletins
│   │   │   ├── factureService.js      # Factures + paiements
│   │   │   └── statService.js         # Statistiques
│   │   │
│   │   ├── stores/                    # État global (Pinia)
│   │   │   ├── auth.js                # État authentification
│   │   │   ├── patient.js             # État patients
│   │   │   ├── demande.js             # État demandes
│   │   │   ├── examen.js              # Cache catalogue
│   │   │   ├── resultat.js            # État résultats
│   │   │   ├── notification.js        # Notifications
│   │   │   └── ui.js                  # État UI (theme, sidebar, etc)
│   │   │
│   │   ├── router/
│   │   │   └── index.js               # Vue Router config
│   │   │       - Définir toutes les routes
│   │   │       - Middlewares (protégées par auth)
│   │   │       - Redirections par rôle
│   │   │
│   │   ├── styles/
│   │   │   ├── main.css               # Styles globaux
│   │   │   ├── variables.css          # Variables CSS (couleurs, spacing)
│   │   │   ├── components.css         # Styles composants
│   │   │   └── responsive.css         # Breakpoints mobile/tablet
│   │   │
│   │   ├── utils/
│   │   │   ├── dateUtils.js           # Formatage dates
│   │   │   ├── currencyUtils.js       # Formatage monnaie
│   │   │   ├── validators.js          # Validation formulaires
│   │   │   ├── storage.js             # localStorage (tokens)
│   │   │   └── logger.js              # Logging
│   │   │
│   │   └── assets/
│   │       ├── images/
│   │       ├── icons/
│   │       └── fonts/
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── services.spec.js
│   │   │   ├── stores.spec.js
│   │   │   └── utils.spec.js
│   │   │
│   │   └── e2e/
│   │       └── main.spec.js
│   │
│   ├── package.json                   # Dépendances Vue.js
│   ├── package-lock.json
│   ├── vite.config.js                 # Configuration Vite
│   ├── .env.example                   # Template variables d'env
│   ├── .eslintrc.cjs                  # Linting config
│   ├── .prettierrc                    # Formatting config
│   └── README.md
│
├── 🔌 backend/                         # API FastAPI (Python) — IDENTIQUE
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # Point d'entrée FastAPI
│   │   │
│   │   ├── config/
│   │   │   ├── __init__.py
│   │   │   ├── settings.py            # Variables d'environnement
│   │   │   ├── database.py            # Configuration SQLAlchemy
│   │   │   └── security.py            # Config JWT, hash passwords
│   │   │
│   │   ├── models/                    # Modèles SQLAlchemy (ORM)
│   │   │   ├── __init__.py
│   │   │   ├── user.py                # Table UTILISATEUR
│   │   │   ├── role.py                # Table ROLE
│   │   │   ├── patient.py             # Table PATIENT
│   │   │   ├── medecin.py             # Table MEDECIN
│   │   │   ├── demande_examen.py      # Table DEMANDE_EXAMEN
│   │   │   ├── examen.py              # Table EXAMEN
│   │   │   ├── categorie.py           # Table CATEGORIE
│   │   │   ├── val_reference.py       # Table VAL_REFERENCE
│   │   │   ├── ligne_demande.py       # Table LIGNE_DEMANDE
│   │   │   ├── prelevement.py         # Table PRELEVEMENT
│   │   │   ├── resultat.py            # Table RESULTAT
│   │   │   ├── facture.py             # Table FACTURE
│   │   │   ├── paiement.py            # Table PAIEMENT
│   │   │   └── bulletin.py            # Table BULLETIN
│   │   │
│   │   ├── schemas/                   # Pydantic schemas (validation + sérialisation)
│   │   │   ├── __init__.py
│   │   │   ├── user.py                # Schéma User
│   │   │   ├── patient.py
│   │   │   ├── demande_examen.py
│   │   │   ├── examen.py
│   │   │   ├── resultat.py
│   │   │   ├── facture.py
│   │   │   ├── paiement.py
│   │   │   ├── bulletin.py
│   │   │   └── auth.py                # Token, TokenResponse
│   │   │
│   │   ├── services/                  # Logique métier
│   │   │   ├── __init__.py
│   │   │   ├── user_service.py        # CRUD + activation/désactivation
│   │   │   ├── patient_service.py     # CRUD patients
│   │   │   ├── demande_service.py     # Création, suivi demandes
│   │   │   ├── examen_service.py      # Gestion catalogue
│   │   │   ├── resultat_service.py    # Saisie + validation résultats
│   │   │   ├── facture_service.py     # Génération factures
│   │   │   ├── paiement_service.py    # Enregistrement paiements
│   │   │   ├── bulletin_service.py    # Génération PDF
│   │   │   ├── auth_service.py        # Authentification + JWT
│   │   │   └── stat_service.py        # Statistiques
│   │   │
│   │   ├── repositories/              # Accès données (couche d'abstraction)
│   │   │   ├── __init__.py
│   │   │   ├── base_repository.py     # CRUD générique
│   │   │   ├── user_repository.py
│   │   │   ├── patient_repository.py
│   │   │   ├── demande_repository.py
│   │   │   └── ...
│   │   │
│   │   ├── api/routes/                # Endpoints (contrôleurs)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                # POST /auth/login, /auth/logout
│   │   │   ├── users.py               # CRUD /users
│   │   │   ├── patients.py            # CRUD /patients
│   │   │   ├── demandes.py            # CRUD /demandes_examen
│   │   │   ├── examens.py             # GET /examens (catalogue)
│   │   │   ├── prelevements.py        # POST /prelevements
│   │   │   ├── resultats.py           # POST/PUT /resultats
│   │   │   ├── bulletins.py           # POST /bulletins/generer
│   │   │   ├── factures.py            # GET/POST /factures
│   │   │   ├── paiements.py           # POST /paiements
│   │   │   └── statistiques.py        # GET /stats
│   │   │
│   │   ├── middleware/                # Middleware
│   │   │   ├── __init__.py
│   │   │   ├── auth_middleware.py     # JWT validation
│   │   │   ├── error_handler.py       # Global exception handler
│   │   │   ├── cors_middleware.py     # CORS config
│   │   │   └── logging_middleware.py  # Request/response logging
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── exceptions.py          # Exceptions personnalisées
│   │   │   ├── jwt_handler.py         # Génération/validation JWT
│   │   │   ├── password_hash.py       # Hachage bcrypt
│   │   │   ├── pdf_generator.py       # Génération bulletins PDF
│   │   │   ├── validators.py          # Validation métier
│   │   │   └── logger.py              # Logging
│   │   │
│   │   └── __init__.py
│   │
│   ├── alembic/                       # Migrations base de données
│   │   ├── versions/                  # Fichiers de migration
│   │   │   ├── 001_initial_schema.py
│   │   │   └── ...
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── alembic.ini
│   │
│   ├── tests/                         # Tests
│   │   ├── __init__.py
│   │   ├── conftest.py                # Fixtures pytest
│   │   ├── test_auth.py
│   │   ├── test_patients.py
│   │   ├── test_demandes.py
│   │   ├── test_resultats.py
│   │   └── test_api.py
│   │
│   ├── scripts/
│   │   ├── init_db.py                 # Initialiser la BD
│   │   ├── seed_data.py               # Données de test
│   │   └── backup_db.py               # Sauvegarde BD
│   │
│   ├── requirements.txt                # Dépendances Python
│   ├── requirements-dev.txt            # Dépendances développement
│   ├── .env.example                    # Template variables d'env
│   ├── .env                            # Variables d'environnement (NE PAS COMMITER)
│   ├── docker/
│   │   ├── Dockerfile                  # Image Docker
│   │   └── docker-compose.yml          # Orchestration (app + DB)
│   ├── alembic.ini                     # Config migrations
│   ├── pyproject.toml                  # Configuration Python moderne
│   ├── README.md
│   └── run.sh                          # Script démarrage
│
├── 📊 database/
│   ├── init_schema.sql                # Schéma SQL initial
│   ├── seed_data.sql                  # Données de test
│   ├── backups/                       # Répertoire backups
│   └── README.md
│
├── 📚 docs/
│   ├── API.md                         # Documentation API REST
│   ├── DATABASE.md                    # Schéma BD détaillé
│   ├── VUEJS.md                       # Guide Vue.js 3
│   ├── DEPLOYMENT.md                  # Guide déploiement
│   ├── ARCHITECTURE.md                # Explication architecture
│   └── DEVELOPMENT.md                 # Guide développement
│
├── .gitignore                         # Fichiers à ignorer Git
├── .github/
│   └── workflows/
│       ├── vuejs_test.yml             # Tests Vue.js CI
│       └── fastapi_test.yml           # Tests FastAPI CI
│
├── docker-compose.yml                 # Orchestration globale
├── README.md                          # README principal
└── STRUCTURE.md                       # Ce fichier

```

---

## 🚀 Instructions pour Claude Code

### **Phase 1 : Initialiser les projets**

```bash
# 1. Créer le répertoire racine
mkdir -p laboratoire-examens && cd laboratoire-examens

# 2. Initialiser Vue.js 3
npm create vite@latest frontend -- --template vue
cd frontend
npm install

# 3. Initialiser FastAPI
cd ../backend
python3 -m venv venv
source venv/bin/activate  # ou: venv\Scripts\activate sur Windows
pip install -r requirements.txt
```

---

## 📦 Dépendances

### **package.json (Vue.js)**

```json
{
  "name": "laboratoire-examen",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint . --ext .vue,.js",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "vue-router": "^4.2.0",
    "pinia": "^2.1.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@vue/test-utils": "^2.4.0",
    "eslint": "^8.54.0",
    "eslint-plugin-vue": "^9.17.0",
    "prettier": "^3.1.0"
  }
}
```

### **requirements.txt (FastAPI) — IDENTIQUE**

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
psycopg2-binary==2.9.9
PyPDF2==3.17.1
reportlab==4.0.7
python-dotenv==1.0.0
alembic==1.13.0
pytest==7.4.3
pytest-asyncio==0.21.1
pytest-cov==4.1.0
black==23.12.0
flake8==6.1.0
httpx==0.25.2
```

---

## 🔐 Fichier .env (Backend) — IDENTIQUE

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/laboratoire_db
SQLALCHEMY_ECHO=False

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# API
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]

# Fichiers
UPLOAD_DIR=./uploads
PDF_DIR=./pdfs

# Logs
LOG_LEVEL=INFO
```

---

## 📋 Scripts de démarrage

### **Backend : run.sh**

```bash
#!/bin/bash
set -e

echo "🔌 Démarrage Backend FastAPI..."

# Activer venv
source venv/bin/activate

# Variables d'env
export PYTHONUNBUFFERED=1

# Migrations BD
alembic upgrade head

# Démarrer serveur
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

echo "✅ Backend prêt sur http://localhost:8000"
echo "📚 Documentation: http://localhost:8000/docs"
```

### **Frontend : run.sh**

```bash
#!/bin/bash
echo "📱 Démarrage Frontend Vue.js..."
cd frontend
npm install
npm run dev
echo "✅ Frontend prêt sur http://localhost:5173"
```

---

## ✅ Commandes clés pour Claude Code

### **Backend (FastAPI)**

```bash
# Démarrer
python -m uvicorn app.main:app --reload

# Tests
pytest tests/ -v --cov

# Linting
flake8 app/
black app/

# Migrations BD
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

### **Frontend (Vue.js)**

```bash
# Démarrer dev server
npm run dev

# Installer dépendances
npm install

# Tests
npm test

# Build production
npm run build

# Linting
npm run lint
npm run format
```

---

## 📝 Étapes pour Claude Code

### **1️⃣ Créer les fichiers de configuration**

Priority: CRITIQUE

- [ ] Créer `frontend/package.json`
- [ ] Créer `frontend/vite.config.js`
- [ ] Créer `frontend/.env.example`
- [ ] Créer `backend/requirements.txt`
- [ ] Créer `backend/.env.example`

### **2️⃣ Modèles & Schémas**

Priority: HAUTE

**Backend :**
- [ ] `app/models/*.py` — Tous les 13 modèles SQLAlchemy

**Frontend :**
- [ ] Pas de modèles Dart, utiliser les types TypeScript/JSDoc si besoin

### **3️⃣ Services & Communication API**

Priority: HAUTE

**Backend :**
- [ ] `app/repositories/base_repository.py` — CRUD générique
- [ ] `app/services/*.py` — Logique métier (14 services)

**Frontend :**
- [ ] `src/services/api.js` — Client axios avec interceptors JWT
- [ ] `src/services/*.js` — Appels API (8 services)

### **4️⃣ API Routes & Endpoints**

Priority: HAUTE

**Backend :**
- [ ] `app/api/routes/*.py` — Tous les endpoints REST

### **5️⃣ Stores (État global)**

Priority: MOYENNE

**Frontend :**
- [ ] `src/stores/*.js` — Gestion d'état Pinia (6 stores)

### **6️⃣ Composants & Vues**

Priority: MOYENNE à BASSE

**Frontend :**
- [ ] `src/components/**/*.vue` — Tous les composants réutilisables
- [ ] `src/views/**/*.vue` — Toutes les pages

### **7️⃣ Tests**

Priority: BASSE

- [ ] Tests unitaires Backend
- [ ] Tests unitaires Frontend (Vitest)
- [ ] Tests E2E (Playwright/Cypress optionnel)

---

## 🎬 Ordre d'implémentation recommandé

### **Semaine 1 : Infrastructure & Authentification**

1. Initialiser projets
2. Configurer BD (PostgreSQL)
3. Modèles SQLAlchemy
4. Routes d'authentification
5. Middleware JWT
6. Store auth + Service auth (Vue.js)
7. LoginView (Vue.js)

### **Semaine 2 : CRUD patients & demandes**

8. Services patients + routes
9. PatientListView, PatientCreateView
10. Services demandes + routes
11. DemandeCreateView avec sélection examens

### **Semaine 3 : Logique métier (résultats, factures)**

12. Services résultats + validation + routes
13. Services bulletins PDF
14. Services factures + paiements
15. ResultatSaisieView, ResultatValidationView
16. BulletinPreviewView

### **Semaine 4 : Admin & Statistiques**

17. Service statistiques
18. StatsDashboardView (avec graphiques)
19. Admin (user management + catalogue)
20. Navigation dynamique par rôle

### **Semaine 5 : Tests & Déploiement**

21. Tests complets (>70% coverage)
22. Documentation API
23. Build production
24. Docker setup (optionnel)

---

## 📖 Configuration Vue.js 3 + Pinia + Router

### **main.js**

```javascript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.mount('#app')
```

### **router/index.js**

```javascript
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../views/auth/LoginView.vue') },
  {
    path: '/',
    component: () => import('../views/home/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/patients',
    component: () => import('../views/patient/PatientListView.vue'),
    meta: { requiresAuth: true }
  },
  // ... autres routes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
```

### **stores/auth.js (Pinia)**

```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '../services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  
  const isAuthenticated = computed(() => !!token.value)
  
  const login = async (identifiant, mot_de_passe) => {
    const response = await authService.login(identifiant, mot_de_passe)
    token.value = response.access_token
    user.value = response.user
    localStorage.setItem('token', token.value)
  }
  
  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }
  
  return { user, token, isAuthenticated, login, logout }
})
```

---

## 🎯 Points clés Vue.js 3

✅ **Composition API** (utiliser `setup()` ou `<script setup>`)
✅ **Pinia** pour l'état global (Redux alternative moderne)
✅ **Vite** pour dev ultra-rapide (hot reload instantané)
✅ **Axios** pour les appels API avec interceptors JWT
✅ **Vue Router** pour la navigation SPA
✅ **Vitest** pour les tests unitaires

---

## 🚀 **C'est prêt !**

Tous les documents sont générés avec **Vue.js 3** à la place de Flutter.

Backend reste **identique** (FastAPI + PostgreSQL).

Tu veux le PROMPT_CLAUDE_CODE adapté maintenant ? 👇

