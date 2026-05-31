# ⚡ Quick Start - Laboratoire Examens

Get up and running in 5 minutes!

## Prerequisites

```bash
# Check you have these installed:
python3 --version   # 3.11+
node --version      # 18+
psql --version      # 14+
```

## Option 1: Automated Setup (Recommended)

### Linux / macOS
```bash
cd laboratoire-examens
chmod +x setup.sh
./setup.sh
```

### Windows
```bash
cd laboratoire-examens
setup.bat
```

Then follow the on-screen instructions!

---

## Option 2: Quick Manual Setup

### 1. Database (2 min)
```bash
# Create database
psql -U postgres -c "CREATE DATABASE laboratoire_examens;"
```

### 2. Backend (1 min)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # venv\Scripts\activate.bat on Windows
pip install -r requirements.txt
cp ../.env.example .env

# Edit .env with PostgreSQL connection info, then:
uvicorn app.main:app --reload
```

Backend is running on: **http://localhost:8000**

### 3. Frontend (1 min) - New Terminal
```bash
cd frontend
npm install
cp ../.env.example .env.local
npm run dev
```

Frontend is running on: **http://localhost:3000**

---

## 🎉 You're Done!

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### Default Login
- Email: `user@example.com`
- Password: Create via `/register` endpoint first

---

## 📚 Next Steps

1. **Explore the App** - Login and try the features
2. **Read Documentation**:
   - [README_LOCAL_SETUP.md](./README_LOCAL_SETUP.md) - Detailed setup
   - [API.md](./API.md) - API endpoints
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - How it works

3. **Start Developing** - Customize and extend!

---

## 🆘 Troubleshooting

### Port already in use?
```bash
# Linux/macOS
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### PostgreSQL connection error?
```bash
# Test connection
psql -U postgres -h localhost -d laboratoire_examens -c "SELECT 1;"
```

### Virtual environment issues?
```bash
# Recreate venv
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📖 Full Documentation

- [README_LOCAL_SETUP.md](./README_LOCAL_SETUP.md) - Complete setup guide
- [API.md](./API.md) - API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [SECURITY.md](./SECURITY.md) - Security features
- [TESTING.md](./TESTING.md) - Running tests

---

**Ready to code?** 🚀

Let us know if you have any questions!
