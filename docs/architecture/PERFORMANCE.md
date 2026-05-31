# Performance Optimization Guide

## Web Vitals

### Target Metrics

```
LCP (Largest Contentful Paint):    < 2.5s ✅
FID (First Input Delay):            < 100ms ✅
CLS (Cumulative Layout Shift):      < 0.1 ✅
TTI (Time to Interactive):          < 3s ✅
TTFB (Time to First Byte):          < 600ms ✅
Total Bundle Size:                  < 500kb ✅
```

## Frontend Performance

### Code Splitting

```typescript
// Lazy load components
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/charts/HeavyChart'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});
```

### Image Optimization

```typescript
import Image from 'next/image';

// Automatically optimizes image
<Image
  src="/patient-avatar.jpg"
  alt="Patient"
  width={200}
  height={200}
  priority={false}  // Only use priority for above-fold images
/>
```

### Component Memoization

```typescript
import { memo } from 'react';

const PatientCard = memo(({ patient }) => {
  return <div>{patient.name}</div>;
});
```

### Virtual Scrolling

For large lists (1000+ items):

```typescript
import { FixedSizeList as List } from 'react-window';

<List
  height={600}
  itemCount={patients.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {patients[index].name}
    </div>
  )}
</List>
```

### CSS-in-JS Optimization

```typescript
// Use Tailwind CSS classes instead of styled-components
// Tailwind is more performant for this use case
className="bg-primary-600 text-white px-4 py-2 rounded-lg"
```

## Backend Performance

### Database Optimization

#### Indexing Strategy

```sql
-- Index frequently queried fields
CREATE INDEX idx_patient_email ON patients(email);
CREATE INDEX idx_patient_created_at ON patients(created_at DESC);
CREATE INDEX idx_result_status ON results(status);
CREATE INDEX idx_invoice_patient_id ON invoices(patient_id);

-- Composite indexes for common queries
CREATE INDEX idx_patient_search ON patients(first_name, last_name);
CREATE INDEX idx_exam_category_status ON exams(category, status);
```

#### Query Optimization

```python
# ❌ Bad: N+1 query problem
patients = db.query(Patient).all()
for patient in patients:
    exams = db.query(Exam).filter(Exam.patient_id == patient.id).all()

# ✅ Good: Join query
patients = db.query(Patient).options(joinedload(Patient.exams)).all()
```

#### Connection Pooling

```python
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,           # Number of connections to pool
    max_overflow=40,        # Extra connections under load
    pool_recycle=3600,      # Recycle connections every hour
    pool_pre_ping=True,     # Verify connections before use
)
```

### Caching Strategy

#### Redis Cache

```python
from redis import Redis

redis_client = Redis(host='localhost', port=6379, db=0)

# Cache patient data for 5 minutes
def get_patient_cached(patient_id: str):
    cache_key = f"patient:{patient_id}"
    cached = redis_client.get(cache_key)
    
    if cached:
        return json.loads(cached)
    
    patient = db.get(Patient, patient_id)
    redis_client.setex(cache_key, 300, json.dumps(patient_dict))
    return patient
```

#### HTTP Caching Headers

```python
@router.get("/patients/{id}")
def get_patient(id: str, response: Response):
    response.headers["Cache-Control"] = "public, max-age=3600"
    return patient
```

### Rate Limiting

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.get("/patients")
@limiter.limit("100/minute")
def list_patients(request: Request):
    return patients
```

### Async Operations

```python
from fastapi import FastAPI
import asyncio

@router.post("/patients/{id}/send-report")
async def send_report(id: str):
    # Non-blocking email sending
    asyncio.create_task(send_email_async(id))
    return {"status": "Report sending..."}
```

## Database Performance

### Query Monitoring

```sql
-- Enable query logging
SET log_min_duration_statement = 100;  -- Log queries > 100ms

-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Maintenance

```bash
# Optimize database
VACUUM ANALYZE;

# Reindex if needed
REINDEX DATABASE laboratoire_examens;

# Check table sizes
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Infrastructure Performance

### Load Balancing

```nginx
# Nginx upstream configuration
upstream backend {
    least_conn;  # Use least connected algorithm
    server backend-1.local:8000 weight=1;
    server backend-2.local:8000 weight=1;
    server backend-3.local:8000 weight=1;
    keepalive 32;
}
```

### Compression

```nginx
# Enable Gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
gzip_comp_level 6;
```

### CDN Integration

```python
# CloudFront / CloudFlare configuration
STATIC_URL = "https://cdn.example.com/static/"

# In Next.js config
module.exports = {
  images: {
    domains: ['cdn.example.com'],
  },
}
```

## Monitoring & Profiling

### Frontend Monitoring

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);  // Cumulative Layout Shift
getFID(console.log);  // First Input Delay
getFCP(console.log);  // First Contentful Paint
getLCP(console.log);  // Largest Contentful Paint
getTTFB(console.log); // Time to First Byte
```

### Backend Profiling

```python
# Using Python profiler
from cProfile import Profile
from pstats import Stats

profiler = Profile()
profiler.enable()

# Code to profile
patients = db.query(Patient).all()

profiler.disable()
stats = Stats(profiler)
stats.sort_stats('cumulative')
stats.print_stats()
```

### Request Tracing

```python
import time
from fastapi import Request

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

## Benchmarking

### Load Testing

```bash
# Apache Bench
ab -n 1000 -c 100 http://localhost:8000/api/v1/patients

# Wrk
wrk -t4 -c100 -d30s http://localhost:8000/api/v1/patients

# Locust (Python)
locust -f locustfile.py --host=http://localhost:8000
```

### Results Interpretation

```
Requests/sec:    Number of successful requests per second
Time per request: Average time to process one request
Transfer rate:    Bytes per second
```

## Performance Checklist

### Frontend
- [ ] Code splitting enabled
- [ ] Images optimized with next/image
- [ ] Components memoized
- [ ] Lazy loading implemented
- [ ] CSS critical path optimized
- [ ] No console errors
- [ ] Web Vitals < targets
- [ ] Bundle size < 500kb

### Backend
- [ ] Database indexes created
- [ ] Query N+1 problems fixed
- [ ] Connection pooling configured
- [ ] Caching strategy implemented
- [ ] Gzip compression enabled
- [ ] Rate limiting enabled
- [ ] Async operations used
- [ ] Slow queries optimized

### Infrastructure
- [ ] Load balancer configured
- [ ] CDN setup for static assets
- [ ] Database replication enabled
- [ ] Backups automated
- [ ] Monitoring in place
- [ ] Alerting configured
- [ ] Disaster recovery tested

## Tools

### Frontend
- Lighthouse (Chrome DevTools)
- Web Vitals Extension
- Chrome DevTools Performance tab
- Webpack Bundle Analyzer

### Backend
- Django Debug Toolbar
- Py-Spy (Python profiler)
- pgBadger (PostgreSQL logs analyzer)
- New Relic / DataDog (APM)

### Infrastructure
- New Relic / DataDog / Prometheus
- Grafana (Visualization)
- ELK Stack (Logging)
- Jaeger (Distributed tracing)
