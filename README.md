# Gestion des examens de laboratoire - L'Horizon

Application complète et moderne pour la gestion des examens médicaux dans un laboratoire d'analyses, incluant la gestion des patients, des demandes d'examen, des résultats et des tableaux de bord statistiques.

## 🏗️ Architecture

```
laboratoire-examens/
├── frontend/        # Application Vue.js 3 (Interface Utilisateur)
├── backend/         # API FastAPI (Logique Métier & Base de données)
├── database/        # Scripts SQL, Schémas et migrations
└── docs/            # Documentation technique et spécifications
```

## 🛠️ Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- **Python 3.10+**
- **Node.js 18+** et **npm**
- **PostgreSQL 14+** (ou un serveur de base de données compatible configuré)
- **Git**

## 🚀 Démarrage rapide

### 1. Backend (FastAPI)

Configuration de l'environnement Python et lancement de l'API :

```bash
cd backend
# Création et activation de l'environnement virtuel
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate

# Installation des dépendances
pip install -r requirements.txt

# Lancement du serveur de développement
python -m uvicorn app.main:app --reload
```

- L'API sera disponible sur : **http://localhost:8000**
- La documentation interactive (Swagger UI) : **http://localhost:8000/docs**

### 2. Frontend (Vue.js 3)

Configuration et lancement de l'interface utilisateur :

```bash
cd frontend
# Installation des dépendances npm
npm install

# Lancement du serveur de développement Vite
npm run dev
```

- L'application sera disponible sur : **http://localhost:5173**

### 3. Compte de démonstration

Utilisez ces identifiants pour tester l'application :
- **Identifiant** : admin
- **Mot de passe** : password

## 📊 Stack technique

| Frontend | Backend | Base de données & Outils |
| :--- | :--- | :--- |
| Vue.js 3 (Composition API) | FastAPI (Python) | PostgreSQL |
| Tailwind CSS & Glassmorphism | SQLAlchemy (ORM) | Git & GitHub |
| Pinia (State Management) | Pydantic (Validation) | Uvicorn |
| Vue Router | JWT (Authentification) | Pytest |
| Axios | Bcrypt (Sécurité) | Vite |

## 📚 Documentation complète

Pour des informations détaillées, consultez notre documentation :
- [Documentation Backend](./backend/README.md)
- [Documentation Frontend](./frontend/README.md)
- [Architecture Détaillée](./docs/ARCHITECTURE.md)
- [Référence de l'API](./docs/API.md)

## ✨ Fonctionnalités principales

- ✅ **Sécurité & Authentification** : Connexion sécurisée avec JWT et hachage bcrypt.
- 📝 **Dossiers Patients** : Création, modification et suivi des informations patients.
- 📋 **Demandes d'Examens** : Prescription et gestion du cycle de vie des examens.
- 🧬 **Résultats** : Saisie, interprétation automatisée et validation technique des résultats.
- 📊 **Tableaux de bord** : Vue d'ensemble avec statistiques en temps réel.
- 👥 **Administration** : Gestion des rôles, des utilisateurs et du catalogue d'examens.
- 📄 **Export** : Génération de rapports PDF pour les résultats.

## 🧪 Tests et Qualité

Exécuter les suites de tests pour garantir la stabilité :

```bash
# Tests Backend
cd backend
pytest tests/ -v --cov

# Tests Frontend
cd frontend
npm run test:unit
```

## 📦 Déploiement

Le guide de mise en production et de configuration des serveurs est disponible dans le fichier `docs/DEPLOYMENT.md`.

## 📝 Licence

Projet académique réalisé dans le cadre de la formation ENASTIC (Licence 2 Informatique).

## 👨‍💻 Auteurs

- **Username** : [@black-hatn](https://github.com/black-hatn)
- **Email** : nouradinezakariamahamat2@gmail.com
- Étudiant ENASTIC - L2 Info 2 - 2026
