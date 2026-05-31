# Guide de Déploiement Local & Production - Sans Docker

Ce guide détaille la procédure de déploiement et d'hébergement en production du laboratoire d'examens biomédicaux NovaBio Lab directement sur un serveur Linux (bare metal ou machine virtuelle) sans utiliser de conteneurisation.

---

## 📋 Prérequis Système

* **Système d'exploitation** : Ubuntu 22.04 LTS ou supérieur (ou autre distribution Linux).
* **Python** : Python 3.10 ou supérieur (avec `venv` et `pip`).
* **Node.js** : Node.js 18.x ou supérieur (avec `npm` ou `yarn`).
* **Base de données** : PostgreSQL 14 ou supérieur.
* **Serveur Web / Reverse Proxy** : Nginx.
* **Gestionnaire de processus** : Systemd (standard) et PM2 (facultatif pour le frontend).

---

## 🛠️ Étape 1 : Configuration de la Base de Données PostgreSQL

1. Installez PostgreSQL sur le serveur :
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib -y
   ```

2. Démarrez et activez le service PostgreSQL :
   ```bash
   sudo systemctl enable postgresql
   sudo systemctl start postgresql
   ```

3. Connectez-vous à la console PostgreSQL et créez la base de données ainsi que l'utilisateur dédié :
   ```sql
   sudo -u postgres psql
   
   -- Dans la console psql:
   CREATE DATABASE novabio_db;
   CREATE USER novabio_user WITH PASSWORD 'VotreMotDePasseSecurise';
   GRANT ALL PRIVILEGES ON DATABASE novabio_db TO novabio_user;
   ALTER DATABASE novabio_db OWNER TO novabio_user;
   \q
   ```

---

## 🐍 Étape 2 : Déploiement du Backend (FastAPI)

1. Clonez ou déplacez le projet dans `/var/www/novabio-lab` :
   ```bash
   sudo mkdir -p /var/www/novabio-lab
   sudo chown -R $USER:$USER /var/www/novabio-lab
   cd /var/www/novabio-lab
   ```

2. Configurez l'environnement virtuel Python dans le dossier `backend` :
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

3. Créez et configurez le fichier d'environnement `.env` :
   ```bash
   cp .env.example .env
   nano .env
   ```
   Ajustez la variable `DATABASE_URL` pour utiliser votre instance PostgreSQL locale :
   ```ini
   DATABASE_URL=postgresql://novabio_user:VotreMotDePasseSecurise@localhost:5432/novabio_db
   SECRET_KEY=UneCleSecreteSuperLongueEtTresComplexe
   ```

4. Exécutez les migrations de base de données :
   ```bash
   alembic upgrade head
   ```

---

## 🌐 Étape 3 : Déploiement du Frontend (Next.js)

1. Naviguez dans le dossier `frontend` :
   ```bash
   cd /var/www/novabio-lab/frontend
   ```

2. Installez les dépendances Node.js :
   ```bash
   npm install
   ```

3. Créez le fichier d'environnement `.env.local` :
   ```bash
   cp .env.example .env.local
   nano .env.local
   ```
   Renseignez l'URL locale de l'API backend :
   ```ini
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
   ```

4. Compilez l'application Next.js pour la production :
   ```bash
   npm run build
   ```

---

## ⚙️ Étape 4 : Gestion des Processus de Production avec Systemd

Pour assurer la résilience de l'application en production, nous utilisons Systemd pour gérer le démarrage et le redémarrage automatique des services.

### 1. Service Backend FastAPI (`novabio-backend.service`)

Créez le fichier de service Systemd pour le backend :
```bash
sudo nano /etc/systemd/system/novabio-backend.service
```

Ajoutez le contenu suivant :
```ini
[Unit]
Description=NovaBio Lab Backend (FastAPI)
After=network.target postgresql.service

[Service]
User=userxn
WorkingDirectory=/var/www/novabio-lab/backend
ExecStart=/var/www/novabio-lab/backend/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 4
Restart=always
RestartSec=5
Environment=PYTHONPATH=/var/www/novabio-lab/backend

[Install]
WantedBy=multi-user.target
```

### 2. Service Frontend Next.js (`novabio-frontend.service`)

Créez le fichier de service Systemd pour le frontend :
```bash
sudo nano /etc/systemd/system/novabio-frontend.service
```

Ajoutez le contenu suivant :
```ini
[Unit]
Description=NovaBio Lab Frontend (Next.js)
After=network.target

[Service]
User=userxn
WorkingDirectory=/var/www/novabio-lab/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target
```

### 3. Démarrage et activation des services

Rechargez Systemd, puis démarrez et activez vos nouveaux services :
```bash
sudo systemctl daemon-reload

# Activer et démarrer le backend
sudo systemctl enable novabio-backend
sudo systemctl start novabio-backend

# Activer et démarrer le frontend
sudo systemctl enable novabio-frontend
sudo systemctl start novabio-frontend
```

Vérifiez que les services fonctionnent parfaitement :
```bash
sudo systemctl status novabio-backend
sudo systemctl status novabio-frontend
```

---

## 🔒 Étape 5 : Configuration du Reverse Proxy Nginx & SSL

1. Installez le serveur Web Nginx :
   ```bash
   sudo apt install nginx -y
   ```

2. Créez un fichier de configuration pour NovaBio Lab :
   ```bash
   sudo nano /etc/nginx/sites-available/novabio-lab
   ```

3. Ajoutez la configuration Nginx optimisée :
   ```nginx
   server {
       listen 80;
       server_name novabio-lab.example.com; # Remplacez par votre domaine ou IP

       # Redirection HTTP vers HTTPS (à activer une fois le certificat SSL installé)
       # return 301 https://$host$request_uri;

       # Log Files
       access_log /var/log/nginx/novabio_access.log;
       error_log /var/log/nginx/novabio_error.log;

       # Proxy API Backend
       location /api/ {
           proxy_pass http://127.0.0.1:8000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       # Proxy Frontend Next.js
       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

4. Activez le site et testez la configuration Nginx :
   ```bash
   sudo ln -s /etc/nginx/sites-available/novabio-lab /etc/nginx/sites-enabled/
   sudo rm -f /etc/nginx/sites-enabled/default
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Sécurisez avec HTTPS gratuitement via Let's Encrypt (Certbot) :
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   sudo certbot --nginx -d novabio-lab.example.com
   ```

---

## 🧹 Étape 6 : Script d'Auto-Nettoyage et Maintenance

Pour vider les caches, optimiser l'espace disque et nettoyer les résidus du projet locale, utilisez la commande de nettoyage incluse ou lancez le script manuel :

```bash
# Nettoyage des caches Next.js et des fichiers temporaires Python
cd /var/www/novabio-lab
rm -rf frontend/.next
rm -rf backend/__pycache__
rm -rf backend/app/__pycache__
rm -rf backend/app/api/__pycache__
rm -rf backend/app/api/v1/__pycache__
rm -rf backend/app/api/v1/endpoints/__pycache__
rm -rf backend/app/models/__pycache__
rm -rf backend/app/schemas/__pycache__
rm -rf backend/app/services/__pycache__
rm -rf backend/app/utils/__pycache__
rm -rf backend/app/config/__pycache__
```
