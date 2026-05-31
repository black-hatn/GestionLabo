# Architecture Guide - Laboratoire Examens

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Next.js 14+ Frontend (React 18+)            │  │
│  │  - Dashboard, Pages, Components                     │  │
│  │  - State Management (Hooks)                         │  │
│  │  - Tailwind CSS Styling                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│               API GATEWAY LAYER (Nginx)                     │
│  - Reverse proxy                                            │
│  - Load balancing                                           │
│  - SSL termination                                          │
│  - Rate limiting                                            │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                  APPLICATION LAYER                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        FastAPI Backend (Python 3.11+)               │  │
│  │                                                      │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  API Endpoints (/api/v1/)                   │   │  │
│  │  │  - Authentication                           │   │  │
│  │  │  - Patients CRUD                            │   │  │
│  │  │  - Exams CRUD                               │   │  │
│  │  │  - Results CRUD                             │   │  │
│  │  │  - Invoices CRUD                            │   │  │
│  │  │  - Analytics/Reports                        │   │  │
│  │  │  - Users Management                         │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                      ↓                              │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  Business Logic Layer (Services)            │   │  │
│  │  │  - PatientService                           │   │  │
│  │  │  - ExamService                              │   │  │
│  │  │  - ResultService                            │   │  │
│  │  │  - InvoiceService                           │   │  │
│  │  │  - AnalyticsService                         │   │  │
│  │  │  - AuthenticationService                    │   │  │
│  │  │  - TwoFactorService                         │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                      ↓                              │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  Data Access Layer (Repositories)           │   │  │
│  │  │  - SQLAlchemy ORM                           │   │  │
│  │  │  - Query builders                           │   │  │
│  │  │  - Data validators (Pydantic)               │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  │                      ↓                              │  │
│  │  ┌─────────────────────────────────────────────┐   │  │
│  │  │  Middleware & Utilities                     │   │  │
│  │  │  - Security headers                         │   │  │
│  │  │  - Error handling                           │   │  │
│  │  │  - Audit logging                            │   │  │
│  │  │  - Rate limiting                            │   │  │
│  │  └─────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATA LAYER                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │    PostgreSQL 14+ Database                          │  │
│  │    - Patient records                                │  │
│  │    - Exam templates & requests                      │  │
│  │    - Results & reports                              │  │
│  │    - Invoices & payments                            │  │
│  │    - User accounts & roles                          │  │
│  │    - Audit logs                                     │  │
│  │    - Session management                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

### Backend
```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── patients.py
│   │       │   ├── exams.py
│   │       │   ├── results.py
│   │       │   └── invoices.py
│   │       └── deps.py
│   ├── config/
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── patient.py
│   │   ├── exam.py
│   │   ├── result.py
│   │   └── invoice.py
│   ├── schemas/
│   │   ├── domain.py
│   │   └── common.py
│   ├── services/
│   │   ├── patient_service.py
│   │   ├── exam_service.py
│   │   └── invoice_service.py
│   ├── utils/
│   │   ├── audit_log.py
│   │   ├── two_factor.py
│   │   ├── validators.py
│   │   └── errors.py
│   ├── middleware/
│   │   └── security.py
│   └── main.py
├── tests/
│   ├── test_auth.py
│   ├── test_patients.py
│   └── test_invoices.py
└── requirements.txt
```

### Frontend
```
frontend/
├── app/
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── patients/
│   │   ├── exams/
│   │   ├── results/
│   │   ├── invoices/
│   │   ├── analytics/
│   │   ├── settings/
│   │   └── layout.tsx
│   ├── auth/
│   │   ├── login/
│   │   └── register/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── dashboard-shell.tsx
│   ├── sidebar.tsx
│   └── forms/
├── hooks/
│   ├── useApi.ts
│   ├── usePagination.ts
│   ├── useSearch.ts
│   └── useAuth.ts
├── services/
│   └── api/
│       ├── patient.ts
│       ├── exam.ts
│       ├── result.ts
│       └── invoice.ts
├── lib/
│   ├── animations.ts
│   └── utils.ts
├── __tests__/
└── tailwind.config.js
```

## Data Models

### Core Entities

```
User
├── id (UUID)
├── email
├── password_hash
├── first_name
├── last_name
├── role (ADMIN, DOCTOR, TECHNICIAN, RECEPTIONIST)
├── is_active
├── created_at
└── updated_at

Patient
├── id (UUID)
├── first_name
├── last_name
├── email
├── phone
├── date_of_birth
├── address
├── city
├── notes
├── created_at
└── updated_at

Exam
├── id (UUID)
├── name
├── description
├── category
├── unit
├── reference_min
├── reference_max
├── created_at
└── updated_at

Result
├── id (UUID)
├── patient_id (FK)
├── exam_id (FK)
├── value
├── status (NORMAL, ABNORMAL, CRITICAL)
├── notes
├── created_at
└── updated_at

Invoice
├── id (UUID)
├── patient_id (FK)
├── number
├── amount
├── tax_amount
├── total_amount
├── status (DRAFT, SENT, PAID, OVERDUE)
├── due_date
├── paid_date
├── created_at
└── updated_at

AuditLog
├── id (UUID)
├── user_id (FK)
├── action
├── resource_type
├── resource_id
├── details
├── status
├── created_at
└── ip_address
```

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
POST   /api/v1/auth/2fa/request-otp
POST   /api/v1/auth/2fa/verify-otp
```

### Patients
```
GET    /api/v1/patients
POST   /api/v1/patients
GET    /api/v1/patients/{id}
PUT    /api/v1/patients/{id}
DELETE /api/v1/patients/{id}
```

### Exams
```
GET    /api/v1/exams
POST   /api/v1/exams
GET    /api/v1/exams/{id}
PUT    /api/v1/exams/{id}
DELETE /api/v1/exams/{id}
```

### Results
```
GET    /api/v1/results
POST   /api/v1/results
GET    /api/v1/results/{id}
PUT    /api/v1/results/{id}
DELETE /api/v1/results/{id}
```

### Invoices
```
GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/{id}
PUT    /api/v1/invoices/{id}
DELETE /api/v1/invoices/{id}
POST   /api/v1/invoices/{id}/mark-paid
```

## Design Patterns

### Service Layer Pattern
- Business logic separated from endpoints
- Reusable service methods
- Dependency injection for testability

### Repository Pattern
- Data access abstraction
- Query building centralized
- Easy to switch backends

### Schema Validation Pattern
- Pydantic for input validation
- Type safety throughout
- Automatic API documentation

### Middleware Pattern
- Cross-cutting concerns
- Security headers
- Request/response logging
- Error handling

## Technology Stack

### Backend
- Framework: FastAPI 0.100+
- ORM: SQLAlchemy 2.0+
- Database: PostgreSQL 14+
- Auth: Python-jose + Passlib
- Validation: Pydantic 2.0+
- Testing: Pytest + Coverage
- Server: Gunicorn + Uvicorn

### Frontend
- Framework: Next.js 14+
- UI: React 18+
- Language: TypeScript 5+
- Styling: Tailwind CSS 3+
- Forms: React Hook Form + Zod
- Charts: Recharts
- Animations: Framer Motion
- Testing: Vitest + React Testing Library

### DevOps & Hébergement
- Serveur : Bare Metal ou VM Linux (Ubuntu 22.04 LTS)
- Serveur HTTP / Reverse Proxy : Nginx
- Gestion des Processus : Systemd
- CI/CD : GitHub Actions
- Base de données : PostgreSQL 14+ (Local ou RDS)

## Deployment Architecture

### Development
- Services locaux démarrés séparément (Uvicorn pour le Backend, Next.js Dev Server pour le Frontend)
- Base de données PostgreSQL locale sur localhost
- Hot reload actif sur les deux applications

### Production
- Processus supervisés par Systemd
- Reverse proxy sécurisé via Nginx avec terminaison SSL Let's Encrypt
- Isolation des environnements via Python Virtualenv (`.venv`) et Node.js (`npm run build`)
- Sauvegardes de bases de données régulières via Cron (pg_dump)

## Performance Considerations

### Frontend
- Code splitting per route
- Image optimization
- Lazy loading components
- Memoization of expensive components
- Virtual scrolling for large lists

### Backend
- Database indexing on frequently queried fields
- Connection pooling
- Query optimization
- Caching layer (Redis optional)
- Rate limiting

### Database
- Indexes on foreign keys
- Partitioning for large tables
- Regular VACUUM/ANALYZE
- Query monitoring

## Scalability

### Horizontal Scaling
- Stateless backend services
- Load balancer distributes requests
- Database replication for read scaling

### Vertical Scaling
- Increase server resources
- Larger database server
- Additional worker processes

### Caching Strategy
- Frontend: Browser cache + HTTP caching
- Backend: Redis for session/data cache
- Database: Query result caching

## Disaster Recovery

### Backup Strategy
- Daily automated backups
- 7-day retention for daily backups
- 30-day retention for weekly backups
- Monthly archive to cold storage

### Recovery Procedures
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Regular restore drills
- Documented runbooks
