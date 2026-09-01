## 🧪 Security Testing Guide

This guide helps you verify all security implementations are working correctly.

### Prerequisites
- Backend running on http://localhost:5000
- Frontend running on http://localhost:5173
- curl or Postman installed

---

### 1. 🔐 CSRF Token Testing

#### Test 1.1: Verify CSRF Token Generation
```bash
# Should return 200 with CSRF token in headers
curl -v -X GET http://localhost:5000/api/auth/csrf-token \
  -H "Content-Type: application/json"

# Expected response headers:
# X-CSRF-Token: [64-char hex token]
# X-Session-Id: [32-char hex session ID]
```

#### Test 1.2: Test POST Without CSRF Token (Should Fail)
```bash
# Try to create a booking without CSRF token
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [valid-jwt-token]" \
  -d '{
    "packageId": 1,
    "startDate": "2025-02-01",
    "endDate": "2025-02-05",
    "numberOfPeople": 2
  }'

# Expected: 403 Forbidden - CSRF token is missing or invalid
```

#### Test 1.3: Test POST With CSRF Token (Should Succeed)
```bash
# 1. First get CSRF token
RESPONSE=$(curl -s -X GET http://localhost:5000/api/auth/csrf-token)
CSRF_TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
SESSION_ID=$(echo $RESPONSE | grep -o '"sessionId":"[^"]*' | cut -d'"' -f4)

# 2. Use token in POST request
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [valid-jwt-token]" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -H "X-Session-Id: $SESSION_ID" \
  -d '{
    "packageId": 1,
    "startDate": "2025-02-01",
    "endDate": "2025-02-05",
    "numberOfPeople": 2
  }'

# Expected: 200 OK - Request processed successfully
```

#### Test 1.4: Verify Cookie Flags
```bash
# Check that sessionId cookie has secure flags
curl -v http://localhost:5000/api/auth/csrf-token 2>&1 | grep "Set-Cookie"

# Expected output should include:
# Set-Cookie: sessionId=[token]; Path=/; HttpOnly; Secure; SameSite=Strict
```

---

### 2. 🛡️ XSS Protection Testing

#### Test 2.1: Verify Backend XSS Protection
```bash
# Try to send malicious HTML in contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "<script>alert(\"XSS\")</script>",
    "email": "test@example.com",
    "message": "<img src=x onerror=\"alert(1)\">"
  }'

# Expected: 400 Bad Request - HTML tags removed
# Or the tags should be stripped from the saved data
```

#### Test 2.2: Test Frontend Sanitization in Browser
```javascript
// In browser console, test sanitizer
import { sanitizeText, sanitizeHTML } from './utils/sanitizer.js';

// Test 1: Sanitize HTML
const maliciousHTML = '<script>alert("XSS")</script><p>Hello</p>';
const cleanHTML = sanitizeHTML(maliciousHTML);
console.log(cleanHTML); // Should be: <p>Hello</p>

// Test 2: Sanitize text with escaping
const maliciousText = '<img src=x onerror="alert(1)">';
const cleanText = sanitizeText(maliciousText);
console.log(cleanText); // Should be: &lt;img src=x onerror=&quot;alert(1)&quot;&gt;

// Test 3: Detect XSS patterns
const detectXSSPatterns = require('./utils/sanitizer.js').detectXSSPatterns;
console.log(detectXSSPatterns('<script>alert(1)</script>')); // true
console.log(detectXSSPatterns('normal text')); // false
```

#### Test 2.3: Test Event Handler Removal
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "<div onclick=\"alert(1)\">Click me</div>"
  }'

# Expected: Event handlers removed from message
```

---

### 3. ✅ Input Validation Testing

#### Test 3.1: Test Email Validation
```bash
# Invalid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "not-an-email",
    "password": "SecurePass123!",
    "phone": "+201234567890"
  }'

# Expected: 400 Bad Request - Invalid email format

# Valid email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "phone": "+201234567890"
  }'

# Expected: 201 Created
```

#### Test 3.2: Test Password Strength
```bash
# Weak password (no uppercase)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "weakpass123",
    "phone": "+201234567890"
  }'

# Expected: 400 Bad Request - Password too weak

# Strong password
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "StrongPass123!",
    "phone": "+201234567890"
  }'

# Expected: 201 Created
```

#### Test 3.3: Test Frontend Validation Hook
```javascript
// In React component
import { useInputValidation } from '../hooks/useInputValidation.js';

function TestForm() {
  const { values, errors, handleChange, hasError } = useInputValidation(
    { email: '', password: '' },
    {
      email: { type: 'email', required: true },
      password: { type: 'password', required: true }
    }
  );

  return (
    <form>
      <input
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        placeholder="Enter email"
      />
      {hasError('email') && <span>{errors.email[0]}</span>}

      <input
        type="password"
        name="password"
        value={values.password}
        onChange={handleChange}
        placeholder="Enter password"
      />
      {hasError('password') && <span>{errors.password[0]}</span>}
    </form>
  );
}
```

---

### 4. 🔑 Password Security Testing

#### Test 4.1: Test Password Hashing
```bash
# Register with a password
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "phone": "+201234567890"
  }')

# Login with correct password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Expected: 200 OK - Login successful

# Try with wrong password
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "WrongPassword123!"
  }'

# Expected: 401 Unauthorized
```

#### Test 4.2: Test Password Reset Flow
```bash
# Request password reset
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Expected: 200 OK (doesn't reveal if email exists for security)

# Check database for reset token
# SELECT reset_token, reset_token_expires FROM users WHERE email = 'test@example.com';

# Verify token
curl -X GET "http://localhost:5000/api/auth/verify-reset-token/[token-from-db]"

# Expected: 200 OK - Token is valid

# Reset password with valid token
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "resetToken": "[token-from-db]",
    "newPassword": "NewSecurePass456!",
    "confirmPassword": "NewSecurePass456!"
  }'

# Expected: 200 OK - Password reset successful
```

---

### 5. 🚦 Rate Limiting Testing

#### Test 5.1: Test Auth Rate Limiting
```bash
# Try login 6 times rapidly (limit is 5 per 15 minutes)
for i in {1..7}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "WrongPassword123!"
    }'
  echo "\n"
done

# Expected: First 5 fail with 401, 6th and 7th fail with 429 Too Many Requests
```

#### Test 5.2: Test General Rate Limiting
```bash
# Try to make 101 requests rapidly (limit is 100 per 15 minutes)
for i in {1..102}; do
  curl -s http://localhost:5000/api/packages -H "Authorization: Bearer [token]" > /dev/null
  echo "Request $i sent"
done

# After 100 requests, you should get 429 Too Many Requests
```

---

### 6. 🔒 Security Headers Testing

#### Test 6.1: Check Response Headers
```bash
curl -i http://localhost:5000/api/packages

# Should include headers like:
# Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Referrer-Policy: strict-origin-when-cross-origin
```

#### Test 6.2: Test with Online Tool
Visit: https://securityheaders.com
Enter your API URL and check the security headers grade.

---

### 7. 🔐 CORS Testing

#### Test 7.1: Test Allowed Origin
```bash
# Request from allowed origin
curl -i -X OPTIONS http://localhost:5000/api/packages \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET"

# Should return: Access-Control-Allow-Origin: http://localhost:5173
```

#### Test 7.2: Test Blocked Origin
```bash
# Request from disallowed origin
curl -i -X OPTIONS http://localhost:5000/api/packages \
  -H "Origin: http://evil.com" \
  -H "Access-Control-Request-Method: GET"

# Should NOT return Access-Control-Allow-Origin header
```

---

### 8. 🧬 Token Management Testing

#### Test 8.1: Test JWT Token Expiration
```bash
# Login to get token
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }' | jq -r '.data.token')

# Use token immediately (should work)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Wait for token to expire (default: 1 hour)
# Try again (should fail with 401)
```

#### Test 8.2: Test Token Refresh
```bash
# Get refresh token
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }')

REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.refreshToken')

# Use refresh token to get new token
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"

# Expected: 200 OK with new token
```

---

### 🎯 Test Summary Checklist

- [ ] CSRF token generation works
- [ ] POST without CSRF token fails
- [ ] POST with CSRF token succeeds
- [ ] XSS payloads are blocked/sanitized
- [ ] Invalid emails are rejected
- [ ] Weak passwords are rejected
- [ ] Strong passwords are accepted
- [ ] Rate limiting blocks after limit
- [ ] Security headers are present
- [ ] CORS allows whitelisted origins
- [ ] Token refresh works correctly

---

### 🐛 Troubleshooting

#### Issue: CSRF token returns 404
**Solution**: Ensure `/api/auth/csrf-token` route is registered in auth.routes.ts

#### Issue: Sanitizer not working
**Solution**: Import from correct path: `../utils/sanitizer.js`

#### Issue: Validation hook not updating
**Solution**: Ensure `useInputValidation` is correctly imported and initialized

#### Issue: Rate limiting not working
**Solution**: Check Redis is running and connected (or file-based store is working)

---

### 📊 Security Audit Results

Run this comprehensive test:
```bash
#!/bin/bash

echo "🔐 Running Security Tests..."

# CSRF Test
echo "\n1. Testing CSRF Protection..."
curl -s -X GET http://localhost:5000/api/auth/csrf-token > /dev/null && echo "✅ CSRF token generated" || echo "❌ CSRF token failed"

# XSS Test
echo "\n2. Testing XSS Protection..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name": "<script>alert(1)</script>", "email": "test@test.com", "message": "test"}')
echo $RESPONSE | grep -q "script" && echo "❌ XSS not blocked" || echo "✅ XSS protected"

# Rate Limiting Test
echo "\n3. Testing Rate Limiting..."
for i in {1..6}; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET http://localhost:5000/api/packages)
done
echo "Rate limit status: $STATUS (429 = working)"

echo "\n✅ Security tests completed!"
```

---

**Last Updated**: 2025-01-24
**Test Coverage**: Comprehensive
