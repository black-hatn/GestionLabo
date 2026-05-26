# Frontend Vue.js 3 — Gestion des examens de laboratoire

## 🚀 Démarrage rapide

### Installation

```bash
cd frontend
npm install
```

### Configuration

```bash
cp .env.example .env
```

### Démarrer le serveur de développement

```bash
npm run dev
```

L'application sera disponible sur : **http://localhost:5173**

### Build pour la production

```bash
npm run build
```

## 📁 Structure

```
src/
├── components/      # Composants réutilisables
├── views/           # Pages/Écrans
├── services/        # Communication API
├── stores/          # État global (Pinia)
├── router/          # Configuration Vue Router
├── styles/          # Styles CSS
├── utils/           # Fonctions utilitaires
├── assets/          # Fichiers statiques
├── App.vue          # Composant racine
└── main.js          # Point d'entrée
```

## 🔐 Authentification

La connexion se fait via le formulaire de login.

### Compte de démo

- **Identifiant** : admin
- **Mot de passe** : password

## 📚 Technologies utilisées

- **Vue.js 3** — Framework frontend
- **Pinia** — Gestion d'état
- **Vue Router** — Navigation
- **Axios** — HTTP client
- **Vite** — Build tool

## 🧪 Tests

```bash
npm test
```

## 🔧 Commandes utiles

```bash
# Format le code
npm run format

# Lint le code
npm run lint

# Build production
npm run build

# Prévisualiser la version build
npm run preview
```

## 📖 Documentation complète

Voir `../docs/` pour la documentation détaillée.
