# API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

All API requests require JWT authentication via Bearer token:

```
Authorization: Bearer <access_token>
```

### Obtaining Tokens

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "DOCTOR"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "DOCTOR"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

#### Two-Factor Authentication

Request OTP:
```http
POST /auth/2fa/request-otp
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "OTP sent successfully"
}
```

Verify OTP:
```http
POST /auth/2fa/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer"
}
```

## Endpoints

### Patients

#### List Patients
```http
GET /patients?page=1&limit=10&search=john

Response: 200 OK
{
  "items": [
    {
      "id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "date_of_birth": "1990-01-01",
      "address": "123 Main St",
      "city": "New York",
      "notes": "Allergic to penicillin",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

#### Get Patient
```http
GET /patients/{id}

Response: 200 OK
{
  "id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01",
  "address": "123 Main St",
  "city": "New York",
  "notes": "Allergic to penicillin",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### Create Patient
```http
POST /patients
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane@example.com",
  "phone": "+0987654321",
  "date_of_birth": "1992-05-20",
  "address": "456 Oak Ave",
  "city": "Boston",
  "notes": "None"
}

Response: 201 Created
{
  "id": "uuid",
  "first_name": "Jane",
  ...
}
```

#### Update Patient
```http
PUT /patients/{id}
Content-Type: application/json

{
  "first_name": "Janet",
  "notes": "Updated notes"
}

Response: 200 OK
{
  "id": "uuid",
  "first_name": "Janet",
  ...
}
```

#### Delete Patient
```http
DELETE /patients/{id}

Response: 200 OK
{
  "message": "Patient deleted successfully"
}
```

### Exams

#### List Exams
```http
GET /exams?page=1&limit=10

Response: 200 OK
{
  "items": [
    {
      "id": "uuid",
      "name": "Complete Blood Count",
      "description": "Full blood test",
      "category": "Hematology",
      "unit": "cells/µL",
      "reference_min": 4500,
      "reference_max": 11000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

#### Create Exam
```http
POST /exams
Content-Type: application/json

{
  "name": "Glucose Test",
  "description": "Blood glucose level",
  "category": "Chemistry",
  "unit": "mg/dL",
  "reference_min": 70,
  "reference_max": 100
}

Response: 201 Created
{
  "id": "uuid",
  "name": "Glucose Test",
  ...
}
```

### Results

#### List Results
```http
GET /results?page=1&limit=10

Response: 200 OK
{
  "items": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "exam_id": "uuid",
      "value": 95.5,
      "status": "NORMAL",
      "notes": "Within normal range",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

#### Create Result
```http
POST /results
Content-Type: application/json

{
  "patient_id": "uuid",
  "exam_id": "uuid",
  "value": 92.3,
  "status": "NORMAL",
  "notes": "Test completed successfully"
}

Response: 201 Created
{
  "id": "uuid",
  "patient_id": "uuid",
  ...
}
```

### Invoices

#### List Invoices
```http
GET /invoices?page=1&limit=10&status_filter=DRAFT

Response: 200 OK
{
  "items": [
    {
      "id": "uuid",
      "patient_id": "uuid",
      "number": "INV-20240115100000",
      "amount": 150.00,
      "tax_amount": 15.00,
      "total_amount": 165.00,
      "status": "DRAFT",
      "due_date": "2024-02-15",
      "paid_date": null,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

#### Create Invoice
```http
POST /invoices
Content-Type: application/json

{
  "patient_id": "uuid",
  "amount": 200.00,
  "tax_amount": 20.00,
  "total_amount": 220.00,
  "due_date": "2024-02-15",
  "notes": "Lab work"
}

Response: 201 Created
{
  "id": "uuid",
  "number": "INV-20240115100001",
  ...
}
```

#### Mark Invoice as Paid
```http
POST /invoices/{id}/mark-paid

Response: 200 OK
{
  "message": "Invoice marked as paid"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid credentials"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 409 Conflict
```json
{
  "detail": "Resource already exists"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 204 | No Content - Request successful, no response body |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid authentication |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

## Rate Limiting

All API requests are rate-limited to 100 requests per minute per user.

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

## Pagination

All list endpoints support pagination:

Parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

Response:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

## Filtering & Search

### Search
Supported on most list endpoints:
```
GET /patients?search=john
```

### Status Filter
```
GET /invoices?status_filter=PAID
```

### Date Range Filter
```
GET /results?start_date=2024-01-01&end_date=2024-01-31
```

## Interactive API Documentation

Swagger UI: `http://localhost:8000/docs`
ReDoc: `http://localhost:8000/redoc`

## SDK / Client Libraries

### JavaScript/TypeScript
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get patients
const patients = await api.get('/patients?page=1&limit=10');
```

### Python
```python
import requests

headers = {
    'Authorization': f'Bearer {access_token}',
}

response = requests.get(
    'http://localhost:8000/api/v1/patients',
    headers=headers,
)
patients = response.json()
```

## Best Practices

1. Always include `Authorization` header
2. Handle rate limiting (429) gracefully
3. Implement retry logic with exponential backoff
4. Validate input before sending requests
5. Cache responses when appropriate
6. Use pagination for large datasets
7. Handle errors gracefully
