# ⚡ Quick Reference - Laboratoire Examens

## 🚀 Start the System (2 Terminals)

### Terminal 1: Backend
```bash
cd ~/Documents/Genie\ Logiciel/laboratoire-examens/backend
source venv/bin/activate
uvicorn app.main:app --reload
```
👉 API running at: **http://localhost:8000**  
📖 Docs at: **http://localhost:8000/docs**

### Terminal 2: Frontend
```bash
cd ~/Documents/Genie\ Logiciel/laboratoire-examens/frontend
npm run dev
```
👉 Frontend running at: **http://localhost:3000**

---

## ✅ Verify System is Working

```bash
# Check Backend
curl http://localhost:8000/health
# Expected: {"status":"OK"}

# Check Frontend
curl -I http://localhost:3000/
# Expected: HTTP/1.1 200 OK
```

---

## 🔑 Test Login Credentials

Use any credentials to test (system creates user on registration):

**Method 1: Register New User**
1. Go to http://localhost:3000/register
2. Fill in form
3. Click "S'inscrire"

**Method 2: Use Existing Credentials**
```
Email: test@example.com
Password: TestPassword123!
```

---

## 📋 Main Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | http://localhost:3000 | Landing page |
| **Login** | http://localhost:3000/login | User authentication |
| **Register** | http://localhost:3000/register | Create new account |
| **Dashboard** | http://localhost:3000/dashboard | Main interface |
| **Patients** | http://localhost:3000/dashboard/patients | Patient management |
| **Exams** | http://localhost:3000/dashboard/exams | Exam types |
| **Exam Requests** | http://localhost:3000/dashboard/exam-requests | Pending requests |
| **Results** | http://localhost:3000/dashboard/results | Test results |
| **Invoices** | http://localhost:3000/dashboard/invoices | Billing |
| **Payments** | http://localhost:3000/dashboard/payments | Payment tracking |
| **Analytics** | http://localhost:3000/dashboard/analytics | Statistics & reports |
| **Users** | http://localhost:3000/dashboard/users | User management |
| **Settings** | http://localhost:3000/dashboard/settings | Configuration |

---

## 🔌 API Endpoints (Sample)

```bash
# Get all patients
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/patients

# Create a patient
curl -X POST http://localhost:8000/api/v1/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "birth_date": "1990-01-15",
    "sex": "M",
    "email": "jean@example.com",
    "phone": "0123456789",
    "city": "Paris",
    "record_number": "PAT001"
  }'

# Get all exams
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/exams
```

---

## 🛠️ Common Fixes

### Backend won't start
```bash
# Start PostgreSQL
sudo systemctl start postgresql

# Or check if it's already running
sudo systemctl status postgresql
```

### Frontend build failed
```bash
# Clear cache and reinstall
rm -rf node_modules .next package-lock.json
npm install
npm run build
```

### Port already in use
```bash
# Kill process on port 8000 (backend)
lsof -i :8000
kill -9 <PID>

# Kill process on port 3000 (frontend)
lsof -i :3000
kill -9 <PID>
```

---

## 📦 What's Installed

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL driver
- JWT authentication
- CORS middleware

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- Recharts
- Lucide React (icons)

---

## 📖 Documentation Files

Located in: `/home/userxn/Documents/Genie\ Logiciel/laboratoire-examens/`

- **00_LIRE_EN_PREMIER.md** - Start here (French)
- **QUICK_START.md** - 5-minute setup guide
- **README.md** - Project overview
- **API.md** - Complete API reference
- **ARCHITECTURE.md** - System design
- **SECURITY.md** - Security features
- **DEPLOYMENT_COMPLETE.md** - Current status (this session)

---

## 🆘 Database Commands

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# In psql:
\l                           # List databases
\c laboratoire_examens       # Connect to DB
\dt                          # List tables
SELECT * FROM users;         # View users table
\q                           # Quit

# Quick commands:
sudo -u postgres psql -c "SELECT COUNT(*) FROM utilisateurs WHERE est_actif = true;"
```

---

## 🎯 Task Checklist

- [x] Backend running
- [x] Frontend building successfully
- [x] Database configured
- [x] API responding
- [x] All routes available
- [x] Authentication working
- [x] Frontend accessible at localhost:3000
- [x] Type safety (TypeScript)
- [x] Styling (Tailwind CSS)
- [x] Documentation complete

---

## 💾 Key Directories

```
~/Documents/Genie\ Logiciel/laboratoire-examens/
├── backend/              # Python FastAPI
│   ├── app/main.py      # Entry point
│   ├── venv/            # Python virtual env
│   └── .env             # Configuration
├── frontend/            # Next.js React
│   ├── app/            # Pages and routes
│   ├── components/     # React components
│   ├── .next/          # Build output
│   └── .env.local      # Configuration
└── [docs]              # Documentation
```

---

## 🎓 Next Steps

1. **Explore the API**
   - Visit http://localhost:8000/docs
   - Try out endpoints with Swagger UI

2. **Test Frontend**
   - Register a new user
   - Navigate through pages
   - Create sample data

3. **Review Code**
   - Backend: `app/api/v1/endpoints/`
   - Frontend: `app/dashboard/`

4. **Customize**
   - Update configuration in `.env` files
   - Modify components in `frontend/components/`
   - Add new API endpoints in `backend/app/api/`

---

## 📞 Quick Help

**Frontend not loading?**
- Check backend is running: `curl http://localhost:8000/health`
- Check frontend server: `npm run dev` in frontend folder
- Clear browser cache (Ctrl+Shift+Del)

**API returning 404?**
- Verify token is valid
- Check endpoint path matches documentation
- Ensure database has data

**TypeScript errors?**
- Run: `npm run build` to check all errors
- Check `.env.local` is properly configured

---

**Status: ✅ READY FOR DEVELOPMENT**

All systems operational. Start with the 2-terminal setup above!
