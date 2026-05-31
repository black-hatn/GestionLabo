# Local Setup Guide - Laboratoire Examens

## Prerequisites

Before you begin, make sure you have the following installed:

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 18+** - [Download](https://nodejs.org/)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download/)

### Verify Installation

```bash
python3 --version
node --version
psql --version
```

---

## 🚀 Automated Setup (Recommended)

### Linux / macOS

```bash
# Navigate to project root
cd laboratoire-examens

# Run setup script
chmod +x setup.sh
./setup.sh
```

### Windows

```bash
# Navigate to project root
cd laboratoire-examens

# Run setup script
setup.bat
```

---

## 📝 Manual Setup

### Step 1: Database Setup

Create the PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE laboratoire_examens;

# Exit
\q
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp ../.env.example .env

# Edit .env with your settings (database URL, secret keys, etc.)
nano .env

# Run database migrations (if using Alembic)
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

**Backend will be available at:** `http://localhost:8000`

### Step 3: Frontend Setup (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp ../.env.example .env.local

# Edit .env.local with your settings
nano .env.local

# Start the development server
npm run dev
```

**Frontend will be available at:** `http://localhost:3000`

---

## 🔧 Configuration

### Backend Configuration (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/laboratoire_examens

# Security
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET=your-jwt-secret-key-change-in-production

# Email (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Logging
LOG_LEVEL=INFO
```

### Frontend Configuration (.env.local)

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Application
NEXT_PUBLIC_APP_NAME=Laboratoire Examens
NEXT_PUBLIC_ENVIRONMENT=development

# Features
NEXT_PUBLIC_ENABLE_DARK_MODE=true
```

---

## 📊 Running the Application

### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate.bat on Windows
uvicorn app.main:app --reload
```

Output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Output:
```
  ▲ Next.js 14.0.0
  - Local:        http://localhost:3000
```

### Terminal 3 - Database (Optional)

If you need to interact with the database:

```bash
psql -U postgres -d laboratoire_examens
```

---

## 🌐 Access the Application

Once both servers are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc

---

## 🧪 Running Tests

### Backend Tests

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate.bat on Windows
pytest

# With coverage
pytest --cov=app --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm test

# With coverage
npm run test:coverage
```

---

## 🛠️ Troubleshooting

### Port Already in Use

If ports 3000 or 8000 are already in use:

```bash
# Find process using port (Linux/macOS)
lsof -i :3000
lsof -i :8000

# Kill the process
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Database Connection Failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS
Services.msc  # Windows

# Test connection
psql -U postgres -h localhost -d laboratoire_examens -c "SELECT 1;"
```

### Python Virtual Environment Issues

```bash
# Remove and recreate venv
rm -rf backend/venv
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### Node/npm Issues

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf frontend/node_modules
npm install
```

---

## 📚 Available Commands

### Backend

```bash
# Development
uvicorn app.main:app --reload

# Production
gunicorn app.main:app -w 4 --worker-class uvicorn.workers.UvicornWorker

# Testing
pytest
pytest -v

# Linting
flake8 app/
black app/
```

### Frontend

```bash
# Development
npm run dev

# Production build
npm run build

# Start production build
npm start

# Testing
npm test

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## 🔐 Security Notes

1. **Never commit .env files** - Use .env.example as template
2. **Change SECRET_KEY and JWT_SECRET** in production
3. **Use HTTPS** in production
4. **Update dependencies regularly**: `npm audit`, `pip audit`
5. **Use strong database passwords**
6. **Enable 2FA** in production

---

## 📖 Documentation

- [README.md](./README.md) - Project overview
- [API.md](./API.md) - API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [SECURITY.md](./SECURITY.md) - Security guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment

---

## ✅ Verification Checklist

- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed and running
- [ ] Database created: `laboratoire_examens`
- [ ] Backend .env configured
- [ ] Frontend .env.local configured
- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:3000
- [ ] Can access API docs at http://localhost:8000/docs
- [ ] Can login to frontend at http://localhost:3000

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs in terminal output
3. Check .env configuration
4. Verify all prerequisites are installed
5. Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system understanding
