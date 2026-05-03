# Backend API Plan - Authentication System

## 1. API ENDPOINTS OVERVIEW

```
BASE_URL: http://localhost:8080/api

PUBLIC ENDPOINTS (No Authentication Required)
├── POST   /auth/login         - User login
├── POST   /auth/register      - User registration
├── POST   /auth/refresh       - Refresh expired token
└── POST   /auth/forgot-password - Request password reset

PROTECTED ENDPOINTS (Requires JWT Token)
├── POST   /auth/logout        - User logout
├── GET    /auth/me            - Get current user info
├── POST   /auth/change-password - Change password
├── GET    /auth/validate-token - Validate token (optional)
└── POST   /auth/revoke-token  - Revoke all tokens (optional)

EXISTING ENDPOINTS (Already implemented)
├── GET    /user               - Get all users
├── POST   /transaction        - Create transaction
├── GET    /transaction/:id    - Get transaction
├── PUT    /transaction/:id    - Update transaction
└── DELETE /transaction/:id    - Delete transaction
```

---

## 2. DETAILED ENDPOINT SPECIFICATIONS

### 2.1 LOGIN ENDPOINT

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "username": "john_doe",
  "password": "SecurePassword123!"
}
```

**Request Validation:**
- username: required, min 3 chars, max 50 chars
- password: required, min 6 chars, max 100 chars
- No spaces allowed in username

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "balance": 5000.00,
      "createdAt": "2026-04-19T10:30:00Z",
      "profileImage": "https://..."
    },
    "expiresIn": 900,
    "refreshExpiresIn": 604800
  }
}
```

**Error Response - Invalid Credentials (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid username or password",
  "code": "INVALID_CREDENTIALS",
  "data": null
}
```

**Error Response - Account Locked (423 Locked):**
```json
{
  "status": "error",
  "message": "Account locked. Try again after 15 minutes",
  "code": "ACCOUNT_LOCKED",
  "data": {
    "lockedUntil": "2026-04-19T11:00:00Z"
  }
}
```

**Error Response - Validation Error (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters"
    },
    {
      "field": "password",
      "message": "Password is required"
    }
  ]
}
```

**HTTP Status Codes:**
- `200 OK` - Successful login
- `400 Bad Request` - Invalid input/validation error
- `401 Unauthorized` - Invalid credentials
- `423 Locked` - Account locked due to failed attempts
- `500 Internal Server Error` - Server error

---

### 2.2 REGISTER ENDPOINT

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "agreeToTerms": true
}
```

**Request Validation:**
- username: required, min 3, max 50, alphanumeric + underscore only, unique
- email: required, valid email format, unique
- password: required, min 6, max 100, at least 1 uppercase, 1 number
- confirmPassword: must match password
- agreeToTerms: must be true

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "username": "jane_doe",
      "email": "jane@example.com",
      "role": "user",
      "balance": 0.00,
      "createdAt": "2026-04-19T10:30:00Z"
    },
    "expiresIn": 900
  }
}
```

**Error Response - Username Already Exists (409 Conflict):**
```json
{
  "status": "error",
  "message": "Username already exists",
  "code": "USERNAME_EXISTS",
  "data": null
}
```

**Error Response - Email Already Exists (409 Conflict):**
```json
{
  "status": "error",
  "message": "Email already exists",
  "code": "EMAIL_EXISTS",
  "data": null
}
```

---

### 2.3 REFRESH TOKEN ENDPOINT

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

**Error Response - Invalid Token (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Invalid or expired refresh token",
  "code": "INVALID_REFRESH_TOKEN",
  "data": null
}
```

---

### 2.4 LOGOUT ENDPOINT

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Logged out successfully",
  "data": null
}
```

**Error Response - Unauthorized (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Unauthorized. Token missing or invalid",
  "code": "UNAUTHORIZED",
  "data": null
}
```

---

### 2.5 GET CURRENT USER ENDPOINT

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "balance": 5000.00,
    "createdAt": "2026-04-19T10:30:00Z",
    "updatedAt": "2026-04-19T11:00:00Z"
  }
}
```

---

### 2.6 CHANGE PASSWORD ENDPOINT

**Endpoint:** `POST /api/auth/change-password`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password changed successfully",
  "data": null
}
```

**Error Response - Incorrect Current Password (401 Unauthorized):**
```json
{
  "status": "error",
  "message": "Current password is incorrect",
  "code": "INVALID_CURRENT_PASSWORD",
  "data": null
}
```

---

### 2.7 FORGOT PASSWORD ENDPOINT

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset link sent to your email",
  "data": null
}
```

**Note:** Always return success even if email doesn't exist (security best practice)

---

### 2.8 RESET PASSWORD ENDPOINT

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewPassword456!",
  "confirmPassword": "NewPassword456!"
}
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Password reset successfully",
  "data": null
}
```

**Error Response - Invalid or Expired Token (400 Bad Request):**
```json
{
  "status": "error",
  "message": "Reset token is invalid or expired",
  "code": "INVALID_RESET_TOKEN",
  "data": null
}
```

---

## 3. JWT TOKEN STRUCTURE

### 3.1 Access Token Payload
```json
{
  "sub": "1",                              // User ID
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "iat": 1713607800,                       // Issued at
  "exp": 1713608700,                       // Expiration (15 mins)
  "iss": "expense-tracker",                // Issuer
  "aud": "expense-tracker-users"           // Audience
}
```

### 3.2 Refresh Token Payload
```json
{
  "sub": "1",
  "type": "refresh",
  "iat": 1713607800,
  "exp": 1714212600,                       // Expiration (7 days)
  "iss": "expense-tracker"
}
```

### 3.3 Token Configuration
- **Access Token:** 15 minutes expiration
- **Refresh Token:** 7 days expiration
- **Algorithm:** HS256 (HMAC SHA-256) or RS256 (RSA)
- **Secret Key:** Generate strong random secret (minimum 256 bits)
- **Issuer:** "expense-tracker"
- **Audience:** "expense-tracker-users"

---

## 4. ERROR CODES & STATUS CODES

### 4.1 HTTP Status Codes
```
200 OK                    - Successful request
201 Created               - Resource created successfully
204 No Content            - Successful with no response body
400 Bad Request           - Invalid input/validation error
401 Unauthorized          - Authentication failed/token invalid
403 Forbidden             - Authenticated but not authorized
404 Not Found             - Resource not found
409 Conflict              - Resource already exists
423 Locked                - Account locked (too many attempts)
500 Internal Server Error - Server error
503 Service Unavailable   - Server temporarily unavailable
```

### 4.2 Custom Error Codes
```
VALIDATION_ERROR           - Input validation failed
INVALID_CREDENTIALS        - Wrong username/password
ACCOUNT_LOCKED             - Too many failed attempts
USERNAME_EXISTS            - Username already registered
EMAIL_EXISTS               - Email already registered
INVALID_REFRESH_TOKEN      - Refresh token invalid/expired
UNAUTHORIZED               - Token missing or invalid
INVALID_CURRENT_PASSWORD   - Current password incorrect
INVALID_RESET_TOKEN        - Reset token invalid/expired
ACCOUNT_NOT_FOUND          - User account not found
SESSION_EXPIRED            - Session timeout
TOKEN_REVOKED              - Token has been revoked
INVALID_REQUEST            - General invalid request
```

---

## 5. DATABASE SCHEMA

### 5.1 Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,           -- bcrypt hash
  role VARCHAR(20) DEFAULT 'user',               -- user, admin
  balance DECIMAL(10, 2) DEFAULT 0.00,
  
  -- Security fields
  failed_login_attempts INT DEFAULT 0,
  locked_until DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  verified_at DATETIME,
  
  -- Audit fields
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login DATETIME,
  
  UNIQUE KEY unique_email (email),
  UNIQUE KEY unique_username (username),
  INDEX idx_is_active (is_active),
  INDEX idx_created_at (created_at)
);
```

### 5.2 Refresh Tokens Table (Optional but Recommended)
```sql
CREATE TABLE refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,      -- Hash of token
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME,                          -- NULL = active
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),                       -- IPv4 or IPv6
  user_agent VARCHAR(255),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_revoked_at (revoked_at)
);
```

### 5.3 Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  used_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

### 5.4 Login Audit Table (Optional)
```sql
CREATE TABLE login_attempts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,                                   -- NULL for failed login before user found
  username VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  success BOOLEAN,
  reason VARCHAR(100),                          -- e.g., "INVALID_PASSWORD"
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_attempted_at (attempted_at),
  INDEX idx_success (success)
);
```

---

## 6. AUTHENTICATION FLOW - BACKEND PERSPECTIVE

```
┌─────────────────────────────────────────────────────────┐
│          BACKEND AUTHENTICATION FLOW                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Receive Login Request                             │
│     ├─ Validate input                                 │
│     ├─ Check if username exists                       │
│     ├─ Verify password hash                           │
│     ├─ Check if account locked (failed attempts)      │
│     └─ Check if email verified (optional)             │
│                                                         │
│  2. Generate Tokens                                   │
│     ├─ Create access token (15 min)                   │
│     ├─ Create refresh token (7 days)                  │
│     ├─ Hash refresh token                             │
│     └─ Store in database                              │
│                                                         │
│  3. Update User Record                                │
│     ├─ Reset failed_login_attempts                    │
│     ├─ Update last_login                              │
│     └─ Record in login_attempts table                 │
│                                                         │
│  4. Return Response                                   │
│     ├─ Send access token (in response body)           │
│     ├─ Send refresh token (in response or cookie)     │
│     ├─ Send user data                                 │
│     └─ Token expiration time                          │
│                                                         │
│  5. Authenticate Protected Requests                   │
│     ├─ Extract token from Authorization header        │
│     ├─ Verify JWT signature                           │
│     ├─ Check expiration                               │
│     ├─ Extract user ID from payload                   │
│     ├─ Load user from database                        │
│     └─ Proceed with request or error                  │
│                                                         │
│  6. Token Refresh Flow                                │
│     ├─ Validate refresh token                         │
│     ├─ Check if revoked                               │
│     ├─ Generate new access token                      │
│     ├─ Optionally rotate refresh token                │
│     └─ Return new tokens                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 7. SECURITY IMPLEMENTATION DETAILS

### 7.1 Password Hashing
```
Algorithm: bcrypt (recommended) or Argon2
Cost Factor: 10-12 (bcrypt)
Never store plain passwords
```

### 7.2 Token Storage (Server-Side)
```
Refresh tokens: Store hashed version in database
Revocation: Mark as revoked in database
Blacklist: For additional security (optional)
```

### 7.3 Failed Login Attempts
```
Max Attempts: 5 failed attempts
Lock Duration: 15 minutes
Lock Until: timestamp + 15 minutes
Reset: On successful login or after lock expires
Log: Store in login_attempts table for audit
```

### 7.4 Rate Limiting
```
Login Endpoint: 5 requests per minute per IP
Register Endpoint: 3 requests per 10 minutes per IP
Password Reset: 3 requests per hour per email
Use: Redis or database for tracking
```

### 7.5 Security Headers
```
CORS: Allow only specified frontend domain
HTTPS: Enforce in production
Content-Security-Policy: Prevent XSS
X-Frame-Options: DENY (prevent clickjacking)
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
```

---

## 8. BACKEND IMPLEMENTATION CHECKLIST

### Spring Boot (Java)
- [ ] Add Spring Security & JWT dependencies
- [ ] Create User entity with password hashing
- [ ] Implement AuthenticationManager
- [ ] Create JwtTokenProvider class
- [ ] Create AuthenticationController
- [ ] Implement custom UserDetailsService
- [ ] Add security filters (JwtAuthenticationFilter)
- [ ] Configure CORS
- [ ] Add input validation (javax.validation)
- [ ] Implement error handling

### Node.js (Express.js)
- [ ] Install express, jsonwebtoken, bcryptjs, passport
- [ ] Create User model/schema
- [ ] Create auth routes
- [ ] Implement JWT middleware
- [ ] Create token generation utility
- [ ] Add input validation (express-validator)
- [ ] Implement error handling middleware
- [ ] Configure CORS

### Python (Django/FastAPI)
- [ ] Install Django-rest-auth or FastAPI-jwt
- [ ] Create User model
- [ ] Implement authentication views/endpoints
- [ ] Configure CORS
- [ ] Add JWT backend configuration
- [ ] Implement token refresh logic
- [ ] Add input validation
- [ ] Error handling

---

## 9. API RESPONSE FORMAT STANDARD

All responses should follow this format:

```typescript
interface ApiResponse<T> {
  status: 'success' | 'error';           // Always present
  message: string;                        // User-friendly message
  code?: string;                          // Error code for specific errors
  data: T | null;                        // Response data or null
  errors?: Array<{                       // Validation errors (if applicable)
    field: string;
    message: string;
  }>;
  timestamp?: string;                    // ISO 8601 timestamp
  path?: string;                         // API endpoint called
  traceId?: string;                      // For debugging
}
```

### Success Response Example:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": { ... },
  "timestamp": "2026-04-19T10:30:00Z"
}
```

### Error Response Example:
```json
{
  "status": "error",
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [ ... ],
  "timestamp": "2026-04-19T10:30:00Z",
  "traceId": "abc123def456"
}
```

---

## 10. MIDDLEWARE REQUIRED

### 10.1 Authentication Middleware
```pseudocode
function authenticateToken(request, response, next):
  extract token from Authorization header
  if token not found:
    return 401 Unauthorized
  
  try:
    verify token signature and expiration
    decode token payload
    attach user info to request
    call next()
  catch InvalidTokenError:
    return 401 Unauthorized
```

### 10.2 Authorization Middleware
```pseudocode
function authorizeRole(requiredRole):
  return middleware function:
    if request.user.role == requiredRole:
      call next()
    else:
      return 403 Forbidden
```

### 10.3 Rate Limiting Middleware
```pseudocode
function rateLimiter(requests, windowMs):
  for each request:
    get client IP
    check request count for IP in time window
    if exceeded:
      return 429 Too Many Requests
    increment counter
    call next()
```

### 10.4 Input Validation Middleware
```pseudocode
function validateInput(schema):
  return middleware function:
    validate request body against schema
    if invalid:
      return 400 Bad Request with errors
    call next()
```

---

## 11. ENVIRONMENT VARIABLES (.env)

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-key-min-256-bits
JWT_REFRESH_SECRET=your-refresh-secret-key-min-256-bits
JWT_EXPIRATION=900                    # 15 minutes in seconds
JWT_REFRESH_EXPIRATION=604800         # 7 days in seconds

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your-db-password
DB_NAME=expense_tracker

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@expensetracker.com

# Server Configuration
SERVER_PORT=8080
NODE_ENV=development
FRONTEND_URL=http://localhost:4201

# Security
CORS_ORIGIN=http://localhost:4201
MAX_LOGIN_ATTEMPTS=5
LOCK_DURATION=900000              # 15 minutes in ms
```

---

## 12. TESTING ENDPOINTS

### Using cURL:

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john_doe","password":"SecurePassword123!"}'
```

**Register:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"jane_doe","email":"jane@example.com","password":"SecurePassword123!","confirmPassword":"SecurePassword123!","agreeToTerms":true}'
```

**Get Current User (Protected):**
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Refresh Token:**
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN_HERE"}'
```

---

## 13. POSTMAN COLLECTION SETUP

Create Postman collection with variables:
```
{{baseUrl}}       = http://localhost:8080/api
{{accessToken}}   = (captured from login response)
{{refreshToken}}  = (captured from login response)
```

Pre-request script to extract token:
```javascript
// For login endpoint, save token to variable
var response = pm.response.json();
pm.environment.set("accessToken", response.data.token);
pm.environment.set("refreshToken", response.data.refreshToken);
```

---

## 14. MONITORING & LOGGING

### 14.1 Log Events
- Successful login with timestamp and IP
- Failed login attempts
- Account lockout
- Password changes
- Token refresh
- Token revocation
- Account registration
- Suspicious activities

### 14.2 Monitoring
- Login failure rate
- Account lockout incidents
- Failed API requests
- Token expiration patterns
- API response times

---

## 15. IMPLEMENTATION ORDER (BACKEND)

### Week 1: Core Authentication
1. [ ] Setup database schema
2. [ ] Create User entity/model
3. [ ] Implement password hashing (bcrypt)
4. [ ] Create JWT token provider
5. [ ] Implement login endpoint
6. [ ] Implement authentication middleware
7. [ ] Test login flow

### Week 2: Additional Features
8. [ ] Implement registration endpoint
9. [ ] Implement token refresh endpoint
10. [ ] Implement logout endpoint (token revocation)
11. [ ] Create refresh token table/management
12. [ ] Add rate limiting
13. [ ] Implement failed login tracking

### Week 3: Security & Polish
14. [ ] Add input validation
15. [ ] Implement error handling
16. [ ] Add security headers
17. [ ] Password reset flow
18. [ ] Email verification
19. [ ] Comprehensive logging
20. [ ] Security audit & testing

---

## 16. FRONTEND & BACKEND INTEGRATION CHECKLIST

- [ ] Frontend uses correct API base URL
- [ ] Frontend sends JWT token in Authorization header
- [ ] Frontend handles 401 responses (token expired)
- [ ] Frontend automatically refreshes token
- [ ] Frontend redirects to login on 401
- [ ] Backend returns correct error codes
- [ ] Backend validates all inputs
- [ ] Backend hashes passwords
- [ ] Backend implements rate limiting
- [ ] Backend logs all auth events
- [ ] CORS configured correctly
- [ ] HTTPS enforced in production
- [ ] Environment variables used for secrets
- [ ] Database connections secured
- [ ] API documentation complete

---

## 17. API DOCUMENTATION EXAMPLES

### Using Swagger/OpenAPI:
```yaml
/api/auth/login:
  post:
    summary: User login
    description: Authenticate user and return JWT tokens
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              username:
                type: string
                minLength: 3
              password:
                type: string
                minLength: 6
    responses:
      200:
        description: Login successful
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginResponse'
      401:
        description: Invalid credentials
      400:
        description: Validation error
```

---

## 18. NEXT STEPS

1. **Choose Technology Stack** (Spring Boot, Node.js, Django, etc.)
2. **Setup Database** (MySQL, PostgreSQL, etc.)
3. **Configure Environment**
4. **Implement Core Authentication Service**
5. **Create Login Endpoint**
6. **Test Endpoints** (Postman/cURL)
7. **Frontend Integration**
8. **Security Audit**
9. **Production Deployment**

---

## 19. QUICK START TEMPLATE

### Spring Boot Example Structure:
```
src/main/java/com/expensetracker/
├── config/
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   └── CorsConfig.java
├── controller/
│   └── AuthController.java
├── service/
│   ├── AuthService.java
│   ├── JwtTokenProvider.java
│   └── UserService.java
├── repository/
│   ├── UserRepository.java
│   └── RefreshTokenRepository.java
├── entity/
│   ├── User.java
│   └── RefreshToken.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── CustomUserDetailsService.java
│   └── JwtAuthenticationEntryPoint.java
├── exception/
│   ├── AuthException.java
│   └── GlobalExceptionHandler.java
└── dto/
    ├── LoginRequest.java
    ├── LoginResponse.java
    ├── UserDTO.java
    └── ApiResponse.java
```

---

Done! This is a complete backend API plan that coordinates perfectly with the frontend login system plan. 

**Would you like me to:**
1. Create a specific backend implementation (Spring Boot, Node.js, etc.)?
2. Create API documentation (Swagger/OpenAPI)?
3. Create a Postman collection for testing?
4. Update the frontend to match these endpoints?
