# Testing Guide - Laboratoire Examens

## Overview

This document outlines the testing strategy, tools, and best practices for the Laboratoire Examens application.

## Testing Framework

### Backend
- **Framework**: Pytest
- **Coverage Tool**: pytest-cov
- **Test Location**: `backend/tests/`

### Frontend
- **Framework**: Vitest
- **Component Testing**: React Testing Library
- **E2E Testing**: Playwright (optional)
- **Test Location**: `frontend/__tests__/`

## Running Tests

### Backend Tests

```bash
cd backend
# Run all tests
pytest

# Run with coverage report
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_login_success
```

### Frontend Tests

```bash
cd frontend
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Test Structure

### Backend Test Example

```python
import pytest
from fastapi.testclient import TestClient

def test_patient_creation(client: TestClient, db):
    """Test creating a new patient"""
    response = client.post(
        "/api/v1/patients",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
```

### Frontend Test Example

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

## Coverage Targets

- Backend: 70%+ coverage
- Frontend: 60%+ coverage for components
- Critical paths: 90%+ coverage

## Testing Best Practices

1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test API endpoints with database
3. **E2E Tests**: Test complete user workflows
4. **Mocking**: Mock external services and API calls
5. **Fixtures**: Use reusable test data fixtures

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Nightly test runs

See `.github/workflows/ci.yml` for CI configuration.

## Test Categories

### Authentication Tests
- User registration
- User login
- Token refresh
- 2FA verification
- Logout

### Patient CRUD Tests
- Create patient
- Read patient
- Update patient
- Delete patient
- Search/filter patients

### Exam Tests
- Create exam
- List exams
- Update exam
- Delete exam

### Invoice Tests
- Create invoice
- List invoices
- Mark as paid
- Delete invoice

### Error Handling Tests
- 404 errors
- 400 validation errors
- 401 unauthorized
- 500 server errors

## Debugging Tests

```bash
# Run tests with verbose output
pytest -v

# Run tests with print statements
pytest -s

# Stop on first failure
pytest -x

# Show local variables on failure
pytest -l
```

## Performance Tests

```bash
# Time each test
pytest --durations=10

# Profile slow tests
pytest --profile
```
