# Login System Flow Plan - Expense Tracker

## 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Visit → Login Page → Enter Credentials → Submit        │
│                                ↓                            │
│                         Validate Input                       │
│                                ↓                            │
│                    Call Auth Service                         │
│                                ↓                            │
│         ┌────────────────────┬─────────────────┐            │
│         ↓                    ↓                 ↓             │
│    Success            Invalid Creds         Error           │
│         │                    │                 │            │
│         ↓                    ↓                 ↓             │
│    Save Token          Show Error          Retry           │
│    Save User           Clear Form                           │
│    Navigate                                                  │
│    to App                                                    │
│         │                                                    │
│         ↓                                                    │
│    Authenticated User (Protected Routes)                    │
│         ↓                                                    │
│    Use JWT Token in all API Requests                        │
│         │                                                    │
│         ├─→ Request Header: Authorization: Bearer {token}   │
│         ├─→ Refresh Token if Expired                        │
│         └─→ Show Expense Dashboard                          │
│                                                              │
│  Logout → Clear Token → Clear User → Redirect to Login      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. NEW SERVICES REQUIRED

### 2.1 Authentication Service (`auth.service.ts`)
**Responsibilities:**
- Handle login/logout
- Manage JWT tokens (store, retrieve, refresh)
- Manage current user state
- Validate token expiration
- Make API calls for authentication

**Key Methods:**
```typescript
- login(username: string, password: string): Observable<LoginResponse>
- logout(): void
- isAuthenticated(): boolean
- getToken(): string | null
- setToken(token: string): void
- getCurrentUser(): User | null
- setCurrentUser(user: User): void
- refreshToken(): Observable<TokenResponse>
- hasRole(role: string): boolean
```

### 2.2 Auth Interceptor (`auth.interceptor.ts`)
**Responsibilities:**
- Add JWT token to all outgoing HTTP requests
- Handle 401 Unauthorized responses
- Refresh expired tokens automatically
- Redirect to login on token failure

**Features:**
- Intercept all HTTP requests
- Add `Authorization: Bearer {token}` header
- Handle token refresh logic
- Retry failed requests after token refresh

### 2.3 Auth Guard (`auth.guard.ts`)
**Responsibilities:**
- Protect routes that require authentication
- Redirect unauthenticated users to login
- Prevent unauthorized access

**Guard Types:**
- `AuthGuard`: Checks if user is authenticated
- `RoleGuard`: Checks if user has specific role (optional)

---

## 3. NEW MODELS/INTERFACES

### 3.1 Authentication Models
```typescript
// login-request.model.ts
export interface LoginRequest {
  username: string;
  password: string;
}

// login-response.model.ts
export interface LoginResponse {
  token: string;           // JWT Token
  refreshToken?: string;   // Refresh token (optional)
  user: User;
  expiresIn: number;       // Token expiration in seconds
}

// token-response.model.ts
export interface TokenResponse {
  token: string;
  expiresIn: number;
}

// Updated User Model
export interface User {
  balance: number;
  email: string;
  role: string;
  username: string;
  password?: string;  // Only in requests, not stored
}
```

---

## 4. NEW COMPONENTS REQUIRED

### 4.1 Login Component (`src/app/components/login/`)
**Files:**
- `login.ts` - Component logic
- `login.html` - Template
- `login.css` - Styling
- `login.spec.ts` - Tests

**Features:**
- Username/email input field
- Password input field
- "Remember Me" checkbox (optional)
- Submit button
- Error message display
- Loading state
- Link to registration (if applicable)
- Forgot password link (if applicable)

**Form Validation:**
- Username: required, min 3 chars
- Password: required, min 6 chars
- Real-time validation feedback
- Submit button disabled until valid

**Styling:**
- Mobile-responsive (same as expense tracker)
- Dark theme consistent with app
- Centered modal/card layout
- Professional appearance
- Error highlighting

### 4.2 Register Component (Optional) (`src/app/components/register/`)
**Files:**
- `register.ts`
- `register.html`
- `register.css`

**Features:**
- Username input
- Email input
- Password input
- Confirm password
- Terms & conditions checkbox
- Form validation
- Submit button
- Link to login page

---

## 5. UPDATED ROUTES

```typescript
// app.routes.ts
export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Protected routes (require authentication)
  { 
    path: '', 
    component: Expense,
    canActivate: [AuthGuard]
  },
  { 
    path: 'dashboard-user', 
    component: DashboardUser,
    canActivate: [AuthGuard]
  },
  
  // Wildcard route
  { path: '**', redirectTo: '/login' }
];
```

---

## 6. STORAGE STRATEGY

### 6.1 Token Storage
**Option 1: LocalStorage (Simpler)**
```typescript
localStorage.setItem('auth_token', token);
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('token_expiry', expiryTime);
```

**Option 2: SessionStorage + Secure HTTP-only Cookies (More Secure)**
```typescript
// Backend should set this
Set-Cookie: jwt_token=...; HttpOnly; Secure; SameSite=Strict
```

**Recommended:** Start with LocalStorage, can upgrade later

### 6.2 Clear Storage on Logout
```typescript
localStorage.removeItem('auth_token');
localStorage.removeItem('user');
localStorage.removeItem('token_expiry');
sessionStorage.clear();
```

---

## 7. ERROR HANDLING

### 7.1 Login Error Cases
```
1. Invalid Username/Password → Show "Invalid credentials" message
2. Account Locked → Show "Account is locked" message
3. Network Error → Show "Connection error, please try again"
4. Server Error (5xx) → Show "Server error, please try later"
5. Validation Error → Show specific field errors
```

### 7.2 Token Error Cases
```
1. Token Expired → Auto-refresh or redirect to login
2. Invalid Token → Redirect to login
3. Token Not Found → Redirect to login
```

---

## 8. IMPLEMENTATION STEPS

### Phase 1: Create Core Auth Service
- [ ] Create `auth.service.ts` with basic login/logout
- [ ] Create login request/response models
- [ ] Implement token storage logic
- [ ] Add getCurrentUser() and isAuthenticated() methods

### Phase 2: Create Login Component
- [ ] Create login component with form
- [ ] Add form validation
- [ ] Add error handling
- [ ] Add loading state
- [ ] Style with mobile responsiveness
- [ ] Add remember-me functionality (optional)

### Phase 3: Create Auth Guard & Interceptor
- [ ] Create `auth.guard.ts`
- [ ] Create `auth.interceptor.ts`
- [ ] Add interceptor to app.config.ts
- [ ] Implement token refresh logic

### Phase 4: Update Routes & Navigation
- [ ] Update `app.routes.ts` with auth guard
- [ ] Update navbar to show login/logout
- [ ] Redirect unauthenticated users to login
- [ ] Clear auth state on logout

### Phase 5: Testing & Security
- [ ] Unit tests for auth service
- [ ] Unit tests for login component
- [ ] E2E tests for login flow
- [ ] Security audit
- [ ] Test token refresh
- [ ] Test role-based access

---

## 9. SECURITY CONSIDERATIONS

### 9.1 Best Practices
- ✓ Never store passwords in localStorage
- ✓ Use HTTPS only in production
- ✓ Validate all inputs server-side
- ✓ Use secure HTTP-only cookies for tokens (future)
- ✓ Implement CSRF protection
- ✓ Add rate limiting on login attempts
- ✓ Hash passwords on backend (bcrypt)
- ✓ Use strong JWT signing algorithm (HS256 or RS256)
- ✓ Set short token expiration time (15-30 mins)
- ✓ Implement refresh token rotation

### 9.2 Password Requirements
- Minimum 6 characters
- At least 1 number
- At least 1 special character (optional, for strength)
- Clear strength indicator

### 9.3 Login Attempt Limits
- Show error after 3 failed attempts
- Optional: Temporary account lockout
- Optional: Send security alert email

---

## 10. API ENDPOINTS EXPECTED

```
Backend API Endpoints:

POST /api/auth/login
Request: { username, password }
Response: { token, refreshToken, user, expiresIn }
Status: 200 OK | 401 Unauthorized | 400 Bad Request

POST /api/auth/logout
Request: {}
Response: { message: "Logged out successfully" }
Status: 200 OK

POST /api/auth/refresh
Request: { refreshToken }
Response: { token, expiresIn }
Status: 200 OK | 401 Unauthorized

GET /api/auth/me (Optional)
Request: Authorization: Bearer {token}
Response: { user }
Status: 200 OK | 401 Unauthorized

POST /api/auth/register (Optional)
Request: { username, email, password, confirmPassword }
Response: { user, token }
Status: 201 Created | 400 Bad Request
```

---

## 11. STATE MANAGEMENT

### 11.1 Using Angular Signals (Current Setup)
```typescript
// auth.service.ts
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  private isAuthenticatedSignal = signal(false);
  private loadingSignal = signal(false);
  
  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  isLoading = this.loadingSignal.asReadonly();
}
```

### 11.2 Login Component State
```typescript
export class LoginComponent {
  form = signal({
    username: '',
    password: '',
    rememberMe: false
  });
  
  errors = signal<string>('');
  isLoading = signal(false);
}
```

---

## 12. UI/UX FLOW

### 12.1 Login Page Layout (Mobile-First)
```
┌─────────────────────────────────┐
│    EXPENSE TRACKER              │
│    Login                        │
├─────────────────────────────────┤
│                                 │
│  [Username/Email Input]         │
│                                 │
│  [Password Input]               │
│                                 │
│  ☐ Remember Me                  │
│                                 │
│  [Login Button]                 │
│                                 │
│  Don't have account?            │
│  Sign Up | Forgot Password      │
│                                 │
│  [Error Message if exists]      │
│                                 │
└─────────────────────────────────┘
```

### 12.2 User Flow After Login
1. User logs in successfully
2. Token & user stored in localStorage
3. Redirected to home (/expense dashboard)
4. Navbar shows logged-in user name
5. Navbar shows logout button
6. All API requests include JWT token

---

## 13. RESPONSIVE DESIGN STRATEGY

Same as expense tracker refactoring:
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Login form: max-w-sm on mobile, max-w-md on desktop
- Centered on all screen sizes
- Touch-friendly buttons (44px minimum)
- Password strength indicator responsive

---

## 14. TESTING STRATEGY

### 14.1 Unit Tests
```
auth.service.spec.ts
- login() success/failure cases
- logout() clears state
- isAuthenticated() returns correct value
- token storage and retrieval
- token expiration check

login.component.spec.ts
- form validation
- submit calls auth service
- error message display
- loading state management
- redirect after login

auth.guard.spec.ts
- allows authenticated users
- denies unauthenticated users
- redirects to login
```

### 14.2 E2E Tests
```
- Full login flow
- Invalid credentials
- Remember me functionality
- Token refresh
- Logout functionality
- Protected route access
- Expired token handling
```

---

## 15. MIGRATION CHECKLIST

- [ ] Update User model with optional password
- [ ] Create LoginRequest, LoginResponse, TokenResponse models
- [ ] Create auth.service.ts
- [ ] Create auth.interceptor.ts
- [ ] Create auth.guard.ts
- [ ] Create login component (HTML, TS, CSS)
- [ ] Create login.spec.ts
- [ ] Update app.routes.ts
- [ ] Update app.config.ts with interceptor
- [ ] Update navbar component (add logout button)
- [ ] Update app.html to add login link
- [ ] Redirect root path to login if not authenticated
- [ ] Add remember me functionality
- [ ] Add password forgot/reset (optional)
- [ ] Add email verification (optional)
- [ ] Implement token refresh mechanism
- [ ] Add security headers
- [ ] Test on mobile, tablet, desktop
- [ ] Security audit
- [ ] Add error logging
- [ ] Documentation

---

## 16. OPTIONAL ENHANCEMENTS

1. **Two-Factor Authentication (2FA)**
   - SMS verification
   - Google Authenticator
   - Email verification

2. **Social Login**
   - Google OAuth
   - Facebook Login
   - GitHub Sign In

3. **Password Management**
   - Forgot password flow
   - Reset password email
   - Change password
   - Password strength indicator

4. **Session Management**
   - Multiple device login
   - Session timeout warning
   - Force logout from other devices

5. **Audit Logging**
   - Log login attempts
   - Log failed attempts
   - Track suspicious activity

---

## 17. ESTIMATED TIMELINE

- **Phase 1 (Core Auth Service)**: 1-2 hours
- **Phase 2 (Login Component)**: 2-3 hours
- **Phase 3 (Auth Guard & Interceptor)**: 1-2 hours
- **Phase 4 (Routes & Navigation)**: 1-2 hours
- **Phase 5 (Testing & Polish)**: 2-3 hours

**Total: 7-12 hours** (depending on complexity)

---

## NEXT STEPS

1. Confirm API endpoints with backend team
2. Decide on token storage strategy
3. Determine refresh token implementation
4. Finalize password requirements
5. Approve UI mockups
6. Start Phase 1 implementation

Would you like me to proceed with implementing any specific phase?
