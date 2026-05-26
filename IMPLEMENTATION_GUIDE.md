# 🚀 PROMPT POUR CLAUDE CODE — Implémentation du projet (Vue.js 3)

## 📋 Mission globale

Implémenter une **application complète de gestion des examens de laboratoire** en utilisant :
- **Frontend** : Vue.js 3 + Pinia + Vue Router (SPA moderne)
- **Backend** : FastAPI (Python)
- **Base de données** : PostgreSQL

---

## 📊 Ressources disponibles

Tu as accès à :
1. **Cahier des charges** (22 KB) — Spécifications métier complètes
2. **Analyse fonctionnelle** (918 KB) — 16 cas d'utilisation + diagrammes UML
3. **Branche technique** (64 KB) — Architecture 3-tiers + technologies
4. **Conception détaillée** (189 KB) — **MCD / MLD / Workflows / Maquettes**
5. **STRUCTURE_PROJET_VUEJS.md** — Structure complète (Vue.js 3)
6. **Diagrammes** (MCD, CU, domaine, déploiement)

---

## 🎯 Phasing recommandé (4-5 semaines)

### **SEMAINE 1 : Infrastructure & Authentification**

**Objectif** : Avoir une base solide pour tout le reste

**Tâches** :

#### Backend
1. ✅ Initialiser FastAPI
   ```bash
   mkdir backend && cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. ✅ Créer structure dossiers (voir STRUCTURE_PROJET_VUEJS.md)

3. ✅ Modèles SQLAlchemy (Backend)
   - [ ] `app/models/user.py` — UTILISATEUR (avec hachage bcrypt)
   - [ ] `app/models/role.py` — ROLE
   - [ ] `app/models/patient.py` — PATIENT
   - [ ] `app/models/medecin.py` — MEDECIN
   - Référence : MCD + MLD dans Conception_Detaillee_Projet10.docx

4. ✅ Configuration & Sécurité (Backend)
   - [ ] `app/config/settings.py` — Charger variables d'env
   - [ ] `app/config/database.py` — Connexion SQLAlchemy + Session
   - [ ] `app/config/security.py` — JWT config + bcrypt setup
   - [ ] `app/utils/exceptions.py` — Exceptions personnalisées

5. ✅ Service d'authentification (Backend)
   - [ ] `app/services/auth_service.py`
     - ✅ Créer utilisateur
     - ✅ Valider mot de passe
     - ✅ Générer JWT
     - ✅ Valider JWT
   - [ ] `app/utils/jwt_handler.py` — Générateur/validateur JWT
   - [ ] `app/utils/password_hash.py` — Hachage bcrypt

6. ✅ Route d'authentification (Backend)
   - [ ] `app/api/routes/auth.py`
     - POST /auth/login
     - POST /auth/logout
     - POST /auth/refresh-token

7. ✅ Middleware JWT (Backend)
   - [ ] `app/middleware/auth_middleware.py` — Validation JWT sur routes protégées
   - [ ] Intégrer dans main.py

8. ✅ CORS config (Backend)
   - [ ] Accepter `http://localhost:5173` (dev Vue.js)

#### Frontend (Vue.js 3)
9. ✅ Initialiser Vue.js 3
   ```bash
   npm create vite@latest frontend -- --template vue
   cd frontend
   npm install
   npm install pinia vue-router axios
   ```

10. ✅ Configuration Vite + structure dossiers
    - [ ] `vite.config.js` — Config Vite
    - [ ] `src/main.js` — Point d'entrée
    - [ ] `src/App.vue` — Composant racine

11. ✅ Configuration Pinia (State Management)
    - [ ] `src/stores/auth.js`
      - État : user, token, isAuthenticated
      - Actions : login, logout, refreshToken

12. ✅ Configuration Vue Router
    - [ ] `src/router/index.js`
      - Routes publiques : /login
      - Routes protégées : / (dashboard), /patients, etc.
      - Guard : vérifier authentification avant d'accéder

13. ✅ Service d'authentification (Frontend)
    - [ ] `src/services/api.js` — Client axios générique
      - Interceptor : ajouter JWT à chaque requête
      - Interceptor : gérer 401 (refresh ou logout)
    - [ ] `src/services/authService.js`
      - login(identifiant, motDePasse)
      - logout()
      - refreshToken()

14. ✅ Composant Login
    - [ ] `src/views/auth/LoginView.vue`
      - Formulaire : identifiant + mot_de_passe
      - Validation client
      - Appel authService.login()
      - Redirection si succès
      - Affichage erreurs

15. ✅ Navbar & Layout
    - [ ] `src/components/common/Navbar.vue`
      - Afficher utilisateur connecté
      - Bouton logout
      - Lien vers dashboard
    - [ ] `src/views/home/DashboardView.vue`
      - Layout principal (Navbar + contenu + Sidebar)
      - Affichage tableau de bord par rôle

16. ✅ Tests authentification
    - [ ] Tester curl : `curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"identifiant":"admin","mot_de_passe":"password"}'`
    - [ ] Tester Frontend : ouvrir http://localhost:5173, se connecter, vérifier redirection

---

### **SEMAINE 2 : CRUD Patients & Demandes d'examen**

**Objectif** : CRUD complets pour les entités principales

#### Backend
1. ✅ Modèles restants (SQLAlchemy)
   - [ ] `app/models/demande_examen.py` — DEMANDE_EXAMEN
   - [ ] `app/models/ligne_demande.py` — LIGNE_DEMANDE
   - [ ] `app/models/examen.py` — EXAMEN
   - [ ] `app/models/categorie.py` — CATEGORIE

2. ✅ Schémas Pydantic
   - [ ] `app/schemas/patient.py` — PatientCreate, PatientUpdate, PatientResponse
   - [ ] `app/schemas/demande_examen.py` — DemandeCreate, DemandeResponse
   - [ ] `app/schemas/examen.py` — ExamenResponse

3. ✅ Repositories CRUD
   - [ ] `app/repositories/base_repository.py` — Classe générique avec create, read, update, delete, list
   - [ ] `app/repositories/patient_repository.py` — Extends base_repository
   - [ ] `app/repositories/demande_repository.py`

4. ✅ Services métier
   - [ ] `app/services/patient_service.py` — Utilise PatientRepository
   - [ ] `app/services/demande_service.py` — Création + calcul montantTotal + génération numero

5. ✅ Routes (Endpoints REST)
   - [ ] `app/api/routes/patients.py`
     - GET /patients (paginated, optionnel : filtre, tri)
     - POST /patients
     - GET /patients/{id}
     - PUT /patients/{id}
     - DELETE /patients/{id} (soft delete)
   
   - [ ] `app/api/routes/demandes.py`
     - POST /demandes_examen
     - GET /demandes_examen?etat=...&patientId=...
     - GET /demandes_examen/{id}
     - PUT /demandes_examen/{id}/etat

6. ✅ Tests API
   - [ ] `tests/test_patients.py` — Tests CRUD patients
   - [ ] `tests/test_demandes.py` — Tests demandes d'examen

#### Frontend (Vue.js)
7. ✅ Services API
   - [ ] `src/services/patientService.js`
     - getPatients(page, filter)
     - getPatientById(id)
     - createPatient(data)
     - updatePatient(id, data)
     - deletePatient(id)
   
   - [ ] `src/services/demandeService.js`
     - createDemande(patientId, medecin, examensIds)
     - getDemandes(filter)
     - getDemande(id)
     - updateEtat(id, nouvelEtat)
   
   - [ ] `src/services/examenService.js`
     - getCatalogueExamens() — Cache dans store

8. ✅ Pinia Stores
   - [ ] `src/stores/patient.js`
     - patients: []
     - currentPatient: null
     - loading: false
     - error: null
     - Actions : fetchPatients, fetchPatient, createPatient, etc.
   
   - [ ] `src/stores/demande.js`
     - demandes: []
     - currentDemande: null
     - Actions : fetchDemandes, createDemande, etc.
   
   - [ ] `src/stores/examen.js`
     - catalogue: [] (cache)
     - Actions : fetchCatalogue

9. ✅ Composants réutilisables
   - [ ] `src/components/patient/PatientCard.vue`
     - Afficher info patient en format compact
   
   - [ ] `src/components/patient/PatientSearch.vue`
     - Champ recherche avec autocomplete
   
   - [ ] `src/components/demande/ExamenListTile.vue`
     - Afficher examen avec checkbox (pour sélection)
   
   - [ ] `src/components/demande/DemandeForm.vue`
     - Formulaire complet création demande
     - Intégre PatientSearch + ExamenListTile

10. ✅ Vues (Pages)
    - [ ] `src/views/patient/PatientListView.vue`
      - Affiche liste patients
      - Bouton « Nouveau patient »
      - Lien pour voir détail
    
    - [ ] `src/views/patient/PatientCreateView.vue`
      - Formulaire créer patient
    
    - [ ] `src/views/patient/PatientDetailView.vue`
      - Détail patient
      - Historique demandes
      - Bouton modifier
    
    - [ ] `src/views/demande/DemandeCreateView.vue`
      - Utilise DemandeForm
    
    - [ ] `src/views/demande/DemandeListView.vue`
      - Liste demandes avec filtres (état, patient, date)

11. ✅ Navigation
    - [ ] Mettre à jour `src/router/index.js` avec nouvelles routes
    - [ ] Mettre à jour `src/components/common/Navbar.vue` avec liens

---

### **SEMAINE 3 : Logique métier (Résultats, Factures, Bulletins)**

**Objectif** : Workflows complexes opérationnels

#### Backend
1. ✅ Modèles SQLAlchemy
   - [ ] `app/models/prelevement.py` — PRELEVEMENT (avec codeBarres unique)
   - [ ] `app/models/resultat.py` — RESULTAT
   - [ ] `app/models/val_reference.py` — VAL_REFERENCE
   - [ ] `app/models/facture.py` — FACTURE
   - [ ] `app/models/paiement.py` — PAIEMENT
   - [ ] `app/models/bulletin.py` — BULLETIN

2. ✅ Schémas Pydantic
   - [ ] `app/schemas/resultat.py`
   - [ ] `app/schemas/facture.py`
   - [ ] `app/schemas/paiement.py`
   - [ ] `app/schemas/bulletin.py`

3. ✅ Services métier complexes
   - [ ] `app/services/resultat_service.py`
     - Saisie résultats
     - Validation automatique (comparaison avec VAL_REFERENCE)
     - Détection anormaux (estAnormal = True/False)
   
   - [ ] `app/services/facture_service.py`
     - Génération automatique à partir DEMANDE_EXAMEN
     - Calcul montantTotal
   
   - [ ] `app/services/paiement_service.py`
     - Enregistrement paiements
     - Mise à jour FACTURE.reste
   
   - [ ] `app/services/bulletin_service.py`
     - Génération PDF (reportlab)
     - Fetch données patient + examens + résultats + normes
     - Formatting professionnel
     - Retourner URL téléchargement

4. ✅ Routes
   - [ ] `app/api/routes/prelevements.py`
     - POST /prelevements — Enregistrer prélèvement
   
   - [ ] `app/api/routes/resultats.py`
     - POST /resultats — Technicien saisit valeurs
     - PUT /resultats/{id}/valider — Biologiste valide
   
   - [ ] `app/api/routes/bulletins.py`
     - POST /bulletins/generer/{demandeId} — Générer PDF
     - GET /bulletins/{id}/download — Télécharger
   
   - [ ] `app/api/routes/factures.py`
     - GET /factures/{id}
     - POST /factures/{id}/rappel
   
   - [ ] `app/api/routes/paiements.py`
     - POST /paiements — Enregistrer paiement

5. ✅ Tests
   - [ ] `tests/test_resultats.py`
   - [ ] `tests/test_bulletins.py`

#### Frontend (Vue.js)
6. ✅ Services API
   - [ ] `src/services/resultatService.js`
   - [ ] `src/services/bulletinService.js`
   - [ ] `src/services/factureService.js`

7. ✅ Pinia Stores
   - [ ] `src/stores/resultat.js`
   - [ ] `src/stores/notification.js` — Notifications utilisateurs

8. ✅ Composants
   - [ ] `src/components/resultat/ResultatInput.vue`
     - Champ saisie valeur
     - Validation live
     - Affichage norme à côté
     - Couleur rouge si anormal
   
   - [ ] `src/components/resultat/ValidationCard.vue`
     - Affiche un résultat saisi
     - Valeur + normalité (✓ vert / ✗ rouge)
     - Champ commentaire
     - Bouton valider/refuser

9. ✅ Vues
   - [ ] `src/views/prelevement/PrelevementFormView.vue`
     - Champ scan code-barres
     - Récupère automatiquement demande
     - Bouton « Enregistrer »
   
   - [ ] `src/views/resultat/ResultatSaisieView.vue`
     - Affiche examen à analyser
     - Utilise ResultatInput pour chaque valeur
     - Bouton « Enregistrer résultats »
   
   - [ ] `src/views/resultat/ResultatValidationView.vue`
     - Affiche résultats saisis (utilise ValidationCard)
     - Biologiste peut valider/refuser
   
   - [ ] `src/views/bulletin/BulletinPreviewView.vue`
     - Aperçu PDF
     - Boutons : Télécharger, Imprimer, Partager
   
   - [ ] `src/views/facture/FactureListView.vue`
     - Liste factures par état
     - Filtres (payée, impayée, prise en charge)

---

### **SEMAINE 4 : Admin & Statistiques**

**Objectif** : Tableaux de bord et gestion

#### Backend
1. ✅ Service statistiques
   - [ ] `app/services/stat_service.py`
     - Patients reçus (jour/mois/année)
     - Examens populaires
     - Chiffre d'affaires
     - Taux validation

2. ✅ Routes
   - [ ] `app/api/routes/statistiques.py`
     - GET /stats/jour
     - GET /stats/mois
     - GET /stats/annee
     - GET /stats/examens-populaires

3. ✅ Service utilisateurs (Admin)
   - [ ] `app/services/user_service.py`
     - CRUD users
     - Activation/désactivation
   - [ ] `app/api/routes/users.py`

4. ✅ Service catalogue (Admin)
   - [ ] `app/services/examen_service.py` (complet)
   - [ ] `app/api/routes/examens.py`

#### Frontend (Vue.js)
5. ✅ Services API
   - [ ] `src/services/statService.js`

6. ✅ Pinia Store
   - [ ] `src/stores/stat.js` — Cache stats

7. ✅ Composants
   - [ ] `src/components/stat/StatCard.vue`
     - Affiche KPI (nombre, chiffre d'affaires, taux)
     - Optionnel : variation depuis hier

8. ✅ Vues
   - [ ] `src/views/home/DashboardView.vue` (amélioration)
     - Tableau de bord par rôle (réceptionniste ≠ technicien ≠ biologiste ≠ admin ≠ directeur)
     - Afficher KPI pertinents pour le rôle
   
   - [ ] `src/views/statistiques/StatsDashboardView.vue`
     - Graphiques (jours, mois, année)
     - Utiliser une lib graphique (Chart.js via vue-chartjs)
     - Sélecteur période
   
   - [ ] `src/views/admin/UserManagementView.vue`
     - Liste utilisateurs
     - Créer/modifier/supprimer
     - Assigner rôles
   
   - [ ] `src/views/admin/CatalogManagementView.vue`
     - CRUD examens
     - CRUD catégories
     - CRUD valeurs de référence

---

### **SEMAINE 5 : Tests & Déploiement (optionnel)**

**Objectif** : Qualité + Documentation

1. ✅ Tests Backend
   - [ ] Tests unitaires (services)
   - [ ] Tests intégration (API endpoints)
   - [ ] Couverture >70%
   - [ ] `pytest tests/ -v --cov`

2. ✅ Tests Frontend
   - [ ] Tests unitaires (stores, services)
   - [ ] Tests composants (Vitest + Vue Test Utils)
   - [ ] `npm test`

3. ✅ Documentation
   - [ ] `docs/API.md` — Tous les endpoints
   - [ ] `docs/DATABASE.md` — Schéma détaillé
   - [ ] `docs/VUEJS.md` — Guide Vue.js 3
   - [ ] `docs/DEVELOPMENT.md` — Guide démarrage
   - [ ] `README.md` (root) — Vue globale

4. ✅ Build Production
   - [ ] `npm run build` — Build Vue.js
   - [ ] Uvicorn production ready

---

## 🔧 Commandes clés à connaître

### Backend (Python/FastAPI)

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

### Frontend (Vue.js 3)

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

## 📚 Documentation pour référence

Tous les documents ci-dessous sont disponibles dans `/mnt/user-data/outputs/` :

1. **Cahier_des_charges_Projet10.docx** — Besoins métier
2. **Analyse_Fonctionnelle_Projet10.docx** — 16 CU + modèles
3. **Branche_Technique_Projet10.docx** — Architecture
4. **Conception_Detaillee_Projet10.docx** — **MCD/MLD/Workflows/Maquettes**
5. **STRUCTURE_PROJET_VUEJS.md** — Structure complète (Vue.js 3)
6. **Diagrammes** (MCD, CU, domaine)

---

## 🎯 Points clés Vue.js 3

✅ **Composition API** — `<script setup>` pour du code plus léger
✅ **Pinia** — Store management (état global partagé)
✅ **Vue Router** — Navigation SPA sans rechargement page
✅ **Axios** — Client HTTP avec interceptors pour JWT
✅ **Vite** — Dev server ultra-rapide (5ms hot reload)
✅ **Vitest** — Tests unitaires rapides
✅ **Chart.js** — Graphiques pour statistiques

---

## 🚀 **C'est prêt !**

Structure complète adaptée à **Vue.js 3** générée.

Backend reste **identique** (FastAPI + PostgreSQL).

**La semaine 1 est critique** — c'est la fondation de tout.

Bon courage ! 🎊

