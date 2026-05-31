# Security Guide - Laboratoire Examens

## Overview

This document details the security measures implemented in the Laboratoire Examens application.

## Authentication & Authorization

### JWT Token Implementation
- Access tokens: 15 minutes expiration
- Refresh tokens: 7 days expiration
- Tokens signed with HS256 algorithm
- Secure storage in httpOnly cookies

### Two-Factor Authentication (2FA)
- Email-based OTP (One-Time Password)
- 6-digit codes
- 10-minute validity window
- 3 attempt limit per request

### Role-Based Access Control (RBAC)
```
Roles:
- ADMIN: Full system access
- DOCTOR: View/manage patients, create exams
- TECHNICIAN: Run exams, input results
- RECEPTIONIST: Manage appointments, create invoices
```

## Data Protection

### Encryption
- HTTPS enforced in production
- Passwords hashed with bcrypt (salt rounds: 10)
- Sensitive data encrypted at rest
- Database backups encrypted

### SQL Injection Prevention
- SQLAlchemy ORM prevents SQL injection
- Parameterized queries throughout
- Input validation on all endpoints

### Cross-Site Scripting (XSS) Prevention
- Input sanitization
- Output encoding
- Content Security Policy headers
- No inline scripts

### Cross-Site Request Forgery (CSRF) Protection
- CSRF token validation
- SameSite cookie attribute
- Secure cookie headers

## API Security

### Rate Limiting
- 100 requests per minute per user
- 1000 requests per hour per IP
- Exponential backoff on repeated failures

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### API Validation
- Pydantic schema validation
- Type checking
- Required field validation
- Length and format validation

## Audit Logging

### Logged Actions
- User login/logout
- Data creation/modification/deletion
- Failed authentication attempts
- Admin actions
- Access to sensitive data

### Log Storage
- Stored in database with encryption
- 1-year retention policy
- Regular backup and archival
- Tamper detection monitoring

## Environment Security

### Secrets Management
```
Sensitive variables in .env:
- DATABASE_URL
- SECRET_KEY
- JWT_SECRET
- API_KEY
- EMAIL_PASSWORD
```

### Environment Isolation
- Development, staging, production separate
- Unique secrets per environment
- No secrets in version control
- Regular secret rotation

## Dependency Security

### Vulnerability Scanning
- Weekly dependency audits
- Automated updates for patches
- Security advisories monitoring
- SBOM (Software Bill of Materials)

### Approved Dependencies
All dependencies in `requirements.txt` and `package.json` are:
- Actively maintained
- From official sources
- Regularly updated
- Vulnerability-free

## Password Policy

### Requirements
- Minimum 8 characters
- Uppercase letter required
- Lowercase letter required
- Number required
- Special character required
- No dictionary words

### Management
- Password history: Last 5 passwords cannot be reused
- Expiration: 90 days
- Reset link valid for 24 hours
- Automatic logout after 30 minutes inactivity

## Database Security

### Access Control
- User authentication required
- Row-level security for patient data
- Encrypted connections only
- IP whitelist for admin access

### Backup Security
- Daily automated backups
- Encrypted storage
- Offsite replication
- Quarterly restore tests

## File Upload Security

### Validation
- File type whitelist
- File size limits (10MB max)
- Scan for malware
- Rename uploaded files

### Storage
- Outside web root
- Separate storage backend
- Access logging
- Expiration cleanup

## OWASP Top 10 Compliance

1. **SQL Injection**: ✅ Parameterized queries
2. **Broken Authentication**: ✅ JWT + 2FA
3. **Sensitive Data**: ✅ Encryption
4. **XXE**: ✅ Input validation
5. **Broken Access Control**: ✅ RBAC
6. **XSS**: ✅ Input sanitization
7. **CSRF**: ✅ Token protection
8. **Deserialization**: ✅ Strict validation
9. **Vulnerable Components**: ✅ Regular audits
10. **Logging**: ✅ Comprehensive audit trail

## Compliance Standards

- GDPR: Data privacy and processing
- HIPAA: Protected health information
- ISO 27001: Information security
- SOC 2: Security and availability

## Incident Response

### Procedures
1. Detect incident
2. Isolate affected systems
3. Assess impact
4. Notify stakeholders
5. Fix vulnerability
6. Deploy patch
7. Verify fix
8. Post-incident review

### Contact
- Security email: security@laboratoire.com
- Emergency hotline: +1-XXX-XXX-XXXX
- On-call engineer: Page via PagerDuty

## Security Checklist

### Before Deployment
- [ ] All dependencies updated
- [ ] Security headers configured
- [ ] SSL certificate valid
- [ ] Secrets not in code
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] Backups tested
- [ ] Security tests passed

### Regular Tasks
- [ ] Weekly vulnerability scans
- [ ] Monthly penetration testing
- [ ] Quarterly security audit
- [ ] Annual compliance review
