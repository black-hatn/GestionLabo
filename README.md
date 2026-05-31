# Laboratoire Examens - Enterprise Laboratory Management System

[![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)](.)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Coverage](https://img.shields.io/badge/coverage-70%25-success)](.)

A comprehensive, enterprise-grade laboratory examination management system built with modern technologies. Designed for medical laboratories to manage patients, exams, results, invoices, and reporting with professional-grade security and performance.

## 🎯 Features

### Core Features
- ✅ **Patient Management**: Full CRUD operations with search and filtering
- ✅ **Exam Management**: Catalog of tests with templates and categories
- ✅ **Result Management**: Track and report exam results
- ✅ **Invoice Management**: Automated billing and payment tracking
- ✅ **User Management**: Role-based access control (RBAC)
- ✅ **Analytics Dashboard**: Real-time KPIs and trend reports

### Security Features
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Two-Factor Authentication**: Email-based OTP for enhanced security
- ✅ **Audit Logging**: Complete audit trail of all actions
- ✅ **Role-Based Access Control**: Admin, Doctor, Technician, Receptionist roles
- ✅ **OWASP Top 10 Protection**: SQL injection, XSS, CSRF, etc.
- ✅ **Rate Limiting**: API rate limiting and DDoS protection

### Performance Features
- ✅ **Optimized Database Queries**: Indexed queries and connection pooling
- ✅ **Caching Strategy**: Smart caching for frequently accessed data
- ✅ **Code Splitting**: Frontend optimized with lazy loading
- ✅ **Image Optimization**: Next.js Image component for performance
- ✅ **LCP < 2.5s, FID < 100ms**: Mobile-optimized performance

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Testing](#testing)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Automated Setup

**Linux / macOS:**
```bash
cd laboratoire-examens
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
cd laboratoire-examens
setup.bat
```

Then follow the prompts to complete setup!

### Manual Quick Start

```bash
# 1. Database
psql -U postgres -c "CREATE DATABASE laboratoire_examens;"

# 2. Backend (Terminal 1)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env with your settings
uvicorn app.main:app --reload

# 3. Frontend (Terminal 2)
cd frontend
npm install
cp ../.env.example .env.local
# Edit .env.local with your settings
npm run dev
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📦 Installation

### System Requirements

```bash
# Check Python
python3 --version  # Should be 3.11+

# Check Node.js
node --version  # Should be 18+

# Check PostgreSQL
psql --version  # Should be 14+
```

### Setup Guide

For detailed setup instructions, see [README_LOCAL_SETUP.md](./README_LOCAL_SETUP.md)

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14+ with React 18+
- TypeScript 5+
- Tailwind CSS 3+
- React Hook Form + Zod
- Recharts for analytics
- Framer Motion for animations

**Backend:**
- FastAPI 0.100+
- SQLAlchemy 2.0+ ORM
- Pydantic 2.0+ validation
- PostgreSQL 14+
- Python-jose + Passlib for auth

### System Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │◄───────►│   Backend   │◄───────►│  Database   │
│  (Next.js)  │         │  (FastAPI)  │         │ (PostgreSQL)│
└─────────────┘         └─────────────┘         └─────────────┘
      ▲                        ▲
      │                        │
      └────────────────────────┘
         HTTP/HTTPS REST API
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture diagrams.

## 📚 API Documentation

### Quick Examples

**Register:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**List Patients:**
```bash
curl -X GET http://localhost:8000/api/v1/patients?page=1&limit=10 \
  -H "Authorization: Bearer <access_token>"
```

### Full API Documentation

- **Interactive Swagger UI**: http://localhost:8000/docs
- **API Reference**: [API.md](./API.md)

## 👨‍💻 Development

### Project Structure

```
laboratoire-examens/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utilities
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── frontend/                # Next.js frontend
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   └── __tests__/          # Frontend tests
├── README_LOCAL_SETUP.md    # Detailed setup guide
├── setup.sh                 # Linux/macOS setup script
├── setup.bat                # Windows setup script
└── documentation files
```

### Available Commands

**Backend:**
```bash
cd backend
source venv/bin/activate  # Activate virtual environment

# Development
uvicorn app.main:app --reload

# Testing
pytest
pytest --cov=app

# Code quality
flake8 app/
black app/
```

**Frontend:**
```bash
cd frontend

# Development
npm run dev

# Production build
npm run build
npm start

# Testing
npm test
npm run test:coverage

# Code quality
npm run lint
npm run type-check
```

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Test Coverage

- Backend: 70%+ coverage
- Frontend: 60%+ coverage for components

See [TESTING.md](./TESTING.md) for detailed testing guide.

## 🔒 Security

### Security Features

✅ OWASP Top 10 Protection
✅ JWT Token Authentication  
✅ Two-Factor Authentication (2FA)
✅ Role-Based Access Control (RBAC)
✅ Audit Logging
✅ SQL Injection Prevention
✅ XSS Protection
✅ CSRF Protection
✅ Rate Limiting
✅ Security Headers

### Compliance

- GDPR: Data privacy and processing
- HIPAA: Protected health information
- ISO 27001: Information security
- SOC 2: Security and availability

See [SECURITY.md](./SECURITY.md) for comprehensive security guide.

## ⚡ Performance

### Metrics

| Metric | Target | Status |
|--------|--------|--------|
| LCP | < 2.5s | ✅ |
| FID | < 100ms | ✅ |
| CLS | < 0.1 | ✅ |
| TTI | < 3s | ✅ |
| Bundle Size | < 500kb | ✅ |

See [PERFORMANCE.md](./PERFORMANCE.md) for optimization details.

## 📖 Documentation

- [README_LOCAL_SETUP.md](./README_LOCAL_SETUP.md) - Complete setup guide
- [API.md](./API.md) - Complete API reference
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and architecture
- [SECURITY.md](./SECURITY.md) - Security measures and compliance
- [TESTING.md](./TESTING.md) - Testing strategies and tools
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [PERFORMANCE.md](./PERFORMANCE.md) - Performance optimization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 📞 Support

- Issues: GitHub Issues
- Email: support@laboratoire-examens.com
- Documentation: [Documentation Site](https://docs.laboratoire-examens.com)

## 👥 Authors

- **Nouradine Zakaria Mahamat** - Initial work

---

**Made with ❤️ for healthcare professionals**
